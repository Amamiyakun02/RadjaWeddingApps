from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import settings
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    require_customer_user, require_admin_user
)
from app.models.models import User, Admin
from app.schemas.schemas import (
    UserRegisterRequest, UserLoginRequest, GoogleLoginRequest,
    VerifyOtpRequest, CompleteProfileRequest, AdminLoginRequest,
    TokenResponse, UserProfileResponse, AdminProfileResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- Customer Authentication ---

@router.post("/register", response_model=TokenResponse)
def register_customer(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar. Silakan gunakan email lain atau login."
        )
    
    user = User(
        name=payload.name,
        email=payload.email,
        whatsapp=payload.whatsapp,
        address=payload.address,
        password_hash=get_password_hash(payload.password),
        is_registered=True,
        is_whatsapp_verified=True if settings.WA_GATEWAY_MOCK else False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id, "email": user.email, "type": "customer", "role": "customer"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserProfileResponse.model_validate(user),
        "role": "customer"
    }

@router.post("/login", response_model=TokenResponse)
def login_customer(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi tidak valid"
        )
    
    token = create_access_token({"sub": user.id, "email": user.email, "type": "customer", "role": "customer"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserProfileResponse.model_validate(user),
        "role": "customer"
    }

@router.post("/google", response_model=TokenResponse)
def login_google_customer(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Lazy Registration Flow for Google OAuth
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Create draft account
        user = User(
            google_id=payload.google_id,
            email=payload.email,
            name=payload.name,
            is_registered=False, # Needs WhatsApp & Address completion
            is_whatsapp_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.google_id:
            user.google_id = payload.google_id
            db.commit()
            db.refresh(user)
            
    token = create_access_token({"sub": user.id, "email": user.email, "type": "customer", "role": "customer"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserProfileResponse.model_validate(user),
        "role": "customer"
    }

@router.post("/verify-otp")
def verify_whatsapp_otp(
    payload: VerifyOtpRequest,
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    """
    Simulated OTP Verification
    """
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
    # In mock mode, any 6-digit code or default '123456' works
    if payload.otp in ["123456", settings.DEFAULT_TEST_OTP] or settings.WA_GATEWAY_MOCK:
        user.whatsapp = payload.whatsapp
        user.is_whatsapp_verified = True
        user.is_registered = True
        db.commit()
        db.refresh(user)
        return {"status": "success", "message": "Nomor WhatsApp berhasil diverifikasi"}
    else:
        raise HTTPException(status_code=400, detail="Kode OTP salah atau kedaluwarsa")

@router.post("/complete-profile", response_model=UserProfileResponse)
def complete_profile(
    payload: CompleteProfileRequest,
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
    user.whatsapp = payload.whatsapp
    user.address = payload.address
    user.is_registered = True
    user.is_whatsapp_verified = True
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserProfileResponse)
def get_customer_me(
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return user

# --- Admin Authentication ---

@router.post("/admin/login", response_model=TokenResponse)
def login_admin(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == payload.email).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kredensial Admin tidak valid"
        )
        
    token = create_access_token({
        "sub": admin.id,
        "email": admin.email,
        "name": admin.full_name,
        "type": "admin",
        "role": admin.role # 'owner' or 'staff'
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": AdminProfileResponse.model_validate(admin),
        "role": admin.role
    }

@router.get("/admin/me", response_model=AdminProfileResponse)
def get_admin_me(
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(Admin.id == current_admin["sub"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin tidak ditemukan")
    return admin
