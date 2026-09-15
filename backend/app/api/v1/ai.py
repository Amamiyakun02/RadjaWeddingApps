import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import require_admin_user
from app.models.models import Session as DBSession, Message as DBMessage, Admin
from app.schemas.schemas import (
    AIChatRequest, AIChatResponse,
    AdminAICommandRequest, AdminAICommandResponse
)
from app.services.ai_service import consult_kirana_ai, execute_admin_ai_command

router = APIRouter(prefix="/ai", tags=["AI Assistants"])

@router.post("/kirana/chat", response_model=AIChatResponse)
async def chat_with_kirana(payload: AIChatRequest, db: Session = Depends(get_db)):
    """
    Public / Customer AI Wedding & Event Consultant ("Kirana")
    """
    session_token = payload.session_token
    session = None
    
    if session_token:
        session = db.query(DBSession).filter(DBSession.session_token == session_token).first()
        
    if not session:
        session_token = str(uuid.uuid4())
        session = DBSession(
            session_token=session_token,
            customer_whatsapp=payload.customer_whatsapp,
            is_active=True
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
    # Save user message
    user_msg = DBMessage(
        session_id=session.id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    db.commit()
    
    # Process AI
    ai_result = await consult_kirana_ai(db=db, message=payload.message)
    
    # Save assistant message
    ai_msg = DBMessage(
        session_id=session.id,
        role="assistant",
        content=ai_result["reply"]
    )
    db.add(ai_msg)
    db.commit()
    
    return {
        "session_token": session_token,
        "reply": ai_result["reply"],
        "suggested_products": ai_result.get("suggested_products", []),
        "suggested_bundles": ai_result.get("suggested_bundles", [])
    }

@router.post("/admin/command", response_model=AdminAICommandResponse)
async def admin_ai_command(
    payload: AdminAICommandRequest,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin Enterprise AI Assistant for NLQ Analytics & Chat-Driven CRUD (MCP Tool Execution)
    """
    admin = db.query(Admin).filter(Admin.id == current_admin["sub"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin tidak ditemukan")
        
    result = await execute_admin_ai_command(db=db, command=payload.command, admin=admin)
    return result
