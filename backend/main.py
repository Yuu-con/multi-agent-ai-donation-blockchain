from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import alerts, blockchain, campaigns, dashboard, transactions


models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hệ thống giám sát quyên góp đa tác nhân AI",
    description="Backend API quản lý quyên góp Blockchain và chấm điểm rủi ro giao dịch bất thường.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaigns.router)
app.include_router(transactions.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)
app.include_router(blockchain.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Multi-Agent Donation Abnormality Detection API is running.",
        "docs_url": "/docs",
    }
