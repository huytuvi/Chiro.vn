import sqlite3
import json
import os
import sys

def sync_data(json_file_path):
    if not os.path.exists(json_file_path):
        print(f"File {json_file_path} không tồn tại.")
        return False

    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    db_targets = [
        "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/brain.db",
        "/Users/huybui/Desktop/my-brain/brain.db",
        "/Users/huybui/Desktop/Chiro_course/brain.db"
    ]

    products = data.get("products", [])
    customers = data.get("customers", [])
    orders = data.get("orders", [])

    for db_path in db_targets:
        if not os.path.exists(os.path.dirname(db_path)):
            continue

        print(f"Đang đồng bộ tới: {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = OFF;")

        # Đồng bộ products
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
        for p in products:
            cursor.execute("""
            INSERT INTO products (id, name, type, price, description, registered_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
            """, (p.get("id"), p.get("name"), p.get("type"), p.get("price"), p.get("description"), p.get("registered_count", 0), p.get("created_at")))

        # Đồng bộ customers
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
        for c in customers:
            cursor.execute("""
            INSERT INTO customers (id, name, phone, zalo, registered_at, created_at)
            VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
            """, (c.get("id"), c.get("name"), c.get("phone"), c.get("zalo"), c.get("registered_at"), c.get("created_at")))

        # Đồng bộ orders
        cursor.execute("DROP TABLE IF EXISTS orders;")
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

        for o in orders:
            cursor.execute("""
            INSERT INTO orders (id, customer_id, product_id, amount, status, order_date, created_at)
            VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
            """, (o.get("id"), o.get("customer_id"), o.get("product_id"), o.get("amount"), o.get("status", "pending"), o.get("order_date"), o.get("created_at")))

        cursor.execute("PRAGMA foreign_keys = ON;")
        conn.commit()
        conn.close()
        print(f"✅ Đã đồng bộ thành công tới: {db_path}")

    return True

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/initial_crm_data.json"
    sync_data(src)
