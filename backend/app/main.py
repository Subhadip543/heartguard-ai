from fastapi import FastAPI

app = FastAPI(
    title="HeartGuard AI API",
    description="Backend API for the HeartGuard AI heart disease risk assessment system.",
    version="0.1.0",
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "heartguard-ai-api",
    }