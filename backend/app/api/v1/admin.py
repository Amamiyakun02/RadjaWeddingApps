import os
import uuid
import shutil
from datetime import datetime, date, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.core.config import settings
from app.core.security import require_admin_user, require_owner_role
from app.models.models import (
    Admin, Product, ProductImage, Bundle, BundleItem, Category,
    Booking, BookingItem, BookingBundle, Payment, Gallery, GalleryImage,
    Testimonial, AvailabilityBlock, AuditLog
)
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    BundleCreate, BundleUpdate, BundleResponse,
    BookingResponse, BookingStatusUpdateRequest,
    PaymentVerifyRequest, PaymentResponse,
    AvailabilityBlockCreate,
    GalleryCreate, GalleryResponse,
    TestimonialModerateRequest, TestimonialResponse,
    DashboardMetricsResponse
)
from app.services.availability import remove_booking_availability_blocks, get_date_range

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

def log_admin_action(db: Session, admin_id: str, admin_name: str, action: str, entity: str, entity_id: str = None, details: Any = None):
    try:
        log = AuditLog(
            admin_id=admin_id,
            admin_name=admin_name,
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id else None,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception:
        pass

# --- Dashboard & Analytics ---

@router.get("/dashboard/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    total_bookings = db.query(Booking).count()
    pending_bookings = db.query(Booking).filter(Booking.status == "pending").count()
    confirmed_bookings = db.query(Booking).filter(Booking.status.in_(["confirmed", "dp_paid", "fully_paid"])).count()
    completed_bookings = db.query(Booking).filter(Booking.status == "completed").count()
    
    verified_payments = db.query(Payment).filter(Payment.status == "verified").all()
    total_revenue = sum(p.amount for p in verified_payments)
    
    # Monthly revenue (current month)
    now = datetime.now()
    current_month_payments = [
        p.amount for p in verified_payments 
        if p.created_at and p.created_at.month == now.month and p.created_at.year == now.year
    ]
    monthly_revenue = sum(current_month_payments)
    
    total_products = db.query(Product).filter(Product.is_active == True).count()
    pending_testimonials = db.query(Testimonial).filter(Testimonial.status == "pending").count()
    
    recent_bookings = db.query(Booking).order_by(Booking.created_at.desc()).limit(8).all()
    
    return {
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "confirmed_bookings": confirmed_bookings,
        "completed_bookings": completed_bookings,
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue,
        "total_products": total_products,
        "pending_testimonials": pending_testimonials,
        "recent_bookings": recent_bookings
    }

# --- Products CRUD ---

@router.post("/products", response_model=ProductResponse)
def create_product(
    payload: ProductCreate,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    prod = Product(
        name=payload.name,
        category_id=payload.category_id,
        description=payload.description,
        price_per_day=payload.price_per_day,
        dp_percentage=payload.dp_percentage,
        stock_unit=payload.stock_unit,
        image_url=payload.image_url,
        is_active=payload.is_active,
        attributes=payload.attributes or {}
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    
    if payload.gallery_images:
        for idx, img_url in enumerate(payload.gallery_images):
            pimg = ProductImage(product_id=prod.id, image_url=img_url, sort_order=idx)
            db.add(pimg)
        db.commit()
        db.refresh(prod)
        
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "create_product", "products", prod.id, {"name": prod.name})
    return prod

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
        
    update_data = payload.model_dump(exclude_unset=True)
    if "gallery_images" in update_data:
        del update_data["gallery_images"]
        
    for k, v in update_data.items():
        setattr(prod, k, v)
        
    db.commit()
    db.refresh(prod)
    
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "update_product", "products", prod.id, {"name": prod.name})
    return prod

@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
        
    db.delete(prod)
    db.commit()
    
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "delete_product", "products", product_id)
    return {"status": "success", "message": "Produk berhasil dihapus"}

# --- Bundles CRUD ---

@router.post("/bundles", response_model=BundleResponse)
def create_bundle(
    payload: BundleCreate,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    bundle = Bundle(
        bundle_name=payload.bundle_name,
        description=payload.description,
        package_price=payload.package_price,
        dp_percentage=payload.dp_percentage,
        suitable_for_events=payload.suitable_for_events,
        image_url=payload.image_url,
        is_active=payload.is_active
    )
    db.add(bundle)
    db.commit()
    db.refresh(bundle)
    
    for item in payload.items:
        b_item = BundleItem(
            bundle_id=bundle.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(b_item)
    db.commit()
    db.refresh(bundle)
    
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "create_bundle", "bundles", bundle.id, {"bundle_name": bundle.bundle_name})
    return bundle

@router.put("/bundles/{bundle_id}", response_model=BundleResponse)
def update_bundle(
    bundle_id: str,
    payload: BundleUpdate,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Paket Bundle tidak ditemukan")
        
    update_data = payload.model_dump(exclude_unset=True)
    items_data = update_data.pop("items", None)
    
    for k, v in update_data.items():
        setattr(bundle, k, v)
        
    if items_data is not None:
        db.query(BundleItem).filter(BundleItem.bundle_id == bundle.id).delete()
        for item in items_data:
            db.add(BundleItem(
                bundle_id=bundle.id,
                product_id=item["product_id"],
                quantity=item.get("quantity", 1)
            ))
            
    db.commit()
    db.refresh(bundle)
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "update_bundle", "bundles", bundle.id)
    return bundle

@router.delete("/bundles/{bundle_id}")
def delete_bundle(
    bundle_id: str,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Paket Bundle tidak ditemukan")
    db.delete(bundle)
    db.commit()
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "delete_bundle", "bundles", bundle_id)
    return {"status": "success", "message": "Paket Bundle berhasil dihapus"}

# --- Bookings Management ---

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    if search:
        query = query.filter(Booking.booking_code.ilike(f"%{search}%"))
        
    return query.order_by(Booking.created_at.desc()).all()

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_admin_booking_detail(
    booking_id: str,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return booking

@router.put("/bookings/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdateRequest,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
        
    old_status = booking.status
    booking.status = payload.status
    if payload.admin_notes:
        booking.admin_notes = payload.admin_notes
        
    # If cancelled, release availability blocks
    if payload.status == "cancelled":
        remove_booking_availability_blocks(db, booking.id)
        
    db.commit()
    db.refresh(booking)
    
    log_admin_action(
        db, current_admin["sub"], current_admin.get("name", "Admin"),
        "update_booking_status", "bookings", booking.id,
        {"from": old_status, "to": payload.status}
    )
    return booking

# --- Payment Verification ---

@router.get("/payments", response_model=List[PaymentResponse])
def get_all_payments(
    status_filter: Optional[str] = None,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(Payment)
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    return query.order_by(Payment.created_at.desc()).all()

@router.put("/payments/{payment_id}/verify", response_model=PaymentResponse)
def verify_payment(
    payment_id: str,
    payload: PaymentVerifyRequest,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Data pembayaran tidak ditemukan")
        
    payment.status = payload.status # 'verified' or 'rejected'
    payment.verified_by = current_admin["sub"]
    payment.verified_at = datetime.now(timezone.utc)
    
    # Auto-transition booking status when DP or full payment is verified
    booking = payment.booking
    if booking and payload.status == "verified":
        if payment.type == "dp" and booking.status in ["pending", "confirmed"]:
            booking.status = "dp_paid"
        elif payment.type == "pelunasan":
            booking.status = "fully_paid"
            
    db.commit()
    db.refresh(payment)
    
    log_admin_action(
        db, current_admin["sub"], current_admin.get("name", "Admin"),
        "verify_payment", "payments", payment.id,
        {"status": payload.status, "amount": payment.amount}
    )
    return payment

# --- Availability Matrix & Manual Date Blocks ---

@router.get("/schedule-matrix")
def get_schedule_matrix(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """
    Returns matrix of all booked and blocked items within date range
    """
    dates = get_date_range(start_date, end_date)
    blocks = db.query(AvailabilityBlock).filter(
        AvailabilityBlock.blocked_date.in_(dates)
    ).all()
    
    products = db.query(Product).filter(Product.is_active == True).all()
    
    matrix = []
    for prod in products:
        prod_blocks = [b for b in blocks if b.product_id == prod.id]
        blocked_info = {}
        for b in prod_blocks:
            booking_code = b.booking.booking_code if b.booking else None
            blocked_info[b.blocked_date.isoformat()] = {
                "block_id": b.id,
                "reason": b.reason,
                "booking_code": booking_code
            }
        matrix.append({
            "product_id": prod.id,
            "product_name": prod.name,
            "category": prod.category.name if prod.category else "-",
            "blocked_dates": blocked_info
        })
        
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "matrix": matrix
    }

@router.post("/availability-blocks")
def create_manual_availability_block(
    payload: AvailabilityBlockCreate,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(AvailabilityBlock).filter(
        AvailabilityBlock.product_id == payload.product_id,
        AvailabilityBlock.blocked_date == payload.blocked_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tanggal ini sudah diblokir untuk item tersebut")
        
    block = AvailabilityBlock(
        product_id=payload.product_id,
        blocked_date=payload.blocked_date,
        reason=payload.reason or "manual_block"
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    
    log_admin_action(db, current_admin["sub"], current_admin.get("name", "Admin"), "block_date", "availability_blocks", block.id)
    return {"status": "success", "message": "Jadwal berhasil diblokir", "block_id": block.id}

@router.delete("/availability-blocks/{block_id}")
def delete_availability_block(
    block_id: str,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    block = db.query(AvailabilityBlock).filter(AvailabilityBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Data blokir tidak ditemukan")
    db.delete(block)
    db.commit()
    return {"status": "success", "message": "Blokir jadwal berhasil dicabut"}

# --- Galleries & Testimonials ---

@router.post("/galleries", response_model=GalleryResponse)
def create_gallery(
    payload: GalleryCreate,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    gallery = Gallery(
        title=payload.title,
        description=payload.description,
        category_id=payload.category_id,
        event_type=payload.event_type,
        cover_url=payload.cover_url
    )
    db.add(gallery)
    db.commit()
    db.refresh(gallery)
    
    for img in payload.images:
        g_img = GalleryImage(
            gallery_id=gallery.id,
            media_url=img.media_url,
            media_type=img.media_type,
            caption=img.caption,
            sort_order=img.sort_order
        )
        db.add(g_img)
    db.commit()
    db.refresh(gallery)
    return gallery

@router.delete("/galleries/{gallery_id}")
def delete_gallery(
    gallery_id: str,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Galeri tidak ditemukan")
    db.delete(gallery)
    db.commit()
    return {"status": "success", "message": "Galeri berhasil dihapus"}

@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_all_testimonials_admin(
    status_filter: Optional[str] = None,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(Testimonial)
    if status_filter:
        query = query.filter(Testimonial.status == status_filter)
    return query.order_by(Testimonial.created_at.desc()).all()

@router.put("/testimonials/{testimonial_id}/moderate", response_model=TestimonialResponse)
def moderate_testimonial(
    testimonial_id: str,
    payload: TestimonialModerateRequest,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    t = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimoni tidak ditemukan")
        
    t.status = payload.status # 'approved' or 'rejected'
    if payload.is_featured is not None:
        t.is_featured = payload.is_featured
        
    db.commit()
    db.refresh(t)
    return t

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    current_admin: dict = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs
