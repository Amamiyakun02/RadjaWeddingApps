import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.seed import seed_database
from app.api.v1.auth import router as auth_router
from app.api.v1.public import router as public_router
from app.api.v1.customer import router as customer_router
from app.api.v1.admin import router as admin_router
from app.api.v1.ai import router as ai_router
from app.api.v1.calendar import router as calendar_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run auto database seed & setup
    try:
        seed_database()
    except Exception as e:
        print(f"Startup DB init warning: {e}")
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API untuk Sistem Manajemen Sewa Rias, Busana Pengantin, & Properti Event Radja Wedding",
    version="1.5.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Modular Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(public_router, prefix="/api/v1")
app.include_router(customer_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(calendar_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "1.5.0",
        "documentation": "/docs",
        "official_domain": "salonradja.com"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "radja-wedding-backend"}
