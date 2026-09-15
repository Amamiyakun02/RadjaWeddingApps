import re
import json
import httpx
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Product, Bundle, Booking, Payment, Category, Admin, AuditLog

# ====================================================================
# CUSTOMER AI CONSULTANT ("KIRANA")
# ====================================================================

async def consult_kirana_ai(
    db: Session,
    message: str,
    history: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Kirana - Wedding & Event planning AI consultant.
    Matches user requests with real catalog items and bundles.
    """
    # Fetch active products & bundles for RAG context
    products = db.query(Product).filter(Product.is_active == True).limit(20).all()
    bundles = db.query(Bundle).filter(Bundle.is_active == True).limit(10).all()
    
    catalog_summary = []
    for b in bundles:
        catalog_summary.append(f"Paket Bundle: {b.bundle_name} | Harga: Rp {b.package_price:,} | Acara: {', '.join(b.suitable_for_events or [])} | Ket: {b.description or ''}")
    for p in products:
        theme = p.attributes.get("theme", "") if p.attributes else ""
        catalog_summary.append(f"Item: {p.name} | Kategori: {p.category.name if p.category else 'Umum'} | Harga/Hari: Rp {p.price_per_day:,} | Tema: {theme} | Ket: {p.description or ''}")
        
    catalog_text = "\n".join(catalog_summary)
    
    # 1. Try Gemini API if key is available
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            system_instruction = f"""
            Anda adalah "Kirana", konsultan perencana pernikahan dan busana adat/modern profesional dari Radja Wedding (salonradja.com).
            Tugas Anda adalah menyapa calon pengantin dengan ramah, hangat, dan anggun (Bahasa Indonesia santun & profesional).
            Bantu calon pengantin memilih rias, busana (Sunda Siger, Adat Jawa Paes, Gaun Bridal Modern, dll.), aksesoris, atau paket dekorasi berdasarkan tema acara, selera, dan anggaran mereka.

            Berikut katalog aktif saat ini di Radja Wedding:
            {catalog_text}

            Panduan:
            - Berikan rekomendasi spesifik dari paket/item di atas yang cocok.
            - Sarankan untuk cek ketersediaan tanggal dan melakukan reservasi via website.
            - Jawab dengan format rapi dan terstruktur.
            """
            
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_instruction}\n\nPertanyaan Klien: {message}"}]}
                ]
            }
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Match suggested items
                    suggested_p, suggested_b = find_matching_catalog(message + " " + reply_text, products, bundles)
                    return {
                        "reply": reply_text,
                        "suggested_products": suggested_p,
                        "suggested_bundles": suggested_b
                    }
        except Exception as e:
            # Fallback to simulation
            pass

    # 2. Heuristic Simulation Engine (Reliable, fast, zero-dependency)
    msg_lower = message.lower()
    
    suggested_products, suggested_bundles = find_matching_catalog(message, products, bundles)
    
    # Dynamic smart response generation
    theme_detected = None
    if any(k in msg_lower for k in ["sunda", "siger", "priangan"]):
        theme_detected = "Adat Sunda (Siger Sunda)"
    elif any(k in msg_lower for k in ["jawa", "solo", "jogja", "paes", "ageng"]):
        theme_detected = "Adat Jawa (Solo / Jogja Paes)"
    elif any(k in msg_lower for k in ["padang", "minang", "suntiang"]):
        theme_detected = "Adat Minang (Suntiang)"
    elif any(k in msg_lower for k in ["modern", "bridal", "gaun", "international", "putih", "barat"]):
        theme_detected = "Modern Bridal / Internasional"
    elif any(k in msg_lower for k in ["rustic", "dekorasi", "pelaminan", "tenda"]):
        theme_detected = "Dekorasi & Properti Acara"
    elif any(k in msg_lower for k in ["tunangan", "lamaran", "engagement"]):
        theme_detected = "Acara Tunangan / Lamaran"
    elif any(k in msg_lower for k in ["aqiqah"]):
        theme_detected = "Acara Aqiqah"

    reply_lines = [
        "Halo Kak! Senang sekali bisa mendampingi rencana momen bahagia Kakak bersama **Radja Wedding** ✨.",
        ""
    ]
    
    if theme_detected:
        reply_lines.append(f"Untuk konsep **{theme_detected}**, kami memiliki koleksi busana eksklusif dengan detail bordir halus dan pilihan rias MUA bersertifikat yang siap membuat penampilan Kakak tampil memukau.")
    else:
        reply_lines.append("Radja Wedding menyediakan layanan lengkap mulai dari **Sewa Tata Rias Pengantin (MUA)**, **Busana Adat & Modern**, **Aksesoris Eksklusif**, hingga **Dekorasi & Properti Pelaminan**.")
        
    reply_lines.append("")
    if suggested_bundles:
        reply_lines.append("**Rekomendasi Paket Bundle Favorit:**")
        for b in suggested_bundles[:2]:
            reply_lines.append(f"• **{b['bundle_name']}** — Rp {b['package_price']:,} *(Hemat & Lengkap)*")
        reply_lines.append("")
        
    if suggested_products:
        reply_lines.append("**Pilihan Item Unggulan Terkait:**")
        for p in suggested_products[:3]:
            reply_lines.append(f"• **{p['name']}** (Rp {p['price_per_day']:,}/hari)")
        reply_lines.append("")
        
    reply_lines.append("Kakak bisa langsung mengecek **Kalender Ketersediaan Tanggal** atau menyusun paket kustom secara mandiri melalui menu **Kustom Paket (Ala Carte)** kami. Ada yang ingin Kakak tanyakan lebih detail?")

    return {
        "reply": "\n".join(reply_lines),
        "suggested_products": suggested_products[:4],
        "suggested_bundles": suggested_bundles[:2]
    }

def find_matching_catalog(text: str, products: List[Product], bundles: List[Bundle]):
    t = text.lower()
    match_prods = []
    match_bundles = []
    
    for b in bundles:
        if (b.bundle_name.lower() in t or 
            any(ev in t for ev in (b.suitable_for_events or [])) or 
            ("paket" in t and "lengkap" in t)):
            match_bundles.append({
                "id": b.id,
                "bundle_name": b.bundle_name,
                "package_price": b.package_price,
                "image_url": b.image_url,
                "suitable_for_events": b.suitable_for_events
            })
            
    for p in products:
        theme = (p.attributes.get("theme", "") if p.attributes else "").lower()
        if (p.name.lower() in t or 
            (theme and theme in t) or 
            ("gaun" in t and "gaun" in p.name.lower()) or 
            ("rias" in t and "rias" in p.name.lower()) or 
            ("dekorasi" in t and "dekorasi" in p.name.lower()) or
            ("siger" in t and "siger" in p.name.lower())):
            match_prods.append({
                "id": p.id,
                "name": p.name,
                "price_per_day": p.price_per_day,
                "image_url": p.image_url,
                "category": p.category.name if p.category else "Item"
            })
            
    # Default fallbacks if empty
    if not match_bundles and bundles:
        match_bundles = [{
            "id": bundles[0].id,
            "bundle_name": bundles[0].bundle_name,
            "package_price": bundles[0].package_price,
            "image_url": bundles[0].image_url
        }]
    if not match_prods and products:
        match_prods = [{
            "id": p.id,
            "name": p.name,
            "price_per_day": p.price_per_day,
            "image_url": p.image_url,
            "category": p.category.name if p.category else "Item"
        } for p in products[:3]]
        
    return match_prods, match_bundles


# ====================================================================
# ADMIN AI EXECUTIVE ASSISTANT (CHAT-DRIVEN CRUD & NLQ ANALYTICS)
# ====================================================================

async def execute_admin_ai_command(
    db: Session,
    command: str,
    admin: Admin
) -> Dict[str, Any]:
    """
    Executes Admin AI commands via MCP / Tool Calling or Heuristic Intent Engine.
    Supports:
    - NLQ Analytics (Total pendapatan, booking terkonfirmasi, booking baru)
    - Booking mutation (Ubah status booking #ID / Nama ke Confirmed / DP Paid / Selesai)
    - Product quick-creation
    """
    cmd = command.strip()
    cmd_lower = cmd.lower()
    
    # Intent 1: Analytics / Pendapatan / Omset
    if any(k in cmd_lower for k in ["pemasukan", "pendapatan", "omset", "revenue", "penghasilan", "total uang"]):
        # Calculate confirmed & completed booking revenue
        paid_payments = db.query(Payment).filter(Payment.status == "verified").all()
        total_payment_sum = sum(p.amount for p in paid_payments)
        
        bookings_confirmed = db.query(Booking).filter(
            Booking.status.in_(["confirmed", "dp_paid", "fully_paid", "completed"])
        ).all()
        total_booking_potential = sum(b.total_price for b in bookings_confirmed)
        
        result_data = {
            "verified_payments_total": total_payment_sum,
            "confirmed_bookings_count": len(bookings_confirmed),
            "total_contract_value": total_booking_potential
        }
        
        log_audit(db, admin, "ai_query_revenue", "reports", None, result_data)
        
        reply = (
            f"📊 **Laporan Finansial Instan (Executive AI):**\n\n"
            f"• **Total Pembayaran Terverifikasi (Kas Masuk):** Rp {total_payment_sum:,}\n"
            f"• **Total Nilai Kontrak Booking Aktif:** Rp {total_booking_potential:,}\n"
            f"• **Jumlah Booking Terkonfirmasi:** {len(bookings_confirmed)} transaksi"
        )
        return {
            "action_type": "analytics",
            "reply": reply,
            "execution_result": result_data
        }

    # Intent 2: Status Booking Mutation (e.g. "Ubah status booking RADJA-xxx jadi Confirmed" or "Ubah status booking atas nama Budi jadi dp_paid")
    if any(k in cmd_lower for k in ["ubah status booking", "ganti status booking", "konfirmasi booking", "set booking"]):
        # Extract target status
        target_status = "confirmed"
        if "selesai" in cmd_lower or "completed" in cmd_lower:
            target_status = "completed"
        elif "dp" in cmd_lower or "dp paid" in cmd_lower or "dp_paid" in cmd_lower:
            target_status = "dp_paid"
        elif "batal" in cmd_lower or "cancelled" in cmd_lower:
            target_status = "cancelled"
        elif "lunas" in cmd_lower or "fully_paid" in cmd_lower:
            target_status = "fully_paid"
        elif "confirmed" in cmd_lower or "konfirmasi" in cmd_lower:
            target_status = "confirmed"
            
        # Try to find booking code or customer name
        booking = None
        # Check for booking code pattern
        code_match = re.search(r'(RADJA-[A-Za-z0-9\-]+|[a-f0-9\-]{8,})', cmd, re.IGNORECASE)
        if code_match:
            code_query = code_match.group(1)
            booking = db.query(Booking).filter(
                (Booking.booking_code.ilike(f"%{code_query}%")) | (Booking.id.ilike(f"%{code_query}%"))
            ).first()
            
        # Check by customer name
        if not booking:
            bookings = db.query(Booking).all()
            for b in bookings:
                if b.customer and b.customer.name.lower() in cmd_lower:
                    booking = b
                    break
                    
        # If still not found, take the latest pending booking as targeted candidate
        if not booking:
            booking = db.query(Booking).filter(Booking.status == "pending").order_by(Booking.created_at.desc()).first()

        if booking:
            old_status = booking.status
            booking.status = target_status
            booking.admin_notes = f"Diperbarui via Admin AI Assistant pada {datetime.now().strftime('%d/%m/%Y %H:%M')}"
            db.commit()
            db.refresh(booking)
            
            result_data = {
                "booking_id": booking.id,
                "booking_code": booking.booking_code,
                "customer_name": booking.customer.name if booking.customer else "Klien",
                "old_status": old_status,
                "new_status": target_status
            }
            log_audit(db, admin, "ai_update_booking_status", "bookings", booking.id, result_data)
            
            reply = (
                f"✅ **Aksi Berhasil Dijalankan via MCP Tool:**\n\n"
                f"Status pesanan **{booking.booking_code}** ({result_data['customer_name']}) "
                f"berhasil diubah dari `{old_status.upper()}` menjadi `{target_status.upper()}`."
            )
            return {
                "action_type": "mutation",
                "reply": reply,
                "execution_result": result_data
            }
        else:
            return {
                "action_type": "general_info",
                "reply": "⚠️ Tidak ditemukan pesanan yang cocok untuk diubah statusnya. Mohon sertakan Kode Booking (misal: `RADJA-2026-001`) atau nama pemesan.",
                "execution_result": None
            }

    # Intent 3: Quick Add Product (e.g. "Tambahkan produk dekorasi baru namanya Lampu Gantung Peri, harga sewa 50 ribu per hari")
    if any(k in cmd_lower for k in ["tambah produk", "tambahkan produk", "buat produk", "tambah item"]):
        # Extract name and price
        # Extract price
        price = 150000
        price_match = re.search(r'(\d+[\d\.,]*)\s*(ribu|rb|k|juta|jt)?', cmd_lower)
        if price_match:
            val_str = price_match.group(1).replace(".", "").replace(",", "")
            try:
                base_val = int(val_str)
                unit = price_match.group(2)
                if unit in ["ribu", "rb", "k"]:
                    price = base_val * 1000 if base_val < 1000 else base_val
                elif unit in ["juta", "jt"]:
                    price = base_val * 1000000
                else:
                    price = base_val
            except Exception:
                price = 150000

        # Extract name
        name = "Item Baru Radja"
        name_match = re.search(r'namanya\s+([^\,\.]+)', cmd, re.IGNORECASE)
        if not name_match:
            name_match = re.search(r'nama\s+([^\,\.]+)', cmd, re.IGNORECASE)
        if name_match:
            name = name_match.group(1).strip()
            
        # Determine category
        cat_slug = "dekorasi"
        if "gaun" in cmd_lower or "kebaya" in cmd_lower or "busana" in cmd_lower:
            cat_slug = "busana"
        elif "rias" in cmd_lower or "makeup" in cmd_lower or "mua" in cmd_lower:
            cat_slug = "rias"
        elif "aksesor" in cmd_lower or "siger" in cmd_lower or "mahkota" in cmd_lower:
            cat_slug = "aksesoris"
            
        category = db.query(Category).filter(Category.slug == cat_slug).first()
        
        new_prod = Product(
            category_id=category.id if category else None,
            name=name,
            description=f"Ditambahkan secara otomatis melalui Admin AI Assistant",
            price_per_day=price,
            stock_unit=2,
            is_active=True,
            attributes={"theme": "Universal", "size": "All Size"}
        )
        db.add(new_prod)
        db.commit()
        db.refresh(new_prod)
        
        result_data = {
            "product_id": new_prod.id,
            "name": new_prod.name,
            "category": category.name if category else "Umum",
            "price_per_day": new_prod.price_per_day
        }
        log_audit(db, admin, "ai_create_product", "products", new_prod.id, result_data)
        
        reply = (
            f"✨ **Produk Baru Berhasil Ditambahkan ke Database:**\n\n"
            f"• **Nama:** {new_prod.name}\n"
            f"• **Kategori:** {result_data['category']}\n"
            f"• **Harga Sewa:** Rp {new_prod.price_per_day:,}/hari\n"
            f"• **Stok Fisik:** 2 unit\n"
            f"• **Status:** Aktif di Katalog"
        )
        return {
            "action_type": "mutation",
            "reply": reply,
            "execution_result": result_data
        }

    # Intent 4: General Admin Overview / Listing
    pending_count = db.query(Booking).filter(Booking.status == "pending").count()
    active_count = db.query(Booking).filter(Booking.status.in_(["confirmed", "dp_paid"])).count()
    
    reply = (
        f"Halo Pak/Bu Admin! Berikut ringkasan operasional saat ini:\n\n"
        f"• **Booking Menunggu Konfirmasi:** {pending_count} pesanan\n"
        f"• **Booking Sedang Berjalan/Terkonfirmasi:** {active_count} pesanan\n\n"
        f"Anda dapat memberi saya perintah seperti:\n"
        f"1. *'Tampilkan total omset bulan ini'* (NLQ Analytics)\n"
        f"2. *'Ubah status booking ID [Kode] jadi Confirmed'* (Database Mutation)\n"
        f"3. *'Tambahkan produk gaun baru namanya Gaun Satin Silk, harga sewa 350 ribu'* (Auto Create)"
    )
    return {
        "action_type": "general_info",
        "reply": reply,
        "execution_result": {
            "pending_count": pending_count,
            "active_count": active_count
        }
    }

def log_audit(db: Session, admin: Admin, action: str, entity: str, entity_id: str, details: Any):
    try:
        log = AuditLog(
            admin_id=admin.id if admin else None,
            admin_name=admin.full_name if admin else "Admin AI",
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id else None,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception:
        pass
