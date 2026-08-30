from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://aicoach:aicoach@localhost:5432/aicoach"
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:5173"]

    jwt_secret_key: str = "dev-insecure-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


settings = Settings()
