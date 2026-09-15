import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import settings
from app.core.security import require_customer_user
from app.models.models import (
    User, Product, Bundle, BundleItem, Booking, BookingItem,
    BookingBundle, Payment, Testimonial, AvailabilityBlock
)
from app.schemas.schemas import (
    BookingCreateRequest, BookingResponse, PaymentResponse,
    TestimonialCreate, TestimonialResponse
)
from app.services.availability import (
    check_bundles_and_items_availability, create_booking_availability_blocks
)
from app.services.pdf_service import generate_invoice_html

router = APIRouter(prefix="/customer", tags=["Customer Portal"])

def generate_booking_code() -> str:
    now_str = datetime.now().strftime("%Y%m%d")
    rand_str = uuid.uuid4().hex[:4].upper()
    return f"RADJA-{now_str}-{rand_str}"

@router.post("/bookings", response_model=BookingResponse)
def create_customer_booking(
    payload: BookingCreateRequest,
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Akun pengguna tidak ditemukan")
        
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="Tanggal akhir tidak boleh lebih awal dari tanggal mulai")
        
    bundle_ids = [b.bundle_id for b in payload.selected_bundles]
    custom_product_ids = [ci.product_id for ci in payload.custom_items]
    
    if not bundle_ids and not custom_product_ids:
        raise HTTPException(status_code=400, detail="Pemesanan harus memilih minimal satu item atau paket bundle")
        
    # Check availability
    is_avail, conflicts = check_bundles_and_items_availability(
        db=db,
        bundle_ids=bundle_ids,
        custom_product_ids=custom_product_ids,
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    if not is_avail:
        conflict_names = ", ".join([c["product_name"] for c in conflicts])
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Item tidak tersedia pada tanggal tersebut: {conflict_names}"
        )
        
    # Calculate days
    days = (payload.end_date - payload.start_date).days + 1
    if days < 1:
        days = 1
        
    total_price = 0
    
    # Calculate Bundles
    bundle_entries = []
    for b_req in payload.selected_bundles:
        bundle_obj = db.query(Bundle).filter(Bundle.id == b_req.bundle_id, Bundle.is_active == True).first()
        if not bundle_obj:
            raise HTTPException(status_code=404, detail=f"Paket Bundle ID {b_req.bundle_id} tidak valid")
        price_snap = bundle_obj.package_price
        total_price += price_snap
        bundle_entries.append({
            "bundle_id": bundle_obj.id,
            "name": bundle_obj.bundle_name,
            "price_snapshot": price_snap
        })
        
    # Calculate Custom Items
    custom_entries = []
    for ci_req in payload.custom_items:
        prod_obj = db.query(Product).filter(Product.id == ci_req.product_id, Product.is_active == True).first()
        if not prod_obj:
            raise HTTPException(status_code=404, detail=f"Produk ID {ci_req.product_id} tidak valid")
        qty = ci_req.quantity if ci_req.quantity > 0 else 1
        price_snap = prod_obj.price_per_day
        total_price += (price_snap * qty * days)
        custom_entries.append({
            "product_id": prod_obj.id,
            "name": prod_obj.name,
            "quantity": qty,
            "price_snapshot": price_snap
        })
        
    # Minimum DP (default 30%)
    dp_amount = int(total_price * 0.30)
    
    new_booking = Booking(
        booking_code=generate_booking_code(),
        customer_id=user.id,
        event_type=payload.event_type,
        location_address=payload.location_address,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_price=total_price,
        dp_amount=dp_amount,
        status="pending",
        notes=payload.notes
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # Save bundle relations
    for be in bundle_entries:
        bb = BookingBundle(
            booking_id=new_booking.id,
            bundle_id=be["bundle_id"],
            name=be["name"],
            price_snapshot=be["price_snapshot"]
        )
        db.add(bb)
        
    # Save custom item relations
    for ce in custom_entries:
        bi = BookingItem(
            booking_id=new_booking.id,
            product_id=ce["product_id"],
            name=ce["name"],
            quantity=ce["quantity"],
            price_snapshot=ce["price_snapshot"]
        )
        db.add(bi)
        
    db.commit()
    
    # Lock dates in availability blocks
    create_booking_availability_blocks(db, new_booking)
    db.refresh(new_booking)
    
    return new_booking

@router.get("/bookings", response_model=List[BookingResponse])
def get_customer_bookings(
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]
    bookings = db.query(Booking).filter(
        Booking.customer_id == user_id
    ).order_by(Booking.created_at.desc()).all()
    return bookings

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_customer_booking_detail(
    booking_id: str,
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.customer_id == user_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return booking

@router.post("/bookings/{booking_id}/payment", response_model=PaymentResponse)
async def upload_payment_proof(
    booking_id: str,
    amount: int = Form(...),
    type: str = Form("dp"), # 'dp' or 'pelunasan'
    method: str = Form("transfer_bank"), # 'transfer_bank', 'qris', 'cash'
    proof_file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.customer_id == user_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
        
    proof_url = None
    if proof_file:
        ext = os.path.splitext(proof_file.filename)[1] or ".jpg"
        unique_name = f"proof_{uuid.uuid4().hex[:8]}{ext}"
        save_path = os.path.join(settings.UPLOAD_DIR, "payments", unique_name)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(proof_file.file, buffer)
        proof_url = f"/uploads/payments/{unique_name}"
    else:
        # Default mock proof for test if no image uploaded
        proof_url = "/uploads/payments/sample_proof.jpg"

    payment = Payment(
        booking_id=booking.id,
        amount=amount,
        type=type,
        method=method,
        proof_url=proof_url,
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return payment

@router.get("/bookings/{booking_id}/invoice")
def get_customer_invoice_html(
    booking_id: str,
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.customer_id == user_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
        
    html = generate_invoice_html(booking)
    return HTMLResponse(content=html, status_code=200)

@router.post("/testimonials", response_model=TestimonialResponse)
def submit_customer_testimonial(
    payload: TestimonialCreate,
    current_user: dict = Depends(require_customer_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    
    testimonial = Testimonial(
        user_id=user_id,
        booking_id=payload.booking_id,
        customer_name=payload.customer_name or user.name,
        rating=payload.rating,
        content=payload.content,
        photo_url=payload.photo_url,
        event_name=payload.event_name or "Pernikahan",
        status="pending",
        is_featured=False
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial
