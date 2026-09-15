from datetime import date, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import AvailabilityBlock, Product, Bundle, BundleItem, Booking

def get_date_range(start_date: date, end_date: date) -> List[date]:
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)
    return dates

def check_products_availability(
    db: Session, 
    product_ids: List[str], 
    start_date: date, 
    end_date: date,
    exclude_booking_id: str = None
) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Check if requested products are available on every date in [start_date, end_date].
    Returns (is_available, conflicts_list).
    """
    requested_dates = get_date_range(start_date, end_date)
    conflicts = []
    
    if not product_ids:
        return True, []
    
    # Query blocks for the product_ids during date range
    query = db.query(AvailabilityBlock).filter(
        AvailabilityBlock.product_id.in_(product_ids),
        AvailabilityBlock.blocked_date.in_(requested_dates)
    )
    if exclude_booking_id:
        query = query.filter(AvailabilityBlock.booking_id != exclude_booking_id)
        
    blocks = query.all()
    
    if blocks:
        for block in blocks:
            product = db.query(Product).filter(Product.id == block.product_id).first()
            prod_name = product.name if product else "Item #{}".format(block.product_id)
            conflicts.append({
                "product_id": block.product_id,
                "product_name": prod_name,
                "blocked_date": block.blocked_date.isoformat(),
                "reason": block.reason
            })
        return False, conflicts
    
    return True, []

def check_bundles_and_items_availability(
    db: Session,
    bundle_ids: List[str],
    custom_product_ids: List[str],
    start_date: date,
    end_date: date,
    exclude_booking_id: str = None
) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Collects all physical product IDs (from bundles + custom items) and verifies no date conflicts.
    """
    all_product_ids = set(custom_product_ids)
    
    if bundle_ids:
        bundle_items = db.query(BundleItem).filter(BundleItem.bundle_id.in_(bundle_ids)).all()
        for item in bundle_items:
            all_product_ids.add(item.product_id)
            
    return check_products_availability(
        db=db,
        product_ids=list(all_product_ids),
        start_date=start_date,
        end_date=end_date,
        exclude_booking_id=exclude_booking_id
    )

def create_booking_availability_blocks(db: Session, booking: Booking):
    """
    Locks dates for all items in the booking.
    """
    dates = get_date_range(booking.start_date, booking.end_date)
    
    # Collect product IDs
    product_ids = set()
    for item in booking.custom_items:
        if item.product_id:
            product_ids.add(item.product_id)
            
    for b_bundle in booking.selected_bundles:
        if b_bundle.bundle_id:
            b_items = db.query(BundleItem).filter(BundleItem.bundle_id == b_bundle.bundle_id).all()
            for bi in b_items:
                product_ids.add(bi.product_id)
                
    for prod_id in product_ids:
        for d in dates:
            # Check if block already exists
            existing = db.query(AvailabilityBlock).filter(
                AvailabilityBlock.product_id == prod_id,
                AvailabilityBlock.blocked_date == d
            ).first()
            if not existing:
                block = AvailabilityBlock(
                    product_id=prod_id,
                    blocked_date=d,
                    booking_id=booking.id,
                    reason="booking"
                )
                db.add(block)
    db.commit()

def remove_booking_availability_blocks(db: Session, booking_id: str):
    """
    Release date locks if booking is cancelled.
    """
    db.query(AvailabilityBlock).filter(AvailabilityBlock.booking_id == booking_id).delete()
    db.commit()
