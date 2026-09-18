import sqlite3
import json
import os
import sys

def setup_crm(db_path, waitlist_path):
    print(f"==================================================")
    print(f"🚀 BẮT ĐẦU NÂNG CẤP DATABASE CRM TẠI: {db_path}")
    print(f"==================================================")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. BẢNG PRODUCTS (Sản phẩm)
    # Ràng buộc: Số lượng còn lại (stock_quantity) bắt buộc đối với physical; với digital/service có thể để trống (NULL)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('physical', 'digital', 'service')),
        price REAL NOT NULL CHECK(price >= 0),
        description TEXT,
        stock_quantity INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_stock_required_for_physical CHECK (
            type != 'physical' OR (stock_quantity IS NOT NULL AND stock_quantity >= 0)
        )
    );
    """)
    print("✅ Đã tạo bảng [products] với ràng buộc tồn kho chính xác theo từng loại sản phẩm.")

    # 2. BẢNG CUSTOMERS (Khách hàng / Học viên)
    # Khóa UNIQUE trên số điện thoại để chống trùng lặp dữ liệu
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        zalo TEXT,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);")
    print("✅ Đã tạo bảng [customers] (UNIQUE số điện thoại để ngăn trùng lặp).")

    # 3. BẢNG ORDERS (Đơn hàng)
    # Lưu liên kết khách hàng nào mua sản phẩm gì, số tiền, trạng thái, ngày mua
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
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
    print("✅ Đã tạo bảng [orders] kết nối quan hệ Customer - Product với Foreign Keys.")

    # ----------------------------------------------------
    # NẠP DỮ LIỆU SẢN PHẨM MẪU CỦA SIMON CHIROPRACTIC CENTER
    # ----------------------------------------------------
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        sample_products = [
            ("Giáo trình Chiropractic Y Khoa & Thước Đo Cột Sống", "physical", 1500000.0, "Giáo trình bản cứng chuẩn y khoa kèm thước đo góc Cobb chuyên dụng", 50),
            ("The Full Online Collection (Trọn bộ Online)", "digital", 14900000.0, "Trọn bộ Full-Spine E-Learning Video 4K POV, Drills rèn lực, cấp chứng chỉ", None),
            ("Khóa Offline Cầm tay chỉ việc (Hands-on Mentorship)", "service", 40000000.0, "4 ngày thực hành trực tiếp cùng Bác sĩ Henrik Simon, chỉnh từng milimet lực", None),
            ("Khóa Học Test Thanh Toán Tự Động SePay", "digital", 2000.0, "Khóa học test tích hợp SePay & QR Code ACB chuyển khoản tự động", None)
        ]
        cursor.executemany("""
        INSERT INTO products (name, type, price, description, stock_quantity)
        VALUES (?, ?, ?, ?, ?)
        """, sample_products)
        print(f"📦 Đã khởi tạo {len(sample_products)} sản phẩm mẫu (physical, digital, service).")

    # ----------------------------------------------------
    # IMPORT DỮ LIỆU TỪ waitlist.json VÀO BẢNG CUSTOMERS
    # ----------------------------------------------------
    if os.path.exists(waitlist_path):
        with open(waitlist_path, 'r', encoding='utf-8') as f:
            waitlist_data = json.load(f)
        
        inserted_count = 0
        duplicate_count = 0
        
        for item in waitlist_data:
            name = item.get("name", "").strip()
            phone = item.get("phone", "").strip()
            zalo = item.get("zalo", "").strip()
            reg_at = item.get("registered_at", None)

            if not phone:
                continue

            try:
                cursor.execute("""
                INSERT INTO customers (name, phone, zalo, registered_at)
                VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
                ON CONFLICT(phone) DO NOTHING
                """, (name, phone, zalo, reg_at))
                
                if cursor.rowcount > 0:
                    inserted_count += 1
                else:
                    duplicate_count += 1
            except Exception as e:
                print(f"Lỗi dòng {phone}: {e}")

        conn.commit()
        print(f"📥 Đã import từ waitlist.json:")
        print(f"   - Thêm mới thành công: {inserted_count} khách hàng")
        print(f"   - Bỏ qua do trùng lặp: {duplicate_count} khách hàng")
    else:
        print(f"⚠️ Không tìm thấy file {waitlist_path}")

    # ----------------------------------------------------
    # TẠO ĐƠN HÀNG MẪU (ORDERS) LIÊN KẾT THỰC TẾ
    # ----------------------------------------------------
    cursor.execute("SELECT COUNT(*) FROM orders")
    if cursor.fetchone()[0] == 0:
        cursor.execute("SELECT id FROM customers WHERE phone = '098978698' LIMIT 1")
        cust_row = cursor.fetchone()
        cursor.execute("SELECT id, price FROM products WHERE name LIKE '%Test%' LIMIT 1")
        prod_row = cursor.fetchone()

        if cust_row and prod_row:
            cust_id = cust_row[0]
            prod_id = prod_row[0]
            prod_price = prod_row[1]
            cursor.execute("""
            INSERT INTO orders (customer_id, product_id, amount, status, order_date)
            VALUES (?, ?, ?, 'paid', '2026-09-18 19:40:00')
            """, (cust_id, prod_id, prod_price))
            conn.commit()
            print(f"🛒 Đã tạo đơn hàng mẫu đầu tiên cho khách hàng ID {cust_id} mua sản phẩm ID {prod_id} (Trạng thái: paid).")

    conn.commit()

    # ----------------------------------------------------
    # KIỂM THỬ RÀNG BUỘC (TEST CONSTRAINT VERIFICATION)
    # ----------------------------------------------------
    print("\n🔍 KIỂM THỬ RÀNG BUỘC NGHIỆP VỤ:")
    # Test 1: Thử thêm sản phẩm physical nhưng để stock_quantity là NULL -> Phải bị chặn!
    try:
        cursor.execute("""
        INSERT INTO products (name, type, price, description, stock_quantity)
        VALUES ('Sản phẩm lỗi test', 'physical', 500000, 'Test không có tồn kho', NULL)
        """)
        conn.commit()
        print("❌ LỖI: Ràng buộc chưa chặn được sản phẩm vật lý thiếu tồn kho!")
    except sqlite3.IntegrityError as err:
        print("✅ PASS TEST 1: Hệ thống ĐÃ CHẶN THÀNH CÔNG sản phẩm vật lý khi không có số lượng tồn kho!")

    # Test 2: Thêm sản phẩm digital không có tồn kho (NULL) -> Phải thành công!
    try:
        cursor.execute("""
        INSERT INTO products (name, type, price, description, stock_quantity)
        VALUES ('Khóa học Ebook Digital', 'digital', 300000, 'Tải tài liệu PDF', NULL)
        """)
        conn.commit()
        # Dọn dẹp bản ghi test
        cursor.execute("DELETE FROM products WHERE name = 'Khóa học Ebook Digital'")
        conn.commit()
        print("✅ PASS TEST 2: Sản phẩm số / dịch vụ cho phép tồn kho để trống (NULL) thành công!")
    except Exception as err:
        print(f"❌ LỖI TEST 2: {err}")

    # Test 3: Thử thêm trùng số điện thoại vào customers -> Phải bị chặn hoặc bỏ qua!
    cursor.execute("SELECT COUNT(*) FROM customers")
    count_before = cursor.fetchone()[0]
    cursor.execute("""
    INSERT INTO customers (name, phone, zalo)
    VALUES ('Trùng lặp test', '098978698', '098978698')
    ON CONFLICT(phone) DO NOTHING
    """)
    conn.commit()
    cursor.execute("SELECT COUNT(*) FROM customers")
    count_after = cursor.fetchone()[0]
    if count_before == count_after:
        print("✅ PASS TEST 3: Chống trùng lặp SĐT khách hàng hoạt động hoàn hảo (không tăng dòng)!")

    # HIỂN THỊ KẾT QUẢ TRUY VẤN CRM TỔNG HỢP
    print("\n📊 BÁO CÁO DỮ LIỆU CRM TRONG DATABASE:")
    print("--- [DANH SÁCH SẢN PHẨM] ---")
    for r in cursor.execute("SELECT id, name, type, price, stock_quantity FROM products").fetchall():
        print(f"ID: {r[0]} | Tên: {r[1]} | Loại: {r[2]} | Giá: {r[3]:,.0f}đ | Tồn kho: {r[4]}")

    print("\n--- [DANH SÁCH KHÁCH HÀNG ĐÃ IMPORT] ---")
    for r in cursor.execute("SELECT id, name, phone, zalo, registered_at FROM customers").fetchall():
        print(f"ID: {r[0]} | Tên: {r[1]} | SĐT: {r[2]} | Zalo: {r[3]} | Ngày ĐK: {r[4]}")

    print("\n--- [DANH SÁCH ĐƠN HÀNG (JOIN)] ---")
    query_orders = """
    SELECT o.id, c.name, c.phone, p.name, p.type, o.amount, o.status, o.order_date
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN products p ON o.product_id = p.id
    """
    for r in cursor.execute(query_orders).fetchall():
        print(f"Đơn #{r[0]} | Khách: {r[1]} ({r[2]}) | SP: {r[3]} [{r[4]}] | Tiền: {r[5]:,.0f}đ | TT: {r[6]} | Ngày: {r[7]}")

    conn.close()
    print(f"\n🎉 HOÀN TẤT THIẾT LẬP CRM CHO: {db_path}\n")

if __name__ == '__main__':
    db_path = "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/brain.db"
    waitlist_path = "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/waitlist.json"
    setup_crm(db_path, waitlist_path)
