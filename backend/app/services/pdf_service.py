from datetime import datetime
from typing import Dict, Any
from app.models.models import Booking

def generate_invoice_html(booking: Booking) -> str:
    """
    Generates a high-end, printable HTML invoice for the booking in rich dark maroon & gold theme.
    """
    customer_name = booking.customer.name if booking.customer else "Klien"
    customer_email = booking.customer.email if booking.customer else "-"
    customer_phone = booking.customer.whatsapp if booking.customer else "-"
    
    status_color = {
        "pending": "#D97706",
        "confirmed": "#2563EB",
        "dp_paid": "#801D33",
        "fully_paid": "#059669",
        "completed": "#047857",
        "cancelled": "#DC2626"
    }.get(booking.status, "#4B5563")
    
    status_label = {
        "pending": "MENUNGGU KONFIRMASI",
        "confirmed": "DIKONFIRMASI",
        "dp_paid": "DP DITERIMA",
        "fully_paid": "LUNAS",
        "completed": "SELESAI",
        "cancelled": "DIBATALKAN"
    }.get(booking.status, booking.status.upper())

    # Build items rows
    items_html = ""
    for bundle in booking.selected_bundles:
        items_html += f"""
        <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3E8EA;">
                <strong style="color: #6D1C2F;">[Paket Master Bundle] {bundle.name}</strong><br>
                <span style="font-size: 11px; color: #6B7280;">Paket busana & rias pengantin lengkap</span>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3E8EA; text-align: center;">1 Paket</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3E8EA; text-align: right; font-weight: bold; color: #801D33;">Rp {bundle.price_snapshot:,.0f}</td>
        </tr>
        """
        
    for item in booking.custom_items:
        subtotal = item.price_snapshot * item.quantity
        items_html += f"""
        <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3E8EA;">
                <strong>{item.name}</strong><br>
                <span style="font-size: 11px; color: #6B7280;">Sewa Satuan Ala Carte</span>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3E8EA; text-align: center;">{item.quantity} Unit</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3E8EA; text-align: right; font-weight: bold; color: #801D33;">Rp {subtotal:,.0f}</td>
        </tr>
        """

    verified_payments = [p for p in booking.payments if p.status == 'verified']
    total_paid = sum(p.amount for p in verified_payments)
    balance_due = max(0, booking.total_price - total_paid)

    payments_rows = ""
    if verified_payments:
        for p in verified_payments:
            payments_rows += f"""
            <tr>
                <td style="padding: 8px 16px; color: #059669; font-size: 12px;">
                    ✓ Pembayaran Terverifikasi ({p.type.upper()} - {p.method})
                </td>
                <td style="padding: 8px 16px; text-align: right; color: #059669; font-weight: bold; font-size: 12px;">
                    - Rp {p.amount:,.0f}
                </td>
            </tr>
            """

    return f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Invoice - {booking.booking_code} - Radja Wedding</title>
        <style>
            @media print {{
                body {{ -webkit-print-color-adjust: exact; }}
                .no-print {{ display: none !important; }}
            }}
            body {{
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: #1F2937;
                background-color: #F9FAFB;
                margin: 0;
                padding: 24px;
            }}
            .invoice-card {{
                max-width: 800px;
                margin: 0 auto;
                background: #FFFFFF;
                border: 1px solid #E5E7EB;
                border-radius: 20px;
                box-shadow: 0 10px 25px -5px rgba(128, 29, 51, 0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #4A0B19 0%, #801D33 100%);
                color: #FFFFFF;
                padding: 36px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            .logo-text {{
                font-size: 26px;
                font-weight: 800;
                letter-spacing: 1px;
                color: #FDFBF7;
            }}
            .logo-sub {{
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #FDE8EA;
                margin-top: 4px;
            }}
            .badge {{
                display: inline-block;
                padding: 6px 14px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                background-color: {status_color};
                color: #FFFFFF;
            }}
        </style>
    </head>
    <body>

        <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; display: flex; justify-content: flex-end; gap: 12px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #801D33; color: #FFFFFF; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 13px;">
                🖨️ Cetak / Unduh PDF
            </button>
        </div>

        <div class="invoice-card">
            <!-- Header -->
            <div class="header">
                <div>
                    <div class="logo-text">👑 RADJA WEDDING</div>
                    <div class="logo-sub">Salon Radja • Rias & Busana Pengantin</div>
                </div>
                <div style="text-align: right;">
                    <span class="badge">{status_label}</span>
                    <div style="margin-top: 8px; font-size: 13px; color: #FDE8EA; font-weight: bold;">
                        {booking.booking_code}
                    </div>
                </div>
            </div>

            <!-- Client & Event Info -->
            <div style="padding: 36px 40px; border-bottom: 1px solid #F3E8EA; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div>
                    <p style="font-size: 11px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; margin: 0 0 6px 0;">Ditujukan Kepada:</p>
                    <h3 style="margin: 0 0 4px 0; color: #111827; font-size: 18px;">{customer_name}</h3>
                    <p style="margin: 2px 0; font-size: 13px; color: #4B5563;">Email: {customer_email}</p>
                    <p style="margin: 2px 0; font-size: 13px; color: #4B5563;">WhatsApp: {customer_phone}</p>
                </div>
                <div>
                    <p style="font-size: 11px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; margin: 0 0 6px 0;">Detail Acara:</p>
                    <p style="margin: 2px 0; font-size: 13px; color: #111827;"><strong>Jenis Acara:</strong> <span style="text-transform: capitalize;">{booking.event_type}</span></p>
                    <p style="margin: 2px 0; font-size: 13px; color: #111827;"><strong>Jadwal:</strong> {booking.start_date.strftime('%d %B %Y')} s/d {booking.end_date.strftime('%d %B %Y')}</p>
                    <p style="margin: 2px 0; font-size: 13px; color: #4B5563;"><strong>Lokasi:</strong> {booking.location_address}</p>
                </div>
            </div>

            <!-- Items Table -->
            <div style="padding: 0 40px;">
                <table style="width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #FAF0F2; color: #6D1C2F; text-transform: uppercase; font-size: 11px; font-weight: 700;">
                            <th style="padding: 12px 16px; text-align: left; border-radius: 8px 0 0 8px;">Deskripsi Layanan / Item</th>
                            <th style="padding: 12px 16px; text-align: center;">Kuantitas</th>
                            <th style="padding: 12px 16px; text-align: right; border-radius: 0 8px 8px 0;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
            </div>

            <!-- Financial Summary -->
            <div style="padding: 24px 40px 36px 40px; display: flex; justify-content: flex-end;">
                <div style="width: 320px;">
                    <table style="width: 100%; font-size: 13px;">
                        <tr>
                            <td style="padding: 6px 16px; color: #4B5563;">Total Nilai Kontrak:</td>
                            <td style="padding: 6px 16px; text-align: right; font-weight: bold; color: #111827;">Rp {booking.total_price:,.0f}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 16px; color: #6D1C2F; font-weight: 600;">Kewajiban DP (30%):</td>
                            <td style="padding: 6px 16px; text-align: right; font-weight: bold; color: #801D33;">Rp {booking.dp_amount:,.0f}</td>
                        </tr>
                        {payments_rows}
                        <tr style="border-top: 2px solid #E5E7EB;">
                            <td style="padding: 12px 16px; font-weight: 800; font-size: 15px; color: #111827;">Sisa Tagihan:</td>
                            <td style="padding: 12px 16px; text-align: right; font-weight: 800; font-size: 16px; color: #801D33;">
                                Rp {balance_due:,.0f}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer Note -->
            <div style="background-color: #FAF0F2; padding: 20px 40px; border-top: 1px solid #F3E8EA; font-size: 11px; color: #6B7280; text-align: center;">
                Kwitansi & Invoice ini merupakan bukti pemesanan resmi yang sah dari Salon Radja (salonradja.com).<br>
                Pertanyaan dan konfirmasi jadwal dapat menghubungi Customer Service di WhatsApp +62 812-3456-7890.
            </div>
        </div>

    </body>
    </html>
    """
