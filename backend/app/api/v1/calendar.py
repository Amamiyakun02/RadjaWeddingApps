from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Booking
from app.services.calendar_service import (
    generate_ical_feed, 
    generate_single_booking_ical, 
    generate_booking_google_calendar_url
)

router = APIRouter(prefix="/calendar", tags=["Calendar Synchronization"])

@router.get("/feed.ics")
def get_universal_calendar_feed(db: Session = Depends(get_db)):
    """
    RFC 5545 iCalendar Live Feed Endpoint.
    Can be subscribed directly by Google Calendar (Settings -> Add Calendar -> From URL),
    Apple Calendar, or Microsoft Outlook.
    """
    ics_content = generate_ical_feed(db)
    return Response(
        content=ics_content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": 'inline; filename="radja_wedding_schedule.ics"',
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@router.get("/booking/{booking_id}.ics")
def get_single_booking_ics(booking_id: str, db: Session = Depends(get_db)):
    """
    Download single booking event as .ics file.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    
    ics_content = generate_single_booking_ical(booking)
    filename = f"radja_wedding_{booking.booking_code}.ics"
    return Response(
        content=ics_content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.get("/booking/{booking_id}/google-url")
def get_booking_google_calendar_url(booking_id: str, db: Session = Depends(get_db)):
    """
    Get 1-click Google Calendar web intent URL with pre-filled details.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan")
    
    url = generate_booking_google_calendar_url(booking)
    return {
        "booking_id": booking.id,
        "booking_code": booking.booking_code,
        "google_calendar_url": url
    }

@router.get("/sync-info")
def get_calendar_sync_info(request: Request, db: Session = Depends(get_db)):
    """
    Returns calendar synchronization details, URLs, and setup instructions.
    """
    base_url = str(request.base_url).rstrip("/")
    feed_url = f"{base_url}/api/v1/calendar/feed.ics"
    webcal_url = feed_url.replace("https://", "webcal://").replace("http://", "webcal://")
    
    return {
        "status": "ready",
        "feed_url": feed_url,
        "webcal_url": webcal_url,
        "google_calendar_subscribe_url": f"https://calendar.google.com/calendar/r/settings/addbyurl?cid={urllib_quote(feed_url)}",
        "instructions": {
            "android": "Buka Google Calendar di browser -> Pengaturan -> Tambahkan Kalender -> Dari URL -> Tempel URL Feed.",
            "ios": "Buka Settings iPhone -> Calendar -> Accounts -> Add Subscribed Calendar -> Tempel URL Feed.",
            "pc": "Buka calendar.google.com -> Klik tanda (+) di sebelah 'Kalender Lain' -> Pilih 'Dari URL'."
        }
    }

def urllib_quote(url: str) -> str:
    import urllib.parse
    return urllib.parse.quote(url, safe="")
