from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.config.settings import settings
from app.db.database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="DevLens AI Engine",
    description="Multi-Agent AI Review Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "DevLens AI Engine"}

from app.api.routes import review, pr, analytics, copilot

app.include_router(review.router, prefix="/api/v1", tags=["Analyze"])
app.include_router(pr.router, prefix="/api/v1", tags=["Analyze PR"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["Copilot"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
