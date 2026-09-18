import sqlite3
import json
import os
import re

def clean_phone_number(phone_str):
    if not phone_str:
        return ""
    digits = re.sub(r'\D', '', str(phone_str))
    if len(digits) >= 8:
        if not digits.startswith('0') and len(digits) <= 11:
            digits = '0' + digits
        return digits
    return ""

def sync_real_data_to_crm(db_path, leads_json_path, waitlist_output_path):
    print(f"==================================================")
    print(f"🔄 NÂNG CẤP BẢNG PRODUCTS & ĐỒNG BỘ DATA THỰC TẠI: {db_path}")
    print(f"==================================================")

    # 1. ĐỌC DỮ LIỆU THỰC TỪ SUPABASE
    with open(leads_json_path, 'r', encoding='utf-8') as f:
        raw_leads = json.load(f)

    # 2. XÂY DỰNG FILE waitlist.json TỪ DATA THỰC TẾ TRÊN SUPABASE / GOOGLE SHEETS
    waitlist_data = []
    seen_phones = set()

    for item in raw_leads:
        phone = clean_phone_number(item.get("phone"))
        name = (item.get("name") or "Khách Hàng").strip()
        if not phone or "Chưa" in name or "Nút" in name:
            continue

        reg_time = item.get("time_str") or item.get("created_at") or "18/09/2026"
        zalo = phone # Mặc định liên hệ qua số điện thoại Zalo

        waitlist_data.append({
            "name": name,
            "phone": phone,
            "zalo": zalo,
            "course_registered": item.get("course", ""),
            "price": item.get("price", ""),
            "status": item.get("status", "Chờ tư vấn"),
            "registered_at": reg_time
        })

    # Lưu lại file waitlist.json thực tế
    with open(waitlist_output_path, 'w', encoding='utf-8') as f:
        json.dump(waitlist_data, f, ensure_ascii=False, indent=2)
    print(f"📄 Đã cập nhật file [waitlist.json] với {len(waitlist_data)} bản ghi thực tế từ Supabase/Google Sheets.")

    # 3. KẾT NỐI DATABASE VÀ CẬP NHẬT CẤU TRÚC
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")

    # XÓA CŨ VÀ TẠO MỚI BẢNG PRODUCTS VỚI CỘT registered_count (Số lượng đã đăng ký)
    cursor.execute("DROP TABLE IF EXISTS products;")
    cursor.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('physical', 'digital', 'service')),
        price REAL NOT NULL CHECK(price >= 0),
        description TEXT,
        registered_count INTEGER DEFAULT 0 CHECK(registered_count >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("✅ Đã cập nhật bảng [products]: Chuyển 'stock_quantity' thành 'registered_count' (Số lượng đã đăng ký).")

    # Danh mục sản phẩm chuẩn của Simon Chiropractic Center
    products_list = [
        ("The Full Online Collection (Trọn bộ Online)", "digital", 14900000.0, "Trọn bộ Full-Spine E-Learning Video 4K POV, Drills rèn lực, cấp chứng chỉ", 0),
        ("Khóa 1 — Nắn Chỉnh Cột Sống Chuyên Biệt (Spine / Modul A)", "digital", 2100000.0, "Chuyên đề nắn chỉnh cột sống chuyên sâu", 0),
        ("Combo Trọn Khóa (Full Track 3 Khóa) + 1 Năm Thành Viên", "digital", 6600000.0, "Combo 3 khóa chuyên sâu + 1 năm hội viên Alumni", 0),
        ("Khóa Học Test Thanh Toán Tự Động SePay", "digital", 2000.0, "Khóa học test tích hợp cổng ACB SePay", 0),
        ("Khóa Offline Cầm tay chỉ việc (Hands-on Mentorship)", "service", 40000000.0, "4 ngày thực hành trực tiếp cùng Bác sĩ Henrik Simon", 0),
        ("Tageshospitation (Đi thực tế lâm sàng)", "service", 2500000.0, "1 ngày thực tế khám bệnh nhân tại Simon Center", 0),
        ("Giáo trình Chiropractic Y Khoa & Thước Đo Cột Sống", "physical", 1500000.0, "Bộ giáo trình in màu chuẩn y khoa kèm thước đo Cobb", 0)
    ]
    cursor.executemany("""
    INSERT INTO products (name, type, price, description, registered_count)
    VALUES (?, ?, ?, ?, ?)
    """, products_list)

    # 4. TẠO LẠI BẢNG CUSTOMERS VÀ ORDERS
    cursor.execute("DROP TABLE IF EXISTS orders;")
    cursor.execute("DROP TABLE IF EXISTS customers;")

    cursor.execute("""
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        zalo TEXT,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);")

    cursor.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK(amount >= 0),
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);")

    cursor.execute("PRAGMA foreign_keys = ON;")

    # 5. IMPORT TOÀN BỘ KHÁCH HÀNG THỰC TẾ VÀO CUSTOMERS (CHỐNG TRÙNG LẶP SĐT)
    inserted_cust = 0
    duplicate_cust = 0

    for item in waitlist_data:
        p = item["phone"]
        n = item["name"]
        z = item["zalo"]
        t = item["registered_at"]

        cursor.execute("""
        INSERT INTO customers (name, phone, zalo, registered_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(phone) DO NOTHING
        """, (n, p, z, t))

        if cursor.rowcount > 0:
            inserted_cust += 1
        else:
            duplicate_cust += 1

    conn.commit()
    print(f"📥 Đã import khách hàng vào bảng [customers]:")
    print(f"   - Thêm mới thành công: {inserted_cust} khách")
    print(f"   - Tự động lọc trùng lặp: {duplicate_cust} khách")

    # 6. IMPORT CÁC ĐƠN HÀNG THẬT VÀO BẢNG ORDERS
    for item in waitlist_data:
        p = item["phone"]
        course = item["course_registered"]
        status_raw = item["status"]
        price_raw = item["price"]

        # Xác định status chuẩn
        if "ĐÃ THANH TOÁN" in status_raw.upper():
            order_status = "paid"
        else:
            order_status = "pending"

        # Tìm customer_id
        cursor.execute("SELECT id FROM customers WHERE phone = ?", (p,))
        c_row = cursor.fetchone()
        if not c_row:
            continue
        c_id = c_row[0]

        # Khớp sản phẩm tương ứng
        p_id = None
        p_amount = 0
        if "2.000" in course or "2.000" in price_raw or "Test" in course:
            cursor.execute("SELECT id, price FROM products WHERE name LIKE '%Test%' LIMIT 1")
            r = cursor.fetchone()
            if r: p_id, p_amount = r[0], 2000.0
        elif "Full Online" in course or "14.500.000" in price_raw:
            cursor.execute("SELECT id, price FROM products WHERE name LIKE '%Full Online%' LIMIT 1")
            r = cursor.fetchone()
            if r: p_id, p_amount = r[0], 14500000.0
        elif "Combo Trọn Khóa" in course or "6.600.000" in price_raw:
            cursor.execute("SELECT id, price FROM products WHERE name LIKE '%Combo%' LIMIT 1")
            r = cursor.fetchone()
            if r: p_id, p_amount = r[0], 6600000.0
        elif "Khóa 1" in course or "2.100.000" in price_raw:
            cursor.execute("SELECT id, price FROM products WHERE name LIKE '%Khóa 1%' LIMIT 1")
            r = cursor.fetchone()
            if r: p_id, p_amount = r[0], 2100000.0

        if p_id:
            cursor.execute("""
            INSERT INTO orders (customer_id, product_id, amount, status, order_date)
            VALUES (?, ?, ?, ?, ?)
            """, (c_id, p_id, p_amount, order_status, item["registered_at"]))

    conn.commit()

    # 7. TỰ ĐỘNG CẬP NHẬT registered_count (SỐ LƯỢNG ĐÃ ĐĂNG KÝ) CHO MỖI SẢN PHẨM
    cursor.execute("""
    UPDATE products
    SET registered_count = (
        SELECT COUNT(*) FROM orders WHERE orders.product_id = products.id
    );
    """)
    conn.commit()
    print("📊 Đã tự động đồng bộ số lượng đã đăng ký (registered_count) từ bảng orders vào products.")

    # 8. BÁO CÁO KẾT QUẢ CUỐI CÙNG
    print("\n--- [DANH MỤC SẢN PHẨM & SỐ LƯỢNG ĐÃ ĐĂNG KÝ] ---")
    for r in cursor.execute("SELECT id, name, type, price, registered_count FROM products").fetchall():
        print(f"ID {r[0]}: {r[1]} | Loại: {r[2]} | Giá: {r[3]:,.0f}đ | Số lượng đã đăng ký: {r[4]}")

    print("\n--- [DANH SÁCH KHÁCH HÀNG THỰC TẾ TRONG CRM (TỪ SUPABASE & GOOGLE SHEETS)] ---")
    for r in cursor.execute("SELECT id, name, phone, zalo, registered_at FROM customers").fetchall():
        print(f"ID {r[0]}: {r[1]} | SĐT: {r[2]} | Zalo: {r[3]} | Ngày ĐK: {r[4]}")

    print("\n--- [DANH SÁCH ĐƠN HÀNG THỰC TẾ] ---")
    query_orders = """
    SELECT o.id, c.name, c.phone, p.name, o.amount, o.status, o.order_date
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN products p ON o.product_id = p.id
    """
    for r in cursor.execute(query_orders).fetchall():
        print(f"Đơn #{r[0]} | Khách: {r[1]} ({r[2]}) | SP: {r[3]} | Tiền: {r[4]:,.0f}đ | TT: {r[5]} | Ngày: {r[6]}")

    conn.close()
    print(f"\n🎉 HOÀN THÀNH ĐỒNG BỘ: {db_path}\n")

if __name__ == '__main__':
    leads_file = "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/supabase_leads.json"
    
    # 1. Cập nhật cho DB hiện tại trong workspace
    sync_real_data_to_crm(
        "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/brain.db",
        leads_file,
        "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/waitlist.json"
    )

    # 2. Đồng bộ sang Desktop/my-brain và Desktop/Chiro_course
    for db in ["/Users/huybui/Desktop/my-brain/brain.db", "/Users/huybui/Desktop/Chiro_course/brain.db"]:
        try:
            wl = db.replace("brain.db", "waitlist.json")
            sync_real_data_to_crm(db, leads_file, wl)
        except Exception as e:
            print(f"Lỗi đồng bộ {db}: {e}")
