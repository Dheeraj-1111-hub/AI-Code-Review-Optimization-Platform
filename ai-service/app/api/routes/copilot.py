import json
import asyncio
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from app.services.groq_service import client
from app.db.database import get_db
from bson import ObjectId
from typing import List, Dict, Any

router = APIRouter()

async def execute_tool(tool_name: str, args: dict, context: dict, workspace_id: str) -> str:
    """Execute real RAG queries against the MongoDB instance."""
    db = get_db()
    
    try:
        if tool_name == "get_repository_health":
            # If repo is in context, try to match it, otherwise just summarize all repos for workspace
            repo_id = args.get("repository_id") or context.get("repositoryId")
            
            query = {"workspaceId": ObjectId(workspace_id)}
            if repo_id and ObjectId.is_valid(repo_id):
                query["_id"] = ObjectId(repo_id)
                
            repos = await db.repositories.find(query).to_list(10)
            
            if not repos:
                return json.dumps({"error": "No repositories found."})
                
            result = []
            for r in repos:
                result.append({
                    "name": r.get("name"),
                    "health_score": r.get("healthScore", 0),
                    "language": r.get("language", "Unknown"),
                    "vulnerabilities": r.get("metrics", {}).get("securityVulnerabilities", 0),
                    "code_smells": r.get("metrics", {}).get("codeSmells", 0)
                })
            return json.dumps({"repositories": result})
            
        elif tool_name == "search_recent_reviews":
            reviews = await db.reviews.find({"workspaceId": ObjectId(workspace_id)}).sort("createdAt", -1).limit(5).to_list(5)
            
            if not reviews:
                return json.dumps({"error": "No recent reviews found."})
                
            result = []
            for r in reviews:
                result.append({
                    "title": r.get("title", r.get("prTitle")),
                    "status": r.get("status"),
                    "score": r.get("score"),
                    "issues": len(r.get("issues", [])),
                    "url": r.get("prUrl")
                })
            return json.dumps({"recent_reviews": result})
            
        elif tool_name == "get_security_findings":
            query = {"workspaceId": ObjectId(workspace_id)}
            review_id = args.get("review_id") or context.get("reviewId")
            
            if review_id and ObjectId.is_valid(review_id):
                query["_id"] = ObjectId(review_id)
                
            reviews = await db.reviews.find(query).sort("createdAt", -1).limit(5).to_list(5)
            
            security_issues = []
            for r in reviews:
                for issue in r.get("issues", []):
                    if issue.get("severity") in ["critical", "high"]:
                        security_issues.append({
                            "review_title": r.get("title", r.get("prTitle")),
                            "file": issue.get("file"),
                            "severity": issue.get("severity"),
                            "description": issue.get("message")
                        })
                        
            return json.dumps({"critical_and_high_vulnerabilities": security_issues})
            
        elif tool_name == "analyze_pr_metrics":
            # Aggregate review data for the workspace
            pipeline = [
                {"$match": {"workspaceId": ObjectId(workspace_id)}},
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "avg_score": {"$avg": "$score"}
                }}
            ]
            stats = await db.reviews.aggregate(pipeline).to_list(None)
            return json.dumps({"review_statistics": stats})
            
        elif tool_name == "get_workspace_analytics":
            # Fetch the latest analytics snapshot for the workspace (or global if workspaceId is missing)
            snapshot = await db.analyticssnapshots.find_one(
                {"$or": [
                    {"workspaceId": ObjectId(workspace_id)},
                    {"workspaceId": {"$exists": False}}
                ]},
                sort=[("generatedAt", -1)]
            )
            if not snapshot:
                return json.dumps({"error": "No analytics snapshot found for this workspace."})
            
            return json.dumps({
                "qualityScore": snapshot.get("qualityScore"),
                "architectureScore": snapshot.get("architectureScore"),
                "performanceScore": snapshot.get("performanceScore"),
                "vulnerabilities": snapshot.get("vulnerabilities"),
                "complexity": snapshot.get("complexity"),
                "recurringMistakes": snapshot.get("recurringMistakes"),
                "dna": snapshot.get("dna")
            })

    except Exception as e:
        return json.dumps({"error": f"Tool execution failed: {str(e)}"})
        
    return json.dumps({"error": "tool not found"})

async def copilot_stream_generator(message: str, history: List[Dict[str, str]], context: Dict[str, Any], workspace_id: str):
    """
    Generator that handles the streaming of AI tokens and simulated/actual tool calls.
    We will use standard SSE formatting so the frontend can parse `data: {...}`
    """
    
    # 1. System Prompt configuration based on context
    context_str = json.dumps(context, indent=2)
    system_prompt = f"""You are the DevLens AI Engineering Copilot. You are an expert code reviewer, architect, and security analyst.
You have access to live repository context and tools. You must provide deep engineering intelligence.

Current Page/Context:
{context_str}

Workspace ID: {workspace_id}

If the user asks about the current page, use the context provided.
You are interacting in a markdown-supported chat interface. Be precise and professional.

CRITICAL RULES:
1. You may ONLY use the tools explicitly provided to you in this request.
2. NEVER attempt to call 'brave_search' or any web search tool.
3. If the user asks about their overall security score, health score, or workspace metrics (especially when context is '/dashboard'), use the 'get_workspace_analytics' tool to fetch the aggregated dashboard data.
4. If a tool you need is missing, answer based on your general knowledge and state that you cannot access live data for that specific request.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Format history
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": message})

    # Available tools for the LLM
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_repository_health",
                "description": "Get the health score and recent trends for a repository.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "repository_id": {"type": "string", "description": "ID of the repository"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_recent_reviews",
                "description": "Search for recent PR reviews in the workspace.",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_security_findings",
                "description": "Get security vulnerabilities for a given review or repo.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "review_id": {"type": "string"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "analyze_pr_metrics",
                "description": "Analyze pull request and code review metrics for architectural patterns and flaws.",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_workspace_analytics",
                "description": "Get the overall workspace analytics snapshot including quality score, architecture score, and total vulnerabilities.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "workspace_id": {"type": "string", "description": "The workspace ID, leave empty if not known"}
                    }
                }
            }
        }
    ]

    try:
        # First call to see if the LLM wants to use a tool
        # We use a tool-supporting model. Groq supports tools in llama3-70b-8192
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.2,
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            # LLM decided to call a tool.
            messages.append(response_message)
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                # Emit a tool_call event to the client so UI can show a spinner!
                yield f"data: {json.dumps({'type': 'tool_call', 'tool': function_name})}\n\n"
                
                # Execute the tool
                function_response = await execute_tool(function_name, function_args, context, workspace_id)
                
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": function_response,
                })
                
                # Simulate network delay for realism
                await asyncio.sleep(0.5)

            # Second call to get the final streaming response
            stream = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                stream=True,
                temperature=0.2,
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"
                    
        else:
            # No tool calls, just stream the response
            stream = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                stream=True,
                temperature=0.2,
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"


@router.post("/chat")
async def copilot_chat(request: Request):
    """
    Expects JSON body:
    {
       "message": "...",
       "history": [{"role": "user", "content": "..."}],
       "context": {"currentPage": "/reviews/123", ...},
       "workspaceId": "..."
    }
    """
    body = await request.json()
    message = body.get("message")
    history = body.get("history", [])
    context = body.get("context", {})
    workspace_id = body.get("workspaceId")

    if not message or not workspace_id:
        raise HTTPException(status_code=400, detail="message and workspaceId are required")

    return StreamingResponse(
        copilot_stream_generator(message, history, context, workspace_id),
        media_type="text/event-stream"
    )
