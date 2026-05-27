import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    GROQ_API_KEY: str = ""
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    MONGO_URI: str = "mongodb+srv://ysaidheeraj1111_db_user:tfzZj3FwvBJ3o0Bh@cluster0.fgrqzxc.mongodb.net/"

    class Config:
        env_file = ".env"

settings = Settings()
