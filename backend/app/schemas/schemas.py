from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- Auth & User Schemas ---
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    whatsapp: Optional[str] = None
    address: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    google_id: str
    email: EmailStr
    name: str

class VerifyOtpRequest(BaseModel):
    whatsapp: str
    otp: str

class CompleteProfileRequest(BaseModel):
    whatsapp: str
    address: str

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    whatsapp: Optional[str] = None
    is_whatsapp_verified: bool = False
    address: Optional[str] = None
    is_registered: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class AdminProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any
    role: str # 'customer', 'owner', 'staff'

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductImageResponse(BaseModel):
    id: str
    image_url: str
    sort_order: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    category_id: Optional[str] = None
    description: Optional[str] = None
    price_per_day: int
    dp_percentage: float = 30.0
    stock_unit: int = 1
    image_url: Optional[str] = None
    is_active: bool = True
    attributes: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    gallery_images: Optional[List[str]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[int] = None
    dp_percentage: Optional[float] = None
    stock_unit: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    attributes: Optional[Dict[str, Any]] = None
    gallery_images: Optional[List[str]] = None

class ProductResponse(ProductBase):
    id: str
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

# --- Bundle Schemas ---
class BundleItemCreate(BaseModel):
    product_id: str
    quantity: int = 1

class BundleItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class BundleBase(BaseModel):
    bundle_name: str
    description: Optional[str] = None
    package_price: int
    dp_percentage: float = 30.0
    suitable_for_events: List[str] = ["wedding"]
    image_url: Optional[str] = None
    is_active: bool = True

class BundleCreate(BundleBase):
    items: List[BundleItemCreate] = []

class BundleUpdate(BaseModel):
    bundle_name: Optional[str] = None
    description: Optional[str] = None
    package_price: Optional[int] = None
    dp_percentage: Optional[float] = None
    suitable_for_events: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    items: Optional[List[BundleItemCreate]] = None

class BundleResponse(BundleBase):
    id: str
    items: List[BundleItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

# --- Booking Schemas ---
class BookingItemCreate(BaseModel):
    product_id: str
    quantity: int = 1

class BookingBundleCreate(BaseModel):
    bundle_id: str

class BookingCreateRequest(BaseModel):
    event_type: str = "wedding" # wedding, engagement, aqiqah, wisuda, corporate
    location_address: str
    start_date: date
    end_date: date
    notes: Optional[str] = None
    selected_bundles: List[BookingBundleCreate] = []
    custom_items: List[BookingItemCreate] = []

class BookingItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    name: str
    quantity: int
    price_snapshot: int

    class Config:
        from_attributes = True

class BookingBundleResponse(BaseModel):
    id: str
    bundle_id: Optional[str] = None
    name: str
    price_snapshot: int

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: str
    amount: int
    type: str # dp, pelunasan
    method: str
    proof_url: Optional[str] = None
    status: str
    verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BookingResponse(BaseModel):
    id: str
    booking_code: str
    customer_id: str
    customer: Optional[UserProfileResponse] = None
    event_type: str
    location_address: str
    start_date: date
    end_date: date
    total_price: int
    dp_amount: int
    status: str
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    custom_items: List[BookingItemResponse] = []
    selected_bundles: List[BookingBundleResponse] = []
    payments: List[PaymentResponse] = []

    class Config:
        from_attributes = True

class BookingStatusUpdateRequest(BaseModel):
    status: str # pending, confirmed, dp_paid, fully_paid, completed, cancelled
    admin_notes: Optional[str] = None

# --- Payment & Manual Verification ---
class PaymentCreateRequest(BaseModel):
    amount: int
    type: str = "dp" # 'dp' or 'pelunasan'
    method: str = "transfer_bank" # 'transfer_bank', 'qris', 'cash'
    proof_url: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    status: str = "verified" # 'verified' or 'rejected'
    notes: Optional[str] = None

# --- Availability Schemas ---
class AvailabilityCheckRequest(BaseModel):
    start_date: date
    end_date: date
    product_ids: Optional[List[str]] = None
    bundle_ids: Optional[List[str]] = None

class AvailabilityBlockCreate(BaseModel):
    product_id: str
    blocked_date: date
    reason: str = "manual_block"

# --- Gallery Schemas ---
class GalleryImageCreate(BaseModel):
    media_url: str
    media_type: str = "image"
    caption: Optional[str] = None
    sort_order: int = 0

class GalleryImageResponse(BaseModel):
    id: str
    media_url: str
    media_type: str
    caption: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class GalleryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    event_type: Optional[str] = None
    cover_url: Optional[str] = None
    images: List[GalleryImageCreate] = []

class GalleryResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    event_type: Optional[str] = None
    cover_url: Optional[str] = None
    images: List[GalleryImageResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

# --- Testimonial Schemas ---
class TestimonialCreate(BaseModel):
    customer_name: str
    rating: int = Field(5, ge=1, le=5)
    content: str
    photo_url: Optional[str] = None
    event_name: Optional[str] = None
    booking_id: Optional[str] = None

class TestimonialModerateRequest(BaseModel):
    status: str # 'approved', 'rejected'
    is_featured: Optional[bool] = None

class TestimonialResponse(BaseModel):
    id: str
    customer_name: str
    rating: int
    content: str
    photo_url: Optional[str] = None
    event_name: Optional[str] = None
    is_featured: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI & Chat Schemas ---
class AIChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str

class AIChatRequest(BaseModel):
    session_token: Optional[str] = None
    message: str
    customer_whatsapp: Optional[str] = None

class AIChatResponse(BaseModel):
    session_token: str
    reply: str
    suggested_products: List[Dict[str, Any]] = []
    suggested_bundles: List[Dict[str, Any]] = []

class AdminAICommandRequest(BaseModel):
    command: str

class AdminAICommandResponse(BaseModel):
    action_type: str # 'analytics', 'mutation', 'general_info'
    reply: str
    execution_result: Optional[Dict[str, Any]] = None

# --- Report & Dashboard Schemas ---
class DashboardMetricsResponse(BaseModel):
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    total_revenue: int
    monthly_revenue: int
    total_products: int
    pending_testimonials: int
    recent_bookings: List[BookingResponse] = []
