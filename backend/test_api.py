import asyncio
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    # 1. Health check
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] Health Check Passed")

    # 2. Public categories & products
    res = client.get("/api/v1/public/categories")
    assert res.status_code == 200 and len(res.json()) >= 4
    print(f"[OK] Categories loaded: {len(res.json())} categories")

    res = client.get("/api/v1/public/products")
    assert res.status_code == 200 and len(res.json()) > 0
    products = res.json()
    prod_id = products[0]["id"]
    print(f"[OK] Products loaded: {len(products)} items. Sample: {products[0]['name']}")

    # 3. Public bundles
    res = client.get("/api/v1/public/bundles")
    assert res.status_code == 200 and len(res.json()) > 0
    bundles = res.json()
    bundle_id = bundles[0]["id"]
    print(f"[OK] Bundles loaded: {len(bundles)} bundles. Sample: {bundles[0]['bundle_name']}")

    # 4. Check availability
    future_date_start = (date.today() + timedelta(days=60)).isoformat()
    future_date_end = (date.today() + timedelta(days=61)).isoformat()
    res = client.post("/api/v1/public/check-availability", json={
        "start_date": future_date_start,
        "end_date": future_date_end,
        "bundle_ids": [bundle_id],
        "product_ids": [prod_id]
    })
    assert res.status_code == 200
    assert res.json()["is_available"] == True
    print("[OK] Availability Check Passed (Clean future dates)")

    # 5. Customer Login
    res = client.post("/api/v1/auth/login", json={
        "email": "amamiya@wedding.com",
        "password": "customer123"
    })
    assert res.status_code == 200
    cust_token = res.json()["access_token"]
    print("[OK] Customer Auth Passed")

    # 6. Admin Login
    res = client.post("/api/v1/auth/admin/login", json={
        "email": "admin@radja.com",
        "password": "admin123"
    })
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    print("[OK] Admin Auth Passed")

    # 7. Customer Booking Creation
    booking_payload = {
        "event_type": "wedding",
        "location_address": "Hotel Mulia Senayan, Jakarta Pusat",
        "start_date": future_date_start,
        "end_date": future_date_end,
        "notes": "Tes automated booking suite",
        "selected_bundles": [{"bundle_id": bundle_id}],
        "custom_items": [{"product_id": prod_id, "quantity": 1}]
    }
    res = client.post(
        "/api/v1/customer/bookings",
        json=booking_payload,
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert res.status_code == 200
    new_bk = res.json()
    bk_id = new_bk["id"]
    print(f"[OK] Booking Created: {new_bk['booking_code']} (Total: Rp {new_bk['total_price']:,})")

    # 8. Upload payment proof
    res = client.post(
        f"/api/v1/customer/bookings/{bk_id}/payment",
        data={"amount": new_bk["dp_amount"], "type": "dp", "method": "transfer_bank"},
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert res.status_code == 200
    payment_id = res.json()["id"]
    print(f"[OK] Payment Uploaded: ID {payment_id} Amount Rp {res.json()['amount']:,}")

    # 9. Admin Verifies Payment
    res = client.put(
        f"/api/v1/admin/payments/{payment_id}/verify",
        json={"status": "verified"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    print("[OK] Admin Payment Verified (Auto-transited booking status)")

    # 10. Test AI Kirana
    res = client.post(
        "/api/v1/ai/kirana/chat",
        json={"message": "Saya mau tanya rekomendasi gaun dan rias untuk tema Sunda Siger"}
    )
    assert res.status_code == 200
    ai_resp = res.json()
    assert len(ai_resp["reply"]) > 20
    print("[OK] Kirana AI Consultant Chat Passed")

    # 11. Test Admin AI Assistant
    res = client.post(
        "/api/v1/ai/admin/command",
        json={"command": "Tampilkan total pemasukan dari booking terkonfirmasi bulan ini"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    print(f"[OK] Admin AI Assistant Command Passed: {res.json()['action_type']}")

    print("\n=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_api()
