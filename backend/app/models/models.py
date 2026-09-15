import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, 
    DateTime, Date, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    google_id = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    whatsapp = Column(String(50), nullable=True, index=True)
    is_whatsapp_verified = Column(Boolean, default=False)
    address = Column(Text, nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_registered = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    bookings = relationship("Booking", back_populates="customer", cascade="all, delete-orphan")
    testimonials = relationship("Testimonial", back_populates="user")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="staff") # 'owner' or 'staff'
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    verified_payments = relationship("Payment", back_populates="verified_admin")
    audit_logs = relationship("AuditLog", back_populates="admin")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    icon = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    
    products = relationship("Product", back_populates="category")
    galleries = relationship("Gallery", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price_per_day = Column(Integer, nullable=False) # In IDR
    dp_percentage = Column(Float, default=30.0) # e.g. 30%
    stock_unit = Column(Integer, default=1)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    attributes = Column(JSON, nullable=True, default=dict) # {theme, size, dimensions, color, etc}
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    bundle_items = relationship("BundleItem", back_populates="product")
    availability_blocks = relationship("AvailabilityBlock", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0)
    
    product = relationship("Product", back_populates="images")

class Bundle(Base):
    __tablename__ = "bundles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    bundle_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    package_price = Column(Integer, nullable=False)
    dp_percentage = Column(Float, default=30.0)
    suitable_for_events = Column(JSON, default=list) # ["wedding", "engagement", "aqiqah"]
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    
    items = relationship("BundleItem", back_populates="bundle", cascade="all, delete-orphan")

class BundleItem(Base):
    __tablename__ = "bundle_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    bundle_id = Column(String(36), ForeignKey("bundles.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1)
    
    bundle = relationship("Bundle", back_populates="items")
    product = relationship("Product", back_populates="bundle_items")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_code = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    event_type = Column(String(100), nullable=False) # 'wedding', 'engagement', 'aqiqah', 'wisuda', 'corporate'
    location_address = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    
    total_price = Column(Integer, nullable=False)
    dp_amount = Column(Integer, nullable=False)
    status = Column(String(50), default="pending", index=True) # pending, confirmed, dp_paid, fully_paid, completed, cancelled
    
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    customer = relationship("User", back_populates="bookings")
    custom_items = relationship("BookingItem", back_populates="booking", cascade="all, delete-orphan")
    selected_bundles = relationship("BookingBundle", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    availability_blocks = relationship("AvailabilityBlock", back_populates="booking")

class BookingItem(Base):
    __tablename__ = "booking_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1)
    price_snapshot = Column(Integer, nullable=False)
    
    booking = relationship("Booking", back_populates="custom_items")

class BookingBundle(Base):
    __tablename__ = "booking_bundles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    bundle_id = Column(String(36), ForeignKey("bundles.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    price_snapshot = Column(Integer, nullable=False)
    
    booking = relationship("Booking", back_populates="selected_bundles")

class AvailabilityBlock(Base):
    __tablename__ = "availability_blocks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_date = Column(Date, nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=True)
    reason = Column(String(100), default="booking") # 'booking', 'maintenance', 'laundry', 'manual_block'
    
    product = relationship("Product", back_populates="availability_blocks")
    booking = relationship("Booking", back_populates="availability_blocks")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False) # 'dp' or 'pelunasan'
    method = Column(String(50), default="transfer_bank") # 'transfer_bank', 'qris', 'cash'
    proof_url = Column(String(500), nullable=True)
    status = Column(String(50), default="pending") # 'pending', 'verified', 'rejected'
    
    verified_by = Column(String(36), ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    booking = relationship("Booking", back_populates="payments")
    verified_admin = relationship("Admin", back_populates="verified_payments")

class Gallery(Base):
    __tablename__ = "galleries"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(100), nullable=True)
    cover_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    category = relationship("Category", back_populates="galleries")
    images = relationship("GalleryImage", back_populates="gallery", cascade="all, delete-orphan")

class GalleryImage(Base):
    __tablename__ = "gallery_images"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    gallery_id = Column(String(36), ForeignKey("galleries.id", ondelete="CASCADE"), nullable=False)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(20), default="image") # 'image' or 'video'
    caption = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0)
    
    gallery = relationship("Gallery", back_populates="images")

class Testimonial(Base):
    __tablename__ = "testimonials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    rating = Column(Integer, default=5) # 1 - 5
    content = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    event_name = Column(String(255), nullable=True)
    is_featured = Column(Boolean, default=False)
    status = Column(String(50), default="pending") # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", back_populates="testimonials")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_whatsapp = Column(String(50), nullable=True)
    session_token = Column(String(255), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    extracted_theme = Column(String(100), nullable=True)
    extracted_location = Column(String(255), nullable=True)
    extracted_color = Column(String(100), nullable=True)
    extracted_budget_range = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False) # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    session = relationship("Session", back_populates="messages")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_id = Column(String(36), ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)
    admin_name = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False) # 'create_product', 'update_booking_status', etc.
    entity = Column(String(100), nullable=True) # 'products', 'bookings', 'payments'
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    admin = relationship("Admin", back_populates="audit_logs")
