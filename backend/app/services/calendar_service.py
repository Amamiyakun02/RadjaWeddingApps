from datetime import datetime, date, timedelta
from typing import List, Optional
import urllib.parse
from sqlalchemy.orm import Session
from app.models.models import Booking, AvailabilityBlock, Product

def format_ics_date(d: date) -> str:
    """Format date to iCalendar YYYYMMDD string."""
    return d.strftime("%Y%m%d")

def format_ics_datetime(dt: datetime) -> str:
    """Format datetime to iCalendar UTC string YYYYMMDDTHHMMSSZ."""
    return dt.strftime("%Y%m%dT%H%M%SZ")

def generate_google_calendar_url(
    title: str,
    start_date: date,
    end_date: date,
    details: str,
    location: str
) -> str:
    """
    Generate standard 1-click Google Calendar web intent template URL.
    """
    # For all-day events, Google Calendar expects end date + 1 day
    start_str = format_ics_date(start_date)
    end_str = format_ics_date(end_date + timedelta(days=1))
    
    params = {
        "action": "TEMPLATE",
        "text": title,
        "dates": f"{start_str}/{end_str}",
        "details": details,
        "location": location,
        "sprop": "website:radjawedding.com"
    }
    return f"https://calendar.google.com/calendar/render?{urllib.parse.urlencode(params)}"

def generate_booking_google_calendar_url(booking: Booking) -> str:
    """
    Build Google Calendar URL specifically for a client booking.
    """
    items_desc = []
    if booking.selected_bundles:
        for b in booking.selected_bundles:
            items_desc.append(f"• [Paket] {b.name}")
    if booking.custom_items:
        for i in booking.custom_items:
            items_desc.append(f"• {i.quantity}x {i.name}")
    
    items_text = "\n".join(items_desc) if items_desc else "-"
    customer_name = booking.customer.name if booking.customer else "Klien"
    customer_wa = booking.customer.whatsapp if booking.customer else "-"
    
    title = f"💍 Pernikahan {customer_name} ({booking.booking_code}) - Radja Wedding"
    details = (
        f"KODE BOOKING: {booking.booking_code}\n"
        f"KLIEN: {customer_name} (WA: {customer_wa})\n"
        f"JENIS ACARA: {booking.event_type.upper()}\n"
        f"STATUS: {booking.status.upper()}\n\n"
        f"RINCIAN BUSANA & RIAS:\n{items_text}\n\n"
        f"CATATAN: {booking.notes or '-'}\n\n"
        f"Penyedia: Radja Wedding Salon & Bridal"
    )
    location = booking.location_address or "Salon Radja Wedding"
    
    return generate_google_calendar_url(
        title=title,
        start_date=booking.start_date,
        end_date=booking.end_date,
        details=details,
        location=location
    )

def generate_ical_feed(db: Session) -> str:
    """
    Generate a full RFC 5545 iCalendar (.ics) string containing:
    1. All active Client Bookings (Confirmed, DP Paid, Fully Paid, Pending).
    2. All Maintenance & Schedule Lock Blocks (Laundry, Servis, Off).
    """
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Radja Wedding//Schedule Calendar Engine//ID",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Radja Wedding - Jadwal Acara & Ketersediaan",
        "X-WR-TIMEZONE:Asia/Jakarta",
        "X-WR-CALDESC:Sinkronisasi kalender reservasi busana, riasan MUA, dan jadwal maintenance Radja Wedding."
    ]
    
    now_str = format_ics_datetime(datetime.utcnow())

    # 1. Add Bookings
    bookings = db.query(Booking).filter(Booking.status != "cancelled").all()
    for b in bookings:
        uid = f"booking-{b.id}@radjawedding.com"
        start_str = format_ics_date(b.start_date)
        end_str = format_ics_date(b.end_date + timedelta(days=1))
        
        customer_name = b.customer.name if b.customer else "Klien"
        customer_phone = b.customer.whatsapp if b.customer else "-"
        
        items_desc = []
        if b.selected_bundles:
            for bundle in b.selected_bundles:
                items_desc.append(f"[Bundle] {bundle.name}")
        if b.custom_items:
            for item in b.custom_items:
                items_desc.append(f"{item.quantity}x {item.name}")
        items_summary = ", ".join(items_desc) if items_desc else "Item Radja Wedding"
        
        summary = f"💍 [Radja Wedding] {b.event_type.title()} - {customer_name}"
        description = (
            f"Kode: {b.booking_code}\\n"
            f"Klien: {customer_name} ({customer_phone})\\n"
            f"Status: {b.status.upper()}\\n"
            f"Item: {items_summary}\\n"
            f"Lokasi: {b.location_address or '-'}\\n"
            f"Catatan: {b.notes or '-'}"
        )
        location = b.location_address or "Salon Radja Wedding"

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{now_str}",
            f"DTSTART;VALUE=DATE:{start_str}",
            f"DTEND;VALUE=DATE:{end_str}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description}",
            f"LOCATION:{location}",
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT"
        ])

    # 2. Add Manual Schedule Locks (Maintenance / Laundry / Off)
    blocks = db.query(AvailabilityBlock).filter(AvailabilityBlock.booking_id == None).all()
    for block in blocks:
        prod = db.query(Product).filter(Product.id == block.product_id).first()
        prod_name = prod.name if prod else f"Item #{block.product_id}"
        uid = f"lock-{block.id}@radjawedding.com"
        start_str = format_ics_date(block.blocked_date)
        end_str = format_ics_date(block.blocked_date + timedelta(days=1))
        
        summary = f"🔒 [TUTUP JADWAL] {block.reason.upper()} - {prod_name}"
        description = f"Barang: {prod_name}\\nAlasan: {block.reason.title()}\\nStatus: Tanggal Ditutup (Tidak dapat disewa klien)"

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{now_str}",
            f"DTSTART;VALUE=DATE:{start_str}",
            f"DTEND;VALUE=DATE:{end_str}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description}",
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)

def generate_single_booking_ical(booking: Booking) -> str:
    """
    Generate an RFC 5545 .ics file for a single booking.
    """
    now_str = format_ics_datetime(datetime.utcnow())
    uid = f"booking-{booking.id}@radjawedding.com"
    start_str = format_ics_date(booking.start_date)
    end_str = format_ics_date(booking.end_date + timedelta(days=1))
    
    customer_name = booking.customer.name if booking.customer else "Klien"
    summary = f"💍 Acara Pernikahan {customer_name} - Radja Wedding"
    
    items_desc = []
    if booking.selected_bundles:
        for b in booking.selected_bundles:
            items_desc.append(f"[Bundle] {b.name}")
    if booking.custom_items:
        for i in booking.custom_items:
            items_desc.append(f"{i.quantity}x {i.name}")
    items_summary = ", ".join(items_desc) if items_desc else "-"

    description = (
        f"Kode Booking: {booking.booking_code}\\n"
        f"Nama Pemesan: {customer_name}\\n"
        f"Rincian Paket & Item: {items_summary}\\n"
        f"Lokasi: {booking.location_address or '-'}\\n"
        f"Catatan: {booking.notes or '-'}\\n"
        f"Kontak Salon: +62 812-3456-7890"
    )
    location = booking.location_address or "Salon Radja Wedding"

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Radja Wedding//Booking Event//ID",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{now_str}",
        f"DTSTART;VALUE=DATE:{start_str}",
        f"DTEND;VALUE=DATE:{end_str}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        f"LOCATION:{location}",
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Pengingat Acara Pernikahan Radja Wedding",
        "TRIGGER:-P1D",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ]
    return "\r\n".join(lines)
