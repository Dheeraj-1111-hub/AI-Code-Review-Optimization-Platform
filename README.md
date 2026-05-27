# DevLens AI

<div align="center">
  <h3>A distributed, multi-agent Engineering Intelligence Platform</h3>
  <p>Real-time AI code reviews, Architecture Drift detection, and Collaborative RAG Memory.</p>
</div>

---

## 🚀 The Vision

DevLens is not just another "AI wrapper." It is a fully distributed, scalable engineering operating system designed to analyze repositories, detect deep architectural flaws, and enforce team coding standards using Retrieval-Augmented Generation (RAG).

## 🧠 Core Architecture

DevLens leverages a sophisticated microservices architecture to handle heavy AI workloads without blocking the main event loop.

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, TanStack Router.
- **Backend API:** Node.js, Express, MongoDB (Atlas).
- **AI Service:** Python, FastAPI, Groq (Llama 3), ChromaDB.
- **Infrastructure:** Docker, Nginx Reverse Proxy, Redis Pub/Sub, BullMQ.

### The Multi-Agent Pipeline

When a review is triggered, DevLens does not send the code to a single LLM. It utilizes `asyncio.gather` to concurrently spin up 4 specialized agents:
1. **Security Agent:** Scans for OWASP vulnerabilities.
2. **Performance Agent:** Detects O(N^2) loops and memory leaks.
3. **Architecture Agent:** Analyzes modularity and dependency drift.
4. **Clean Code Agent:** Enforces DRY principles and naming conventions.

*See [`docs/ai-system/rag-architecture.md`](./docs/ai-system/rag-architecture.md) for details on how we inject team memory into these agents.*

## ⚡ Scalable Infrastructure

To handle massive repositories, DevLens utilizes **BullMQ** and **Redis**. 
Heavy AI processing is completely decoupled from the Node.js API. The Python workers stream partial Server-Sent Events (SSE) back to Node, which then broadcasts them to the React frontend via WebSockets in real-time.

*See [`docs/scaling/queue-infrastructure.md`](./docs/scaling/queue-infrastructure.md) for sequence diagrams.*

## 🔒 Security Hardening

- **Prompt Injection Defense:** Python middleware actively scans and rejects malicious LLM prompts (e.g., "ignore previous instructions").
- **Repository Sandboxing:** Strict validation rejects binary blobs and executable uploads.
- **RBAC:** Full Role-Based Access Control enforcing `Admin`, `Reviewer`, and `Viewer` permissions.

## 🏃‍♂️ Running Locally

1. Clone the repository.
2. Add your `.env` variables (Groq API, MongoDB URI).
3. Run `docker-compose up --build`.
4. Access the platform at `http://localhost`.
