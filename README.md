<div align="center">
  
  # 🚀 DevLens AI
  **A Distributed, Multi-Agent Engineering Intelligence Platform**
  
  <p align="center">
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI" /></a>
    <a href="https://groq.com/"><img src="https://img.shields.io/badge/Groq_LLM-f55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  </p>

  <p>
    Real-time AI code reviews, Architecture Drift detection, and PR Simulation.
  </p>
</div>

---

## 🌟 The Vision

DevLens is a scalable engineering operating system designed to deeply analyze repositories, detect architectural flaws, and enforce team coding standards. It transcends traditional static analysis by employing a distributed **Multi-Agent AI Pipeline** that reviews code concurrently across multiple domains (Security, Performance, Clean Code).

---

## 🏗️ Core Architecture

DevLens leverages a sophisticated microservices architecture to handle heavy AI workloads without blocking the main event loop, providing real-time streaming feedback to the client.

### Tech Stack Breakdown
* **Frontend:** React, Vite, Tailwind CSS, Framer Motion, TanStack Router & Query, Clerk Auth.
* **Backend API:** Node.js, Express, MongoDB (Atlas), Socket.io.
* **AI Engine:** Python, FastAPI, Groq (Llama-3), Asyncio.

### 🧠 The Multi-Agent Pipeline

When a review is triggered, DevLens utilizes Python's `asyncio.gather` to concurrently spin up specialized AI agents:
1. 🛡️ **Security Agent:** Scans for OWASP vulnerabilities and insecure data handling.
2. ⚡ **Performance Agent:** Detects $O(N^2)$ loops, memory leaks, and inefficient queries.
3. 🏗️ **Architecture Agent:** Analyzes modularity and dependency drift.
4. ✨ **Clean Code Agent:** Enforces DRY principles and naming conventions.

### ⚡ Scalable Infrastructure
Heavy AI processing is completely decoupled from the Node.js API. The Python workers process the ML tasks and stream partial Server-Sent Events (SSE) back to Node, which then broadcasts them to the React frontend via WebSockets in real-time.

---

## 🔒 Security Hardening

- **Prompt Injection Defense:** Python middleware actively scans and rejects malicious LLM prompts (e.g., "ignore previous instructions").
- **Repository Sandboxing:** Strict validation rejects binary blobs and executable uploads.
- **RBAC:** Full Role-Based Access Control enforcing isolated Workspace boundaries.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (3.10+)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
* [Clerk](https://clerk.com/) Account (For Authentication)
* [Groq](https://groq.com/) API Key (For LLM Inference)

### 1. Clone the repository
```bash
git clone https://github.com/Dheeraj-1111-hub/AI-Code-Review-Optimization-Platform.git
cd AI-Code-Review-Optimization-Platform
```

### 2. Set up Environment Variables
You will need to create `.env` files in each of the three service directories (`frontend`, `backend`, `ai-service`). 
*(Refer to the respective `.env.example` files if available).*

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
AI_SERVICE_URL=http://localhost:8000
```

**AI Service (`ai-service/.env`):**
```env
GROQ_API_KEY=your_groq_api_key
```

### 3. Install Dependencies & Run

You will need three separate terminal windows to run the microservices locally.

**Terminal 1: Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2: AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 3: Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App
Visit `http://localhost:5173` in your browser to access the DevLens platform!

---
<div align="center">
  <i>Built for the modern engineering team.</i>
</div>
