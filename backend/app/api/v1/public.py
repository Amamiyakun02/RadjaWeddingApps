from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.database import get_db
from app.models.models import (
    Category, Product, Bundle, Gallery, Testimonial, AvailabilityBlock
)
from app.schemas.schemas import (
    CategoryResponse, ProductResponse, BundleResponse,
    GalleryResponse, TestimonialResponse, AvailabilityCheckRequest
)
from app.services.availability import (
    check_bundles_and_items_availability, get_date_range
)

router = APIRouter(prefix="/public", tags=["Public Portal"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_public_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/products", response_model=List[ProductResponse])
def get_public_products(
    category_slug: Optional[str] = None,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    theme: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    
    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
    elif category_id:
        query = query.filter(Product.category_id == category_id)
        
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_fmt),
                Product.description.ilike(search_fmt)
            )
        )
        
    if min_price is not None:
        query = query.filter(Product.price_per_day >= min_price)
    if max_price is not None:
        query = query.filter(Product.price_per_day <= max_price)
        
    products = query.order_by(Product.created_at.desc()).all()
    
    if theme:
        # Filter in python for json attribute
        theme_lower = theme.lower()
        products = [
            p for p in products 
            if p.attributes and theme_lower in str(p.attributes.get("theme", "")).lower()
        ]
        
    return products

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_public_product_detail(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return product

@router.get("/products/{product_id}/availability")
def get_product_availability_dates(
    product_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Returns list of blocked dates for a specific product.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
        
    blocks = db.query(AvailabilityBlock).filter(AvailabilityBlock.product_id == product_id).all()
    blocked_dates = [b.blocked_date.isoformat() for b in blocks]
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "blocked_dates": blocked_dates
    }

@router.get("/bundles", response_model=List[BundleResponse])
def get_public_bundles(
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Bundle).filter(Bundle.is_active == True)
    if search:
        query = query.filter(Bundle.bundle_name.ilike(f"%{search}%"))
        
    bundles = query.order_by(Bundle.created_at.desc()).all()
    
    if event_type:
        ev_lower = event_type.lower()
        bundles = [
            b for b in bundles 
            if b.suitable_for_events and any(ev_lower in str(ev).lower() for ev in b.suitable_for_events)
        ]
        
    return bundles

@router.get("/bundles/{bundle_id}", response_model=BundleResponse)
def get_public_bundle_detail(bundle_id: str, db: Session = Depends(get_db)):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id, Bundle.is_active == True).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Paket Bundle tidak ditemukan")
    return bundle

@router.post("/check-availability")
def check_availability(payload: AvailabilityCheckRequest, db: Session = Depends(get_db)):
    """
    Checks if multiple products and/or bundles are free on the selected date range.
    """
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="Tanggal akhir tidak boleh lebih awal dari tanggal mulai")
        
    is_avail, conflicts = check_bundles_and_items_availability(
        db=db,
        bundle_ids=payload.bundle_ids or [],
        custom_product_ids=payload.product_ids or [],
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    
    return {
        "is_available": is_avail,
        "start_date": payload.start_date.isoformat(),
        "end_date": payload.end_date.isoformat(),
        "conflicts": conflicts
    }

@router.get("/galleries", response_model=List[GalleryResponse])
def get_public_galleries(
    event_type: Optional[str] = None,
    category_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Gallery)
    if event_type:
        query = query.filter(Gallery.event_type == event_type)
    if category_id:
        query = query.filter(Gallery.category_id == category_id)
    return query.order_by(Gallery.created_at.desc()).all()

@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_public_testimonials(
    featured_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Testimonial).filter(Testimonial.status == "approved")
    if featured_only:
        query = query.filter(Testimonial.is_featured == True)
    return query.order_by(Testimonial.created_at.desc()).all()

@router.get("/faqs")
def get_faqs():
    return [
        {
            "question": "Apakah Radja Wedding menyediakan paket lengkap atau bisa sewa satuan (ala carte)?",
            "answer": "Kami menyediakan keduanya! Anda bisa memilih Master Bundles (Paket Komprehensif) siap pakai yang sudah mencakup rias, busana pengantin, dan aksesoris, atau merakit sendiri item pilihan Anda lewat menu Kustom Paket."
        },
        {
            "question": "Berapa persen ketentuan Down Payment (DP) untuk mengunci tanggal acara?",
            "answer": "Ketentuan standar DP adalah 30% dari total nilai transaksi. Setelah DP diverifikasi oleh admin, tanggal dan ketersediaan busana fisik akan otomatis terkunci khusus untuk Anda."
        },
        {
            "question": "Bagaimana prosedur pembayaran saat ini?",
            "answer": "Saat ini pembayaran dapat dilakukan melalui Transfer Bank BCA / Mandiri / BRI atau Scan QRIS. Anda cukup mengunggah foto bukti transfer melalui menu Riwayat Pemesanan untuk diverifikasi cepat oleh kasir/admin."
        },
        {
            "question": "Kapan pelunasan dan proses fitting busana dilakukan?",
            "answer": "Fitting busana dapat dijadwalkan maksimal 1-2 minggu sebelum acara. Pelunasan sisa tagihan dapat diselesaikan saat pengambilan/serah terima busana di salon atau H-1 acara."
        },
        {
            "question": "Apakah MUA bisa datang ke lokasi pernikahan (Home Service)?",
            "answer": "Ya, tim perias MUA profesional kami siap melayani di lokasi resepsi, gedung pernikahan, maupun kediaman mempelai sesuai alamat acara yang didaftarkan."
        }
    ]
