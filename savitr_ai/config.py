from os import getenv
from dotenv import load_dotenv


load_dotenv()


class Config:
    FLASK_DEBUG = getenv("FLASK_DEBUG", False)
    FLASK_RUN_HOST = getenv("FLASK_RUN_HOST", "0.0.0.0")
    FLASK_RUN_PORT = getenv("FLASK_RUN_PORT", 5000)
    SECRET_KEY = getenv("SECRET_KEY", "dev-secret-key-for-flask-app")