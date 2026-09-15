from datetime import datetime, date, timedelta
from app.db.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Admin, Category, Product, ProductImage, Bundle, BundleItem,
    Booking, BookingItem, BookingBundle, Payment, Gallery, GalleryImage,
    Testimonial, AvailabilityBlock
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(Admin).first():
            print("Database already contains data. Skipping initial seeding.")
            return

        print("Seeding database with Radja Wedding master data...")

        # 1. Admins
        owner = Admin(
            full_name="Radja Owner / Manajer",
            email="admin@radja.com",
            password_hash=get_password_hash("admin123"),
            role="owner"
        )
        staff = Admin(
            full_name="Kasir & Staf Operasional",
            email="staf@radja.com",
            password_hash=get_password_hash("staf123"),
            role="staff"
        )
        db.add_all([owner, staff])
        db.commit()

        # 2. Customers
        cust1 = User(
            name="Amamiya & Pasangan",
            email="amamiya@wedding.com",
            whatsapp="081298765432",
            is_whatsapp_verified=True,
            address="Jl. Melati Raya No. 45, Jakarta Selatan",
            password_hash=get_password_hash("customer123"),
            is_registered=True
        )
        cust2 = User(
            name="Siti Rahmawati",
            email="siti.rahma@gmail.com",
            whatsapp="085612349876",
            is_whatsapp_verified=True,
            address="Jl. Anggrek No. 12, Bandung",
            password_hash=get_password_hash("customer123"),
            is_registered=True
        )
        db.add_all([cust1, cust2])
        db.commit()

        # 3. Categories
        cat_rias = Category(name="Tata Rias (MUA)", slug="rias", icon="Sparkles", description="Rias pengantin akad, resepsi, wisuda, dan keluarga")
        cat_busana = Category(name="Busana Pengantin & Adat", slug="busana", icon="Shirt", description="Koleksi busana pengantin adat Nusantara & modern bridal")
        cat_aksesoris = Category(name="Aksesoris & Mahkota", slug="aksesoris", icon="Crown", description="Siger Sunda, Paes Jawa, Mahkota Tiara, & Perhiasan")
        cat_dekorasi = Category(name="Dekorasi & Pelaminan", slug="dekorasi", icon="Flower2", description="Dekorasi pelaminan rustic, adat gebyok, & mini garden")
        cat_properti = Category(name="Tenda & Properti Acara", slug="properti", icon="Tent", description="Tenda VIP, kursi, karpet, panggung, sound & lighting")
        
        db.add_all([cat_rias, cat_busana, cat_aksesoris, cat_dekorasi, cat_properti])
        db.commit()

        # 4. Products
        p1 = Product(
            category_id=cat_busana.id,
            name="Kebaya Gaun Pengantin Siger Sunda Modern Putih",
            description="Kebaya putih elegan bertabur payet jepang premium dengan ekor gaun 2 meter. Cocok untuk akad dan resepsi adat Sunda.",
            price_per_day=1250000,
            dp_percentage=30.0,
            stock_unit=2,
            image_url="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Sunda Modern", "size": "M / L", "color": "Off White", "fabric": "Tulle & Brokat Prancis"}
        )
        p2 = Product(
            category_id=cat_busana.id,
            name="Kebaya Bludru Adat Jawa Solo Putri Hitam Emas",
            description="Koleksi busana pengantin adat Solo Putri klasik berbahan bludru sutra halus dengan bordiran benang emas khas keraton.",
            price_per_day=1500000,
            dp_percentage=30.0,
            stock_unit=1,
            image_url="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Adat Jawa Solo", "size": "All Size (Adjustable)", "color": "Jet Black & Gold"}
        )
        p3 = Product(
            category_id=cat_busana.id,
            name="Gaun Bridal Princess White Sparkle Luxury",
            description="Gaun pengantin internasional model Ballgown mewah dengan detail glitter kristal yang berkilau di bawah tata cahaya panggung.",
            price_per_day=1850000,
            dp_percentage=30.0,
            stock_unit=1,
            image_url="https://images.unsplash.com/photo-1546804784-896d0dca3805?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Modern Bridal", "size": "S / M", "color": "Pure White", "silhouette": "Ballgown"}
        )
        p4 = Product(
            category_id=cat_busana.id,
            name="Busana Pengantin Adat Minang Suntiang Merah Marun",
            description="Baju kurung pengantin Padang berbahan songket Pandai Sikek asli dengan paduan warna merah marun dan emas mewah.",
            price_per_day=1600000,
            dp_percentage=30.0,
            stock_unit=1,
            image_url="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Adat Minang Padang", "size": "M / L", "color": "Maroon & Gold"}
        )
        p5 = Product(
            category_id=cat_busana.id,
            name="Set Beskap Pengantin Pria Adat & Modern",
            description="Setelan beskap pengantin pria lengkap dengan kain jarik, blangkon, selop, dan keris hias.",
            price_per_day=450000,
            dp_percentage=30.0,
            stock_unit=4,
            image_url="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Universal", "size": "L / XL", "color": "Hitam / Putih / Rose Gold"}
        )
        p6 = Product(
            category_id=cat_rias.id,
            name="Paket Rias MUA Flawless Hijab Akad & Resepsi",
            description="Layanan tata rias profesional tahan 16 jam, teknik complexions halus tanpa cakey, termasuk retouch 1x dan hijab do.",
            price_per_day=1750000,
            dp_percentage=30.0,
            stock_unit=2,
            image_url="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Modern Flawless", "service_type": "MUA Pengantin Utama", "duration": "Full Day"}
        )
        p7 = Product(
            category_id=cat_rias.id,
            name="Tata Rias Tradisional Sunda / Jawa Halus",
            description="Rias pengantin pakem adat tradisional dengan pemasangan ronce melati asli, cunduk mentul, dan paes halus.",
            price_per_day=1500000,
            dp_percentage=30.0,
            stock_unit=2,
            image_url="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Adat Tradisional", "service_type": "MUA Pakem", "duration": "6 Jam"}
        )
        p8 = Product(
            category_id=cat_rias.id,
            name="Rias Ibu & Besan (2 Orang)",
            description="Rias wajah natural elegan dan hairdo/hijabdo untuk 2 orang ibu pengantin/besan.",
            price_per_day=600000,
            dp_percentage=30.0,
            stock_unit=3,
            image_url="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Universal", "service_type": "Family Makeup", "quota": "2 Orang"}
        )
        p9 = Product(
            category_id=cat_aksesoris.id,
            name="Siger Sunda Kencana Sepuh Emas + Kembang Goyang",
            description="Mahkota Siger Sunda motif merak sepuh emas berkilau, kokoh, dan nyaman dipakai sepanjang hari.",
            price_per_day=350000,
            dp_percentage=30.0,
            stock_unit=3,
            image_url="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Sunda", "material": "Kuningan Sepuh Emas 24k"}
        )
        p10 = Product(
            category_id=cat_aksesoris.id,
            name="Mahkota Tiara Swarovski Crystal Royal",
            description="Tiara bridal mahkota putri kerajaan bertabur kristal Swarovski asli berkilau tinggi.",
            price_per_day=250000,
            dp_percentage=30.0,
            stock_unit=3,
            image_url="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Modern Bridal", "material": "Swarovski Elements"}
        )
        p11 = Product(
            category_id=cat_dekorasi.id,
            name="Dekorasi Pelaminan Rustic Wooden Floral 6 Meter",
            description="Backdrop pelaminan tema rustic modern dengan ornamen kayu jati belanda, bunga segar artifisial premium, standing lamp, dan karpet rumput.",
            price_per_day=3500000,
            dp_percentage=30.0,
            stock_unit=2,
            image_url="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Rustic Floral", "dimensions": "Panjang 6m x Tinggi 2.8m"}
        )
        p12 = Product(
            category_id=cat_dekorasi.id,
            name="Dekorasi Pelaminan Adat Gebyok Ukir Jepara 8 Meter",
            description="Pelaminan megah gebyok kayu ukir khas Jepara asli dengan taman bunga fresh & tata cahaya warm spotlight.",
            price_per_day=4500000,
            dp_percentage=30.0,
            stock_unit=1,
            image_url="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Adat Tradisional", "dimensions": "Panjang 8m x Tinggi 3.2m"}
        )
        p13 = Product(
            category_id=cat_properti.id,
            name="Paket Tenda Plafon Semi-VIP & Karpet (50 m2)",
            description="Tenda dekorasi plafon serut 2 warna, rangka kokoh, dilengkapi karpet merah jalan.",
            price_per_day=1200000,
            dp_percentage=30.0,
            stock_unit=3,
            image_url="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
            attributes={"theme": "Universal", "dimensions": "50 Meter Persegi"}
        )
        
        db.add_all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13])
        db.commit()

        # 5. Bundles
        b1 = Bundle(
            bundle_name="Paket Ratu Kencana (Sunda / Jawa Full Package)",
            description="Solusi lengkap pernikahan adat impian: Gaun & Kebaya Pengantin Utama, Setelan Beskap Pria, Rias MUA Flawless Akad & Resepsi, Mahkota Siger / Paes, serta Rias 2 Ibu Besan.",
            package_price=4800000,
            dp_percentage=30.0,
            suitable_for_events=["wedding", "resepsi"],
            image_url="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
            is_active=True
        )
        b2 = Bundle(
            bundle_name="Paket Royal Elegance Bridal Modern",
            description="Paket internasional serba mewah: Gaun Bridal Princess Sparkle, Rias MUA Flawless Glamour, Tiara Swarovski Royal, Jas Groom Premium, dan Touch-up resepsi.",
            package_price=5200000,
            dp_percentage=30.0,
            suitable_for_events=["wedding", "international_wedding"],
            image_url="https://images.unsplash.com/photo-1546804784-896d0dca3805?auto=format&fit=crop&w=800&q=80",
            is_active=True
        )
        b3 = Bundle(
            bundle_name="Paket Melati Suci (Akad Nikah Intimate)",
            description="Paket hemat khusus acara akad nikah sakral: Rias MUA Akad Halus, Sepasang Kebaya & Beskap Akad, dan Aksesoris Melati.",
            package_price=2900000,
            dp_percentage=30.0,
            suitable_for_events=["wedding", "akad_nikah"],
            image_url="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
            is_active=True
        )
        b4 = Bundle(
            bundle_name="Paket Grand Mahligai (Busana + Rias + Dekorasi Pelaminan)",
            description="Paket All-in-One: Busana sepasang, Rias MUA Pengantin + Ibu, Aksesoris Lengkap, dan Dekorasi Pelaminan Rustic Floral 6m.",
            package_price=8900000,
            dp_percentage=30.0,
            suitable_for_events=["wedding", "engagement", "corporate"],
            image_url="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            is_active=True
        )
        
        db.add_all([b1, b2, b3, b4])
        db.commit()

        # Bundle items
        db.add_all([
            BundleItem(bundle_id=b1.id, product_id=p1.id, quantity=1),
            BundleItem(bundle_id=b1.id, product_id=p5.id, quantity=1),
            BundleItem(bundle_id=b1.id, product_id=p6.id, quantity=1),
            BundleItem(bundle_id=b1.id, product_id=p9.id, quantity=1),
            BundleItem(bundle_id=b1.id, product_id=p8.id, quantity=1),

            BundleItem(bundle_id=b2.id, product_id=p3.id, quantity=1),
            BundleItem(bundle_id=b2.id, product_id=p5.id, quantity=1),
            BundleItem(bundle_id=b2.id, product_id=p6.id, quantity=1),
            BundleItem(bundle_id=b2.id, product_id=p10.id, quantity=1),

            BundleItem(bundle_id=b3.id, product_id=p1.id, quantity=1),
            BundleItem(bundle_id=b3.id, product_id=p5.id, quantity=1),
            BundleItem(bundle_id=b3.id, product_id=p7.id, quantity=1),

            BundleItem(bundle_id=b4.id, product_id=b1.id, quantity=1),
            BundleItem(bundle_id=b4.id, product_id=p11.id, quantity=1)
        ])
        db.commit()

        # 6. Sample Bookings
        today = date.today()
        event_date_1 = today + timedelta(days=14)
        event_date_2 = today + timedelta(days=28)
        
        bk1 = Booking(
            booking_code="RADJA-20260819-A81F",
            customer_id=cust1.id,
            event_type="wedding",
            location_address="Gedung Graha Mandiri Lt. 3, Jakarta Selatan",
            start_date=event_date_1,
            end_date=event_date_1,
            total_price=4800000,
            dp_amount=1440000,
            status="dp_paid",
            notes="Minta tema Sunda Siger modern, warna jilbab senada gaun off-white."
        )
        db.add(bk1)
        db.commit()
        
        db.add(BookingBundle(booking_id=bk1.id, bundle_id=b1.id, name=b1.bundle_name, price_snapshot=4800000))
        db.add(Payment(
            booking_id=bk1.id,
            amount=1440000,
            type="dp",
            method="transfer_bank",
            proof_url="/uploads/payments/sample_proof.jpg",
            status="verified",
            verified_by=owner.id,
            verified_at=datetime.now()
        ))
        db.add(AvailabilityBlock(product_id=p1.id, blocked_date=event_date_1, booking_id=bk1.id, reason="booking"))
        db.add(AvailabilityBlock(product_id=p6.id, blocked_date=event_date_1, booking_id=bk1.id, reason="booking"))
        db.commit()

        bk2 = Booking(
            booking_code="RADJA-20260825-9B2C",
            customer_id=cust2.id,
            event_type="engagement",
            location_address="Kediaman Mempelai Wanita, Jl. Anggrek 12, Bandung",
            start_date=event_date_2,
            end_date=event_date_2,
            total_price=2900000,
            dp_amount=870000,
            status="pending",
            notes="Acara lamaran / tunangan intimate."
        )
        db.add(bk2)
        db.commit()
        db.add(BookingBundle(booking_id=bk2.id, bundle_id=b3.id, name=b3.bundle_name, price_snapshot=2900000))
        db.add(Payment(
            booking_id=bk2.id,
            amount=870000,
            type="dp",
            method="qris",
            proof_url="/uploads/payments/sample_proof.jpg",
            status="pending"
        ))
        db.commit()

        # 7. Galleries
        g1 = Gallery(
            title="Pernikahan Adat Sunda Siger - Nisa & Rizky",
            description="Momen bahagia dengan busana kebaya putih modern dan sentuhan Siger Sunda Kencana.",
            category_id=cat_busana.id,
            event_type="wedding",
            cover_url="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80"
        )
        g2 = Gallery(
            title="Royal Modern Bridal Glamour - Jessica & Daniel",
            description="Konsep internasional mewah dengan Ballgown Sparkle dan tata rias MUA Hollywood Glam.",
            category_id=cat_busana.id,
            event_type="wedding",
            cover_url="https://images.unsplash.com/photo-1546804784-896d0dca3805?auto=format&fit=crop&w=800&q=80"
        )
        g3 = Gallery(
            title="Pelaminan Rustic Garden Wedding - Dita & Fajar",
            description="Sentuhan kayu rustic floral 6 meter berpadu lampu warm fairy light.",
            category_id=cat_dekorasi.id,
            event_type="wedding",
            cover_url="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
        )
        db.add_all([g1, g2, g3])
        db.commit()

        db.add_all([
            GalleryImage(gallery_id=g1.id, media_url="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80", caption="Detail Siger & Rias Akad", sort_order=0),
            GalleryImage(gallery_id=g1.id, media_url="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", caption="Prosesi Serah Terima", sort_order=1),
            GalleryImage(gallery_id=g2.id, media_url="https://images.unsplash.com/photo-1546804784-896d0dca3805?auto=format&fit=crop&w=800&q=80", caption="Gaun Ballgown Luxury", sort_order=0),
            GalleryImage(gallery_id=g3.id, media_url="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", caption="Backdrop Pelaminan 6m", sort_order=0)
        ])
        db.commit()

        # 8. Testimonials
        t1 = Testimonial(
            user_id=cust1.id,
            customer_name="Nisa & Rizky (Jakarta)",
            rating=5,
            content="Gaun Sunda Siger-nya bener-bener mewah dan wangi banget! MUA dari Radja Wedding kerjanya sangat detail, makeup tahan dari pagi sampai malam tanpa geser sama sekali. Sangat recommended!",
            photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            event_name="Pernikahan Adat Sunda",
            status="approved",
            is_featured=True
        )
        t2 = Testimonial(
            user_id=cust2.id,
            customer_name="Siti Rahmawati (Bandung)",
            rating=5,
            content="Pelayanan admin cepat dan ramah, konsultasi via AI Kirana juga sangat ngebantu nemuin referensi paket yang pas dengan budget kami. Sukses terus Radja Wedding!",
            photo_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            event_name="Lamaran & Akad Nikah",
            status="approved",
            is_featured=True
        )
        t3 = Testimonial(
            customer_name="Dr. Amanda & Arya (Depok)",
            rating=5,
            content="Paket Grand Mahligai benar-benar worth it! Gaunnya pas badan saat fitting, dekorasi pelaminan rustic bunganya cantik banget bikin foto resepsi keliatan mahal.",
            photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            event_name="Resepsi Rustic Modern",
            status="approved",
            is_featured=True
        )
        db.add_all([t1, t2, t3])
        db.commit()

        print("Database seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
