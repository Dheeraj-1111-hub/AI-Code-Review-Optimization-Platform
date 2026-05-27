# DevLens System Architecture

DevLens is built on a highly scalable, containerized microservices architecture designed to handle concurrent AI workloads securely.

## High-Level Infrastructure

This diagram illustrates the Docker container orchestration and reverse proxy routing layer.

```mermaid
graph TD
    Client((Client Web/Mobile)) -->|HTTPS| Nginx[Nginx Reverse Proxy\n:80]
    
    subfront[Frontend Service\nVite + React]
    subback[Backend Service\nNode.js + Express]
    subai[AI Service\nPython + FastAPI]
    
    Nginx -->| / | subfront
    Nginx -->| /api/* | subback
    Nginx -->| /ai/* | subai
    Nginx -->| /socket.io/* | subback
    
    subback <-->|Mongoose| Mongo[(MongoDB)]
    subback <-->|BullMQ / PubSub| Redis[(Redis)]
    
    subai <-->|Cache| Redis
    subai <-->|Semantic Search| Chroma[(ChromaDB Vector Store)]
    subai <-->|Groq API| ExternalLLM((Groq / Llama3))
```

## AI Review Queue Pipeline

This diagram shows how DevLens offloads heavy AI reviews from the synchronous request lifecycle to prevent API timeouts.

```mermaid
sequenceDiagram
    participant User
    participant Nginx
    participant Backend
    participant RedisQueue
    participant AIService
    
    User->>Nginx: POST /api/reviews (Trigger Review)
    Nginx->>Backend: Forward Request
    Backend->>RedisQueue: Enqueue Review Job
    Backend-->>User: 202 Accepted (jobId)
    
    RedisQueue->>Backend: Worker Picks Up Job
    Backend->>AIService: Request Multi-Agent Analysis
    
    loop Server-Sent Events (SSE)
        AIService-->>Backend: Stream partial tokens
        Backend-->>Nginx: Socket.io broadcast
        Nginx-->>User: Render live text
    end
    
    AIService-->>Backend: Final Analysis JSON
    Backend->>Mongo: Persist Results
```
