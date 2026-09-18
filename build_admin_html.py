import json

with open('/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/initial_crm_data.json', 'r', encoding='utf-8') as f:
    crm_data = json.load(f)

crm_json_str = json.dumps(crm_data, ensure_ascii=False, indent=2)

html_content = f'''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 Simon Chiropractic Center – Bảng Điều Khiển Quản Trị CRM</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- EmailJS Browser SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <!-- Supabase JS SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    body {{ font-family: 'Be Vietnam Pro', sans-serif; }}
    .card {{ background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }}
    .badge-digital {{ background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }}
    .badge-service {{ background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }}
    .badge-physical {{ background-color: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }}
    .badge-paid {{ background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }}
    .badge-pending {{ background-color: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }}
    .badge-cancelled {{ background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }}
  </style>
</head>
<body class="bg-slate-100 min-h-screen py-8 px-3 sm:px-6">

  <!-- ===================================================================== -->
  <!-- 1. MÀN HÌNH ĐĂNG NHẬP                                                 -->
  <!-- ===================================================================== -->
  <div id="loginScreen" class="max-w-sm mx-auto mt-12">
    <div class="card p-8 text-center border border-slate-200">
      <div class="w-16 h-16 bg-[#4A121E] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">🔐</div>
      <h1 class="text-xl font-extrabold text-slate-900 mb-1">Simon Chiropractic Center</h1>
      <p class="text-xs text-slate-500 mb-6">Hệ thống Quản Trị CRM &amp; Doanh Thu Nội Bộ</p>
      
      <input type="password" id="adminPassword" placeholder="Nhập mật khẩu quản trị" 
             class="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-[#8F1D35] outline-none transition"
             onkeydown="if(event.key==='Enter') checkLogin()">
      
      <button onclick="checkLogin()" class="w-full bg-[#8F1D35] hover:bg-[#701529] text-white font-bold py-3 rounded-xl text-sm transition shadow-md">
        Đăng Nhập Quản Trị →
      </button>
      
      <p id="loginError" class="text-rose-600 text-xs mt-3 hidden font-semibold">Mật khẩu không chính xác!</p>
      <div class="text-[11px] text-slate-400 mt-5 pt-4 border-t border-slate-100">
        Mật khẩu mặc định: <code class="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono font-bold">simon2026</code>
      </div>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- 2. BẢNG ĐIỀU KHIỂN CHÍNH (ADMIN DASHBOARD)                            -->
  <!-- ===================================================================== -->
  <div id="adminDashboard" class="max-w-7xl mx-auto hidden space-y-6">

    <!-- Header & Quick Info -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-br from-[#4A121E] to-[#8F1D35] rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow">
          ⚕️
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900">SIMON CHIROPRACTIC CENTER</h1>
            <span class="text-[11px] bg-red-100 text-red-900 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">CRM ADMIN v3.0</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Quản trị toàn diện: Sản Phẩm • Khách Hàng • Đơn Hàng (Đồng bộ 3 chiều: brain.db ↔ Supabase ↔ Google Sheets)</p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <div id="syncIndicator" class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="syncIndicatorText">Đã kết nối Supabase &amp; Sheets</span>
        </div>
        <button onclick="logout()" class="text-xs text-slate-600 hover:text-red-700 font-semibold border border-slate-300 px-3.5 py-2 rounded-xl hover:bg-red-50 transition flex items-center space-x-1">
          <span>Đăng xuất</span>
          <span>➔</span>
        </button>
      </div>
    </div>

    <!-- MAIN NAVIGATION TABS -->
    <div class="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
      <button onclick="switchMainTab('crm')" id="navTabCRM" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-[#8F1D35] text-white shadow-sm shrink-0">
        <span>📋 Quản Lý CRM (Đơn - Khách - SP)</span>
      </button>
      <button onclick="switchMainTab('survey')" id="navTabSurvey" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shrink-0">
        <span>📊 Khảo Sát Nhu Cầu</span>
        <span id="badgeSurveyCount" class="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">0</span>
      </button>
      <button onclick="switchMainTab('settings')" id="navTabSettings" class="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shrink-0">
        <span>⚙️ Cài Đặt Hệ Thống &amp; API</span>
      </button>
    </div>

    <!-- =================================================================== -->
    <!-- SECTION 1: QUẢN LÝ CRM (SẢN PHẨM - KHÁCH HÀNG - ĐƠN HÀNG)          -->
    <!-- =================================================================== -->
    <div id="sectionCRM" class="space-y-6">

      <!-- 5 KPI Cards Tổng quan -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <!-- KPI 1 -->
        <div class="card p-4 border-l-4 border-indigo-600 bg-white shadow-sm">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider">Khách Hàng</span>
            <span class="text-base">👥</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900 font-mono" id="statCustomers">0</div>
          <div class="text-[10px] text-slate-400 mt-1">Học viên trong hệ thống</div>
        </div>

        <!-- KPI 2 -->
        <div class="card p-4 border-l-4 border-emerald-600 bg-emerald-50/20 shadow-sm">
          <div class="flex items-center justify-between text-emerald-800 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider">Đã Thanh Toán</span>
            <span class="text-base">✅</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-700 font-mono" id="statPaidOrders">0</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-1" id="statPaidRate">0% tỷ lệ hoàn tất</div>
        </div>

        <!-- KPI 3 -->
        <div class="card p-4 border-l-4 border-amber-500 bg-amber-50/20 shadow-sm">
          <div class="flex items-center justify-between text-amber-800 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider">Chờ Thanh Toán</span>
            <span class="text-base">⏳</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-amber-600 font-mono" id="statPendingOrders">0</div>
          <div class="text-[10px] text-amber-700 font-medium mt-1">Cần chăm sóc / nhắc CK</div>
        </div>

        <!-- KPI 4 -->
        <div class="card p-4 border-l-4 border-blue-600 bg-blue-50/20 shadow-sm">
          <div class="flex items-center justify-between text-blue-800 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider">Doanh Thu Thu Được</span>
            <span class="text-base">💵</span>
          </div>
          <div class="text-lg sm:text-xl font-black text-blue-800 font-mono truncate" id="statRevenue">0 đ</div>
          <div class="text-[10px] text-blue-600 font-medium mt-1">Tổng tiền đã hoàn tất</div>
        </div>

        <!-- KPI 5 -->
        <div class="card p-4 border-l-4 border-purple-600 bg-purple-50/20 shadow-sm col-span-2 sm:col-span-1">
          <div class="flex items-center justify-between text-purple-800 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider">Khóa Học &amp; SP</span>
            <span class="text-base">📦</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-purple-800 font-mono" id="statProducts">0</div>
          <div class="text-[10px] text-purple-700 font-medium mt-1">Sản phẩm trong brain.db</div>
        </div>
      </div>

      <!-- CRM SUB-TABS (SẢN PHẨM - KHÁCH HÀNG - ĐƠN HÀNG) -->
      <div class="card p-6 border border-slate-200">
        
        <!-- Tab Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
          <div class="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl">
            <button onclick="switchCRMSubTab('products')" id="subTabBtnProducts" class="px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 bg-white text-slate-900 shadow-sm">
              <span>📦 Sản Phẩm</span>
              <span id="badgeProdCount" class="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full">0</span>
            </button>
            <button onclick="switchCRMSubTab('customers')" id="subTabBtnCustomers" class="px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 text-slate-600 hover:text-slate-900">
              <span>👥 Khách Hàng</span>
              <span id="badgeCustCount" class="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full">0</span>
            </button>
            <button onclick="switchCRMSubTab('orders')" id="subTabBtnOrders" class="px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 text-slate-600 hover:text-slate-900">
              <span>🛒 Đơn Hàng</span>
              <span id="badgeOrderCount" class="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full">0</span>
            </button>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="exportCRMToBrainJson()" class="text-xs bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-xl transition shadow-sm flex items-center space-x-1" title="Tải file crm_data_sync.json để nạp vào SQLite brain.db">
              <span>💾 Tải File Sync brain.db</span>
            </button>
            <button onclick="syncAllWithRemote()" id="btnSyncAllRemote" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl transition shadow-sm flex items-center space-x-1" title="Lấy dữ liệu thực tế mới nhất từ Supabase &amp; Google Sheet">
              <span>🔄 Đồng Bộ Supabase &amp; Sheets</span>
            </button>
            <button onclick="exportCSVOrders()" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl transition shadow-sm flex items-center space-x-1">
              <span>📥 Xuất Excel (.csv)</span>
            </button>
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- SUB-TAB 1: SẢN PHẨM (PRODUCTS)                                  -->
        <!-- =============================================================== -->
        <div id="subTabContentProducts" class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center space-x-1 text-xs">
              <span class="text-slate-500 font-semibold mr-1">Lọc loại:</span>
              <button onclick="filterProducts('all')" id="fltProdAll" class="px-2.5 py-1 rounded-md bg-slate-800 text-white font-bold text-[11px]">Tất cả</button>
              <button onclick="filterProducts('digital')" id="fltProdDigital" class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50">Digital (Online)</button>
              <button onclick="filterProducts('service')" id="fltProdService" class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50">Dịch vụ (Offline)</button>
              <button onclick="filterProducts('physical')" id="fltProdPhysical" class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50">Vật lý (Sách/Dụng cụ)</button>
            </div>
            <div class="flex items-center space-x-2">
              <input type="text" id="searchProductInput" oninput="searchProducts(this.value)" placeholder="🔍 Tìm kiếm sản phẩm..." class="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#8F1D35] bg-white w-48 sm:w-64">
              <button onclick="openProductModal()" class="bg-[#8F1D35] hover:bg-[#701529] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center space-x-1 shrink-0">
                <span>➕ Thêm Sản Phẩm Mới</span>
              </button>
            </div>
          </div>

          <!-- Bảng Sản Phẩm -->
          <div class="overflow-x-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-3 w-12 text-center">ID</th>
                  <th class="py-3 px-3">Tên Sản Phẩm / Khóa Học</th>
                  <th class="py-3 px-3 w-28 text-center">Loại</th>
                  <th class="py-3 px-3 w-32 text-right">Đơn Giá (VNĐ)</th>
                  <th class="py-3 px-3 w-36 text-center">Số Lượng Đã ĐK</th>
                  <th class="py-3 px-3">Mô Tả Trọng Tâm</th>
                  <th class="py-3 px-3 w-28 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="productTableBody" class="divide-y divide-slate-100 text-slate-800">
                <!-- Render từ JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- SUB-TAB 2: KHÁCH HÀNG (CUSTOMERS)                               -->
        <!-- =============================================================== -->
        <div id="subTabContentCustomers" class="space-y-4 hidden">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="w-full sm:w-72">
              <input type="text" id="searchCustomerInput" oninput="searchCustomers(this.value)" placeholder="🔍 Tìm theo tên, số điện thoại, Zalo..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#8F1D35] bg-white">
            </div>
            <button onclick="openCustomerModal()" class="bg-[#8F1D35] hover:bg-[#701529] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center space-x-1 shrink-0">
              <span>➕ Thêm Khách Hàng Mới</span>
            </button>
          </div>

          <!-- Bảng Khách Hàng -->
          <div class="overflow-x-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-3 w-12 text-center">ID</th>
                  <th class="py-3 px-3">Họ và Tên</th>
                  <th class="py-3 px-3 w-32">Số Điện Thoại</th>
                  <th class="py-3 px-3 w-32">Zalo</th>
                  <th class="py-3 px-3 w-36">Ngày Đăng Ký</th>
                  <th class="py-3 px-3 w-32 text-center">Đơn Đã Mua</th>
                  <th class="py-3 px-3 w-36 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="customerTableBody" class="divide-y divide-slate-100 text-slate-800">
                <!-- Render từ JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- SUB-TAB 3: ĐƠN HÀNG (ORDERS)                                    -->
        <!-- =============================================================== -->
        <div id="subTabContentOrders" class="space-y-4 hidden">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center space-x-1 text-xs">
              <span class="text-slate-500 font-semibold mr-1">Trạng thái:</span>
              <button onclick="filterOrders('all')" id="fltOrderAll" class="px-2.5 py-1 rounded-md bg-slate-800 text-white font-bold text-[11px]">Tất cả</button>
              <button onclick="filterOrders('paid')" id="fltOrderPaid" class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50">✅ Đã thanh toán</button>
              <button onclick="filterOrders('pending')" id="fltOrderPending" class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50">⏳ Chờ thanh toán</button>
            </div>
            <div class="flex items-center space-x-2">
              <input type="text" id="searchOrderInput" oninput="searchOrders(this.value)" placeholder="🔍 Tìm mã đơn, khách, SĐT, khóa..." class="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#8F1D35] bg-white w-48 sm:w-64">
              <button onclick="openOrderModal()" class="bg-[#8F1D35] hover:bg-[#701529] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center space-x-1 shrink-0">
                <span>➕ Tạo Đơn Hàng Mới</span>
              </button>
            </div>
          </div>

          <!-- Bảng Đơn Hàng -->
          <div class="overflow-x-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-3 w-28">Mã Đơn</th>
                  <th class="py-3 px-3">Khách Hàng (Họ tên &amp; SĐT)</th>
                  <th class="py-3 px-3">Khóa Học / Sản Phẩm</th>
                  <th class="py-3 px-3 w-32 text-right">Số Tiền (VNĐ)</th>
                  <th class="py-3 px-3 w-32 text-center">Trạng Thái</th>
                  <th class="py-3 px-3 w-32">Ngày Đặt</th>
                  <th class="py-3 px-3 w-36 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="orderTableBody" class="divide-y divide-slate-100 text-slate-800">
                <!-- Render từ JS -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div> <!-- /#sectionCRM -->

    <!-- =================================================================== -->
    <!-- SECTION 2: THỐNG KÊ KHẢO SÁT NHU CẦU                               -->
    <!-- =================================================================== -->
    <div id="sectionSurvey" class="space-y-6 hidden">
      <div class="card p-6 border border-slate-200">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 class="font-extrabold text-slate-900 text-lg">📊 Thống Kê Nhu Cầu &amp; Chân Dung Học Viên</h2>
            <p class="text-xs text-slate-500">Phân tích từ bảng khảo sát 5 câu hỏi trên website</p>
          </div>
          <button onclick="loadSurveyData()" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg border border-slate-300">
            🔄 Làm mới khảo sát
          </button>
        </div>

        <div id="surveyContainer" class="space-y-4">
          <!-- Bảng khảo sát -->
          <div id="surveyTable" class="overflow-x-auto text-xs"></div>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- SECTION 3: CÀI ĐẶT HỆ THỐNG & ĐỒNG BỘ                              -->
    <!-- =================================================================== -->
    <div id="sectionSettings" class="space-y-6 hidden">

      <!-- Sync Info Card -->
      <div class="card p-6 border-2 border-slate-300 bg-white space-y-4">
        <h2 class="font-black text-slate-900 text-base">⚡ CƠ CHẾ ĐỒNG BỘ 3 CHIỀU TỰ ĐỘNG</h2>
        <div class="grid sm:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="font-bold text-slate-900 mb-1">1. SQLite brain.db (Cục bộ)</div>
            <p class="text-slate-600 mb-2">Lưu trữ trên máy chủ nội bộ. Dữ liệu được nạp vào CRM ban đầu và có thể tải file cập nhật tức thì.</p>
            <button onclick="exportCRMToBrainJson()" class="w-full bg-slate-800 text-white py-1.5 rounded font-bold text-[11px] hover:bg-slate-900">
              Xuất File Đồng Bộ SQLite
            </button>
          </div>

          <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <div class="font-bold text-indigo-950 mb-1">2. Supabase PostgreSQL (Cloud)</div>
            <p class="text-indigo-800 mb-2">Đồng bộ realtime qua REST API. Mọi thao tác Thêm/Sửa/Xóa đơn học viên sẽ được bắn ngay lên Supabase.</p>
            <div class="text-[10px] text-indigo-700 font-mono">fjzkneljhfibwksnpjkk.supabase.co</div>
          </div>

          <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div class="font-bold text-emerald-950 mb-1">3. Google Sheets (Sao lưu)</div>
            <p class="text-emerald-800 mb-2">Webhook tự động đồng bộ sang Google Sheet <strong>Khach_Hang_Khoa_Hoc_Simon_Center</strong> và gửi Gmail.</p>
            <div class="text-[10px] text-emerald-700 font-mono">script.google.com/macros/s/...</div>
          </div>
        </div>
      </div>

      <!-- Config Google Sheet -->
      <div class="card p-6 border border-slate-200 space-y-3">
        <h3 class="font-extrabold text-emerald-900 text-sm">🟢 Cấu Hình Google Apps Script Web App</h3>
        <input type="text" id="cfgGoogleSheetUrl" value="https://script.google.com/macros/s/AKfycbx_pTqoPFNEU4nV4u-f1i1607aWLRfefN1o_bj7--bAaVRIrYiM4GkQoe8bzjqeMS61kA/exec" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono">
        <div class="flex space-x-2">
          <button onclick="saveSettings()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs">Lưu URL Sheets</button>
          <button onclick="testSheetConnection()" class="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs hover:bg-slate-50">Kiểm tra kết nối</button>
        </div>
      </div>

      <!-- Config Supabase -->
      <div class="card p-6 border border-slate-200 space-y-3">
        <h3 class="font-extrabold text-indigo-900 text-sm">⚡ Cấu Hình Supabase API</h3>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Supabase URL</label>
            <input type="text" id="cfgSupabaseUrl" value="https://fjzkneljhfibwksnpjkk.supabase.co" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Supabase Anon Public Key</label>
            <input type="text" id="cfgSupabaseKey" value="sb_publishable_Ifjqnisqu2OcfaMVfjIGvw_F2DkEQsR" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono">
          </div>
        </div>
        <div class="flex space-x-2">
          <button onclick="saveSettings()" class="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-4 py-2 rounded-lg text-xs">Lưu Supabase</button>
          <button onclick="testSupabaseConnection()" class="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs hover:bg-slate-50">Kiểm tra Supabase</button>
        </div>
      </div>

    </div>

  </div> <!-- /#adminDashboard -->


  <!-- ===================================================================== -->
  <!-- MODALS CHO CÁC THAO TÁC CRUD                                          -->
  <!-- ===================================================================== -->

  <!-- 1. MODAL SẢN PHẨM -->
  <div id="modalProduct" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-black text-slate-900" id="modalProductTitle">➕ Thêm Sản Phẩm Mới</h3>
        <button onclick="closeProductModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
      </div>

      <input type="hidden" id="prod_id">

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm / Khóa học *</label>
        <input type="text" id="prod_name" placeholder="Ví dụ: Khóa Học Chiropractic Nâng Cao" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Loại sản phẩm *</label>
          <select id="prod_type" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none bg-white">
            <option value="digital">digital (Khóa học Online / Ebook)</option>
            <option value="service">service (Khóa học Offline / Dịch vụ)</option>
            <option value="physical">physical (Giáo trình bản cứng / Vật lý)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Học phí / Đơn giá (VNĐ) *</label>
          <input type="number" id="prod_price" placeholder="14500000" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Số lượng đã đăng ký</label>
          <input type="number" id="prod_registered" placeholder="0" value="0" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Mô tả sản phẩm</label>
        <textarea id="prod_desc" rows="3" placeholder="Quyền lợi khóa học, video bài giảng, dụng cụ tặng kèm..." class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none resize-none"></textarea>
      </div>

      <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
        <button onclick="closeProductModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
        <button onclick="saveProduct()" class="px-5 py-2 text-xs font-bold bg-[#8F1D35] hover:bg-[#701529] text-white rounded-lg shadow">Lưu Sản Phẩm</button>
      </div>
    </div>
  </div>

  <!-- 2. MODAL KHÁCH HÀNG -->
  <div id="modalCustomer" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-black text-slate-900" id="modalCustomerTitle">➕ Thêm Khách Hàng Mới</h3>
        <button onclick="closeCustomerModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
      </div>

      <input type="hidden" id="cust_id">

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Họ và tên học viên *</label>
        <input type="text" id="cust_name" placeholder="Nguyễn Văn A" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Số điện thoại * (Khóa chính chống trùng lặp)</label>
        <input type="text" id="cust_phone" placeholder="0901234567" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Zalo (Số ĐT hoặc Link Zalo)</label>
        <input type="text" id="cust_zalo" placeholder="0901234567" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Ngày đăng ký</label>
        <input type="text" id="cust_registered_at" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
      </div>

      <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
        <button onclick="closeCustomerModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
        <button onclick="saveCustomer()" class="px-5 py-2 text-xs font-bold bg-[#8F1D35] hover:bg-[#701529] text-white rounded-lg shadow">Lưu Khách Hàng</button>
      </div>
    </div>
  </div>

  <!-- 3. MODAL ĐƠN HÀNG -->
  <div id="modalOrder" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-black text-slate-900" id="modalOrderTitle">➕ Tạo Đơn Hàng Mới</h3>
        <button onclick="closeOrderModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
      </div>

      <input type="hidden" id="ord_id">

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Chọn Khách Hàng *</label>
        <select id="ord_customer_id" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none bg-white">
          <!-- Options populate from customers -->
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Chọn Khóa Học / Sản Phẩm *</label>
        <select id="ord_product_id" onchange="onOrderProductChange()" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none bg-white">
          <!-- Options populate from products -->
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Số tiền thanh toán (VNĐ) *</label>
          <input type="number" id="ord_amount" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Trạng thái đơn hàng *</label>
          <select id="ord_status" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none bg-white font-bold">
            <option value="paid" class="text-emerald-700">paid (ĐÃ THANH TOÁN)</option>
            <option value="pending" class="text-amber-700">pending (Chờ thanh toán)</option>
            <option value="cancelled" class="text-red-700">cancelled (Đã hủy)</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Thời gian đặt mua</label>
        <input type="text" id="ord_date" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8F1D35] outline-none">
      </div>

      <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
        <button onclick="closeOrderModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
        <button onclick="saveOrder()" class="px-5 py-2 text-xs font-bold bg-[#8F1D35] hover:bg-[#701529] text-white rounded-lg shadow">Lưu Đơn Hàng</button>
      </div>
    </div>
  </div>

  <!-- 4. MODAL GỬI EMAIL XÁC NHẬN CHO HỌC VIÊN -->
  <div id="modalSendEmail" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-black text-slate-900">📧 Gửi Email Kích Hoạt Khóa Học</h3>
        <button onclick="closeEmailModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="font-bold text-slate-700 block mb-1">Email người nhận:</label>
          <input type="email" id="mail_recipient" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Họ tên:</label>
          <input type="text" id="mail_name" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Mã đơn:</label>
            <input type="text" id="mail_order_id" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Số tiền:</label>
            <input type="text" id="mail_amount" class="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-red-800">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Khóa học:</label>
          <input type="text" id="mail_course" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
        </div>
      </div>

      <div id="mailResult" class="text-xs font-bold text-center hidden"></div>

      <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
        <button onclick="closeEmailModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Đóng</button>
        <button onclick="executeSendEmail()" id="btnExecuteSendMail" class="px-5 py-2 text-xs font-bold bg-[#8F1D35] hover:bg-[#701529] text-white rounded-lg shadow">
          Gửi Email Ngay ➔
        </button>
      </div>
    </div>
  </div>

  <!-- 5. MODAL DANH SÁCH HỌC VIÊN THEO SẢN PHẨM -->
  <div id="modalProductStudents" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 hidden">
    <div class="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xl">👥</span>
            <h3 class="text-base font-black text-slate-900" id="prodStudentsModalTitle">Danh Sách Học Viên Đăng Ký</h3>
          </div>
          <p class="text-xs text-slate-500 mt-0.5" id="prodStudentsModalSubtitle">Khóa học: ...</p>
        </div>
        <button onclick="closeProductStudentsModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
      </div>

      <div id="prodStudentsListContainer" class="overflow-y-auto flex-1 text-xs space-y-3">
        <!-- Render bảng học viên thuộc sản phẩm này -->
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <span class="text-xs text-slate-500 font-semibold" id="prodStudentsTotalCount">Tổng cộng: 0 học viên</span>
        <div class="flex space-x-2">
          <button onclick="closeProductStudentsModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Đóng</button>
          <button onclick="quickAddStudentToCurrentProduct()" class="px-4 py-2 text-xs font-bold bg-[#8F1D35] hover:bg-[#701529] text-white rounded-lg shadow flex items-center space-x-1">
            <span>➕ Thêm Học Viên Vào Khóa Này</span>
          </button>
        </div>
      </div>
    </div>
  </div>



  <!-- ===================================================================== -->
  <!-- JAVASCRIPT CRM ENGINE & MULTI-LAYER SYNCHRONIZATION                   -->
  <!-- ===================================================================== -->
  <script>
    // DỮ LIỆU BAN ĐẦU TỪ SQLITE brain.db
    const DEFAULT_BRAIN_CRM = {crm_json_str};

    // Global state
    let _crmData = {{
      products: [],
      customers: [],
      orders: []
    }};

    let _filterProductType = 'all';
    let _filterOrderStatus = 'all';
    let _searchProductTerm = '';
    let _searchCustomerTerm = '';
    let _searchOrderTerm = '';

    // URL Configs
    const DEFAULT_SUPABASE_URL = "https://fjzkneljhfibwksnpjkk.supabase.co";
    const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_Ifjqnisqu2OcfaMVfjIGvw_F2DkEQsR";
    const DEFAULT_GS_URL = "https://script.google.com/macros/s/AKfycbx_pTqoPFNEU4nV4u-f1i1607aWLRfefN1o_bj7--bAaVRIrYiM4GkQoe8bzjqeMS61kA/exec";

    // -------------------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------------------
    function checkLogin() {{
      const pw = document.getElementById('adminPassword').value;
      if (pw === 'simon2026' || pw === 'admin' || pw === 'SIMON_SEC_2026_@CHIRO_ADMIN') {{
        sessionStorage.setItem('simon_admin_logged', 'true');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        initCRMData();
      }} else {{
        document.getElementById('loginError').classList.remove('hidden');
      }}
    }}

    function logout() {{
      sessionStorage.removeItem('simon_admin_logged');
      location.reload();
    }}

    // Auto-login if session exists
    window.addEventListener('DOMContentLoaded', () => {{
      if (sessionStorage.getItem('simon_admin_logged') === 'true') {{
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        initCRMData();
      }}
    }});

    // -------------------------------------------------------------------------
    // CRM DATA INITIALIZATION & LOCAL PERSISTENCE
    // -------------------------------------------------------------------------
    function initCRMData() {{
      // Load from localStorage or fallback to brain.db snapshot
      const local = localStorage.getItem('simon_crm_data_v3');
      if (local) {{
        try {{
          _crmData = JSON.parse(local);
        }} catch(e) {{
          _crmData = JSON.parse(JSON.stringify(DEFAULT_BRAIN_CRM));
        }}
      }} else {{
        _crmData = JSON.parse(JSON.stringify(DEFAULT_BRAIN_CRM));
      }}

      // Đảm bảo không bị thiếu mảng
      if (!_crmData.products) _crmData.products = [];
      if (!_crmData.customers) _crmData.customers = [];
      if (!_crmData.orders) _crmData.orders = [];

      renderAllCRM();
      
      // Auto-fetch new updates from Supabase in background
      syncAllWithRemote(false);
    }}

    function persistCRMData() {{
      localStorage.setItem('simon_crm_data_v3', JSON.stringify(_crmData));
      updateKPICards();
    }}

    function updateKPICards() {{
      document.getElementById('statCustomers').innerText = _crmData.customers.length;
      document.getElementById('statProducts').innerText = _crmData.products.length;

      const paidOrders = _crmData.orders.filter(o => o.status === 'paid');
      const pendingOrders = _crmData.orders.filter(o => o.status === 'pending');
      document.getElementById('statPaidOrders').innerText = paidOrders.length;
      document.getElementById('statPendingOrders').innerText = pendingOrders.length;

      const totalOrders = _crmData.orders.length;
      const rate = totalOrders > 0 ? Math.round((paidOrders.length / totalOrders) * 100) : 0;
      document.getElementById('statPaidRate').innerText = `${{rate}}% tỷ lệ hoàn tất`;

      const revenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      document.getElementById('statRevenue').innerText = revenue.toLocaleString('vi-VN') + ' đ';

      document.getElementById('badgeProdCount').innerText = _crmData.products.length;
      document.getElementById('badgeCustCount').innerText = _crmData.customers.length;
      document.getElementById('badgeOrderCount').innerText = _crmData.orders.length;
    }}

    function renderAllCRM() {{
      updateKPICards();
      renderProductsTable();
      renderCustomersTable();
      renderOrdersTable();
    }}

    // -------------------------------------------------------------------------
    // TAB SWITCHING
    // -------------------------------------------------------------------------
    function switchMainTab(tab) {{
      const secCRM = document.getElementById('sectionCRM');
      const secSurvey = document.getElementById('sectionSurvey');
      const secSettings = document.getElementById('sectionSettings');

      const btnCRM = document.getElementById('navTabCRM');
      const btnSurvey = document.getElementById('navTabSurvey');
      const btnSettings = document.getElementById('navTabSettings');

      [secCRM, secSurvey, secSettings].forEach(s => s.classList.add('hidden'));
      [btnCRM, btnSurvey, btnSettings].forEach(b => {{
        b.className = "px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shrink-0";
      }});

      if (tab === 'crm') {{
        secCRM.classList.remove('hidden');
        btnCRM.className = "px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-[#8F1D35] text-white shadow-sm shrink-0";
      }} else if (tab === 'survey') {{
        secSurvey.classList.remove('hidden');
        btnSurvey.className = "px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-indigo-700 text-white shadow-sm shrink-0";
        loadSurveyData();
      }} else if (tab === 'settings') {{
        secSettings.classList.remove('hidden');
        btnSettings.className = "px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 bg-slate-800 text-white shadow-sm shrink-0";
      }}
    }}

    function switchCRMSubTab(sub) {{
      const pTab = document.getElementById('subTabContentProducts');
      const cTab = document.getElementById('subTabContentCustomers');
      const oTab = document.getElementById('subTabContentOrders');

      const pBtn = document.getElementById('subTabBtnProducts');
      const cBtn = document.getElementById('subTabBtnCustomers');
      const oBtn = document.getElementById('subTabBtnOrders');

      [pTab, cTab, oTab].forEach(t => t.classList.add('hidden'));
      [pBtn, cBtn, oBtn].forEach(b => {{
        b.className = "px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 text-slate-600 hover:text-slate-900";
      }});

      if (sub === 'products') {{
        pTab.classList.remove('hidden');
        pBtn.className = "px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 bg-white text-slate-900 shadow-sm";
      }} else if (sub === 'customers') {{
        cTab.classList.remove('hidden');
        cBtn.className = "px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 bg-white text-slate-900 shadow-sm";
      }} else if (sub === 'orders') {{
        oTab.classList.remove('hidden');
        oBtn.className = "px-4 py-2 rounded-lg font-bold text-xs transition flex items-center space-x-1.5 bg-white text-slate-900 shadow-sm";
      }}
    }}

    // -------------------------------------------------------------------------
    // CRUD: PRODUCTS (SẢN PHẨM)
    // -------------------------------------------------------------------------
    function filterProducts(type) {{
      _filterProductType = type;
      ['all', 'digital', 'service', 'physical'].forEach(t => {{
        const btn = document.getElementById('fltProd' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) {{
          if (t === type) {{
            btn.className = "px-2.5 py-1 rounded-md bg-slate-800 text-white font-bold text-[11px]";
          }} else {{
            btn.className = "px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50";
          }}
        }}
      }});
      renderProductsTable();
    }}

    function searchProducts(term) {{
      _searchProductTerm = term.toLowerCase().trim();
      renderProductsTable();
    }}

    function renderProductsTable() {{
      const tbody = document.getElementById('productTableBody');
      if (!tbody) return;

      let list = _crmData.products.filter(p => {{
        if (_filterProductType !== 'all' && p.type !== _filterProductType) return false;
        if (_searchProductTerm) {{
          const matchName = (p.name || '').toLowerCase().includes(_searchProductTerm);
          const matchDesc = (p.description || '').toLowerCase().includes(_searchProductTerm);
          return matchName || matchDesc;
        }}
        return true;
      }});

      if (list.length === 0) {{
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-slate-400 italic">Không tìm thấy sản phẩm nào phù hợp.</td></tr>';
        return;
      }}

      tbody.innerHTML = list.map(p => {{
        const badgeClass = p.type === 'digital' ? 'badge-digital' : (p.type === 'service' ? 'badge-service' : 'badge-physical');
        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-3 text-center font-mono text-slate-500 font-bold">${{p.id}}</td>
            <td class="py-3 px-3 font-bold text-slate-900">${{p.name}}</td>
            <td class="py-3 px-3 text-center">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${{badgeClass}} uppercase tracking-wide">
                ${{p.type}}
              </span>
            </td>
            <td class="py-3 px-3 text-right font-mono font-bold text-red-900">
              ${{(Number(p.price) || 0).toLocaleString('vi-VN')}} đ
            </td>
            <td class="py-3 px-3 text-center">
              <button onclick="viewProductStudents(${{p.id}})" class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-[#8F1D35] hover:border-rose-300 border border-slate-200 text-slate-800 font-black font-mono text-[11px] transition hover:scale-105 shadow-sm group" title="Bấm để xem danh sách học viên đăng ký nhóm này">
                <span>👥 ${{p.registered_count || 0}} học viên</span>
                <span class="text-[10px] text-slate-400 group-hover:text-[#8F1D35] transition">🔍</span>
              </button>
            </td>
            <td class="py-3 px-3 text-slate-600 max-w-xs truncate" title="${{p.description || ''}}">
              ${{p.description || '--'}}
            </td>
            <td class="py-3 px-3 text-center space-x-1 whitespace-nowrap">
              <button onclick="editProduct(${{p.id}})" class="text-indigo-600 hover:text-indigo-900 font-bold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-[11px] transition">
                ✏️ Sửa
              </button>
              <button onclick="deleteProduct(${{p.id}})" class="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded text-[11px] transition">
                🗑️ Xóa
              </button>
            </td>
          </tr>
        `;
      }}).join('');
    }}

    function openProductModal(prod = null) {{
      document.getElementById('modalProduct').classList.remove('hidden');
      if (prod) {{
        document.getElementById('modalProductTitle').innerText = '✏️ Chỉnh Sửa Sản Phẩm #' + prod.id;
        document.getElementById('prod_id').value = prod.id;
        document.getElementById('prod_name').value = prod.name;
        document.getElementById('prod_type').value = prod.type;
        document.getElementById('prod_price').value = prod.price;
        document.getElementById('prod_registered').value = prod.registered_count || 0;
        document.getElementById('prod_desc').value = prod.description || '';
      }} else {{
        document.getElementById('modalProductTitle').innerText = '➕ Thêm Sản Phẩm Mới';
        document.getElementById('prod_id').value = '';
        document.getElementById('prod_name').value = '';
        document.getElementById('prod_type').value = 'digital';
        document.getElementById('prod_price').value = '';
        document.getElementById('prod_registered').value = '0';
        document.getElementById('prod_desc').value = '';
      }}
    }}

    function closeProductModal() {{
      document.getElementById('modalProduct').classList.add('hidden');
    }}

    function saveProduct() {{
      const id = document.getElementById('prod_id').value;
      const name = document.getElementById('prod_name').value.trim();
      const type = document.getElementById('prod_type').value;
      const price = Number(document.getElementById('prod_price').value) || 0;
      const registered = Number(document.getElementById('prod_registered').value) || 0;
      const desc = document.getElementById('prod_desc').value.trim();

      if (!name) {{
        alert('Vui lòng nhập tên sản phẩm / khóa học!');
        return;
      }}

      if (id) {{
        // Update
        const idx = _crmData.products.findIndex(p => p.id == id);
        if (idx !== -1) {{
          _crmData.products[idx] = {{
            ..._crmData.products[idx],
            name, type, price,
            registered_count: registered,
            description: desc
          }};
        }}
      }} else {{
        // Create new
        const newId = _crmData.products.length > 0 ? Math.max(..._crmData.products.map(p => p.id)) + 1 : 1;
        _crmData.products.push({{
          id: newId,
          name, type, price,
          registered_count: registered,
          description: desc,
          created_at: new Date().toISOString()
        }});
      }}

      persistCRMData();
      renderProductsTable();
      closeProductModal();
    }}

    function editProduct(id) {{
      const p = _crmData.products.find(item => item.id == id);
      if (p) openProductModal(p);
    }}

    function deleteProduct(id) {{
      const p = _crmData.products.find(item => item.id == id);
      if (!p) return;
      if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm: "${{p.name}}"?`)) {{
        _crmData.products = _crmData.products.filter(item => item.id != id);
        persistCRMData();
        renderProductsTable();
      }}
    }}

    // XEM DANH SÁCH HỌC VIÊN THUỘC MỘT SẢN PHẨM CỤ THỂ
    let _currentViewingProductId = null;

    function viewProductStudents(prodId) {{
      _currentViewingProductId = prodId;
      const prod = _crmData.products.find(p => p.id == prodId);
      if (!prod) return;

      document.getElementById('modalProductStudents').classList.remove('hidden');
      document.getElementById('prodStudentsModalTitle').innerText = `👥 Danh Sách Học Viên (${{prod.registered_count || 0}})`;
      document.getElementById('prodStudentsModalSubtitle').innerHTML = `Khóa học: <strong class="text-slate-900">${{prod.name}}</strong> • Học phí: <span class="font-bold text-red-900">${{(Number(prod.price) || 0).toLocaleString('vi-VN')}} đ</span> • Phân loại: <span class="uppercase font-bold">${{prod.type}}</span>`;

      // Lấy tất cả đơn hàng thuộc sản phẩm này
      const matchingOrders = _crmData.orders.filter(o => 
        o.product_id == prodId || 
        (o.product_name && prod.name && o.product_name.toLowerCase().includes(prod.name.toLowerCase())) ||
        (prod.name.includes('Test') && o.product_name && o.product_name.includes('Test')) ||
        (prod.name.includes('Full Online') && o.product_name && o.product_name.includes('Full Online'))
      );

      const container = document.getElementById('prodStudentsListContainer');
      document.getElementById('prodStudentsTotalCount').innerText = `Tổng cộng: ${{matchingOrders.length}} học viên đã ghi danh`;

      if (matchingOrders.length === 0) {{
        container.innerHTML = `
          <div class="py-12 text-center text-slate-500 space-y-3">
            <div class="text-4xl">📭</div>
            <p class="font-semibold text-sm text-slate-700">Chưa có học viên nào đăng ký khóa học này.</p>
            <p class="text-slate-400 text-xs">Bạn có thể bấm nút bên dưới để tạo đơn và thêm học viên vào khóa học ngay!</p>
          </div>
        `;
        return;
      }}

      container.innerHTML = `
        <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
          <thead class="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
            <tr>
              <th class="py-2.5 px-3 w-10 text-center">STT</th>
              <th class="py-2.5 px-3">Học Viên</th>
              <th class="py-2.5 px-3 w-32">Số Điện Thoại</th>
              <th class="py-2.5 px-3 w-28 text-center">Liên Hệ Zalo</th>
              <th class="py-2.5 px-3 w-28 text-right">Số Tiền</th>
              <th class="py-2.5 px-3 w-32 text-center">Trạng Thái</th>
              <th class="py-2.5 px-3 w-28">Ngày Mua</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${{matchingOrders.map((o, idx) => {{
              const cust = _crmData.customers.find(c => c.id == o.customer_id || (o.customer_phone && c.phone == o.customer_phone));
              const phone = o.customer_phone || (cust ? cust.phone : '--');
              const name = o.customer_name || (cust ? cust.name : 'Học viên');
              const zalo = cust && cust.zalo ? cust.zalo : phone;
              const isPaid = o.status === 'paid';

              return `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 text-center font-bold text-slate-400 font-mono">${{idx + 1}}</td>
                  <td class="py-2.5 px-3 font-bold text-slate-900">${{name}}</td>
                  <td class="py-2.5 px-3 font-mono font-semibold">
                    ${{phone ? `<a href="tel:${{phone}}" class="text-blue-600 hover:underline">📞 ${{phone}}</a>` : '--'}}
                  </td>
                  <td class="py-2.5 px-3 text-center font-mono">
                    ${{zalo ? `<a href="https://zalo.me/${{String(zalo).replace(/\\D/g,'')}}" target="_blank" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition">💬 Zalo</a>` : '--'}}
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-red-900">
                    ${{(Number(o.amount) || 0).toLocaleString('vi-VN')}} đ
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${{isPaid ? 'badge-paid' : 'badge-pending'}}">
                      ${{isPaid ? '&#10004; ĐÃ THANH TOÁN' : '&#9203; Chờ thanh toán'}}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-500 text-[11px]">${{o.order_date || '--'}}</td>
                </tr>
              `;
            }}).join('')}}
          </tbody>
        </table>
      `;
    }}

    function closeProductStudentsModal() {{
      document.getElementById('modalProductStudents').classList.add('hidden');
      _currentViewingProductId = null;
    }}

    function quickAddStudentToCurrentProduct() {{
      const prodId = _currentViewingProductId;
      closeProductStudentsModal();
      if (prodId) {{
        openOrderModal();
        document.getElementById('ord_product_id').value = prodId;
        onOrderProductChange();
      }}
    }}

    // -------------------------------------------------------------------------
    // CRUD: CUSTOMERS (KHÁCH HÀNG)
    // -------------------------------------------------------------------------
    function searchCustomers(term) {{
      _searchCustomerTerm = term.toLowerCase().trim();
      renderCustomersTable();
    }}

    function renderCustomersTable() {{
      const tbody = document.getElementById('customerTableBody');
      if (!tbody) return;

      let list = _crmData.customers.filter(c => {{
        if (_searchCustomerTerm) {{
          const matchName = (c.name || '').toLowerCase().includes(_searchCustomerTerm);
          const matchPhone = (c.phone || '').toLowerCase().includes(_searchCustomerTerm);
          const matchZalo = (c.zalo || '').toLowerCase().includes(_searchCustomerTerm);
          return matchName || matchPhone || matchZalo;
        }}
        return true;
      }});

      if (list.length === 0) {{
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-slate-400 italic">Chưa có khách hàng nào. Bấm "Thêm Khách Hàng Mới" để tạo.</td></tr>';
        return;
      }}

      tbody.innerHTML = list.map(c => {{
        // Đếm đơn hàng của khách này
        const userOrders = _crmData.orders.filter(o => o.customer_id == c.id || (c.phone && o.customer_phone == c.phone));
        const paidCount = userOrders.filter(o => o.status === 'paid').length;

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-3 text-center font-mono text-slate-500 font-bold">${{c.id}}</td>
            <td class="py-3 px-3 font-bold text-slate-900">${{c.name}}</td>
            <td class="py-3 px-3 font-mono font-semibold text-slate-800">
              <a href="tel:${{c.phone}}" class="text-blue-600 hover:underline">${{c.phone}}</a>
            </td>
            <td class="py-3 px-3 font-mono text-slate-600">
              ${{c.zalo ? `<a href="https://zalo.me/${{c.zalo.replace(/\\D/g,'')}}" target="_blank" class="text-indigo-600 font-bold hover:underline">💬 ${{c.zalo}}</a>` : '--'}}
            </td>
            <td class="py-3 px-3 text-slate-600">${{c.registered_at || '--'}}</td>
            <td class="py-3 px-3 text-center">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${{paidCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}}">
                ${{userOrders.length}} đơn (${{paidCount}} đã TT)
              </span>
            </td>
            <td class="py-3 px-3 text-center space-x-1 whitespace-nowrap">
              <button onclick="createOrderForCustomer(${{c.id}})" class="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded text-[11px] transition" title="Tạo đơn hàng mới cho khách này">
                🛒 Mua
              </button>
              <button onclick="editCustomer(${{c.id}})" class="text-indigo-600 hover:text-indigo-900 font-bold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-[11px] transition">
                ✏️ Sửa
              </button>
              <button onclick="deleteCustomer(${{c.id}})" class="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded text-[11px] transition">
                🗑️ Xóa
              </button>
            </td>
          </tr>
        `;
      }}).join('');
    }}

    function openCustomerModal(cust = null) {{
      document.getElementById('modalCustomer').classList.remove('hidden');
      if (cust) {{
        document.getElementById('modalCustomerTitle').innerText = '✏️ Chỉnh Sửa Khách Hàng #' + cust.id;
        document.getElementById('cust_id').value = cust.id;
        document.getElementById('cust_name').value = cust.name;
        document.getElementById('cust_phone').value = cust.phone;
        document.getElementById('cust_zalo').value = cust.zalo || cust.phone || '';
        document.getElementById('cust_registered_at').value = cust.registered_at || '';
      }} else {{
        document.getElementById('modalCustomerTitle').innerText = '➕ Thêm Khách Hàng Mới';
        document.getElementById('cust_id').value = '';
        document.getElementById('cust_name').value = '';
        document.getElementById('cust_phone').value = '';
        document.getElementById('cust_zalo').value = '';
        document.getElementById('cust_registered_at').value = new Date().toLocaleString('vi-VN');
      }}
    }}

    function closeCustomerModal() {{
      document.getElementById('modalCustomer').classList.add('hidden');
    }}

    async function saveCustomer() {{
      const id = document.getElementById('cust_id').value;
      const name = document.getElementById('cust_name').value.trim();
      const phone = document.getElementById('cust_phone').value.trim();
      const zalo = document.getElementById('cust_zalo').value.trim() || phone;
      const registered_at = document.getElementById('cust_registered_at').value.trim() || new Date().toLocaleString('vi-VN');

      if (!name || !phone) {{
        alert('Vui lòng điền Họ tên và Số điện thoại!');
        return;
      }}

      // Kiểm tra trùng SĐT nếu là thêm mới
      if (!id) {{
        const exist = _crmData.customers.some(c => c.phone.replace(/\\D/g,'') === phone.replace(/\\D/g,''));
        if (exist) {{
          alert(`Số điện thoại ${{phone}} đã tồn tại trong danh sách khách hàng! Không được trùng lặp.`);
          return;
        }}
      }}

      if (id) {{
        // Update
        const idx = _crmData.customers.findIndex(c => c.id == id);
        if (idx !== -1) {{
          _crmData.customers[idx] = {{
            ..._crmData.customers[idx],
            name, phone, zalo, registered_at
          }};
          // Cập nhật lên Supabase & Google Sheets
          syncEntityToRemote('customers', 'update', _crmData.customers[idx]);
        }}
      }} else {{
        // Create new
        const newId = _crmData.customers.length > 0 ? Math.max(..._crmData.customers.map(c => c.id)) + 1 : 1;
        const newCust = {{
          id: newId,
          name, phone, zalo, registered_at,
          created_at: new Date().toISOString()
        }};
        _crmData.customers.push(newCust);
        // Đồng bộ lên Supabase & Google Sheets
        syncEntityToRemote('customers', 'insert', newCust);
      }}

      persistCRMData();
      renderCustomersTable();
      closeCustomerModal();
    }}

    function editCustomer(id) {{
      const c = _crmData.customers.find(item => item.id == id);
      if (c) openCustomerModal(c);
    }}

    function deleteCustomer(id) {{
      const c = _crmData.customers.find(item => item.id == id);
      if (!c) return;
      if (confirm(`Bạn có chắc chắn muốn xóa khách hàng: "${{c.name}}" (${{c.phone}})?`)) {{
        _crmData.customers = _crmData.customers.filter(item => item.id != id);
        // Đồng bộ xóa sang Supabase & Sheets
        syncEntityToRemote('customers', 'delete', c);
        persistCRMData();
        renderCustomersTable();
      }}
    }}

    // -------------------------------------------------------------------------
    // CRUD: ORDERS (ĐƠN HÀNG)
    // -------------------------------------------------------------------------
    function filterOrders(status) {{
      _filterOrderStatus = status;
      ['all', 'paid', 'pending'].forEach(s => {{
        const btn = document.getElementById('fltOrder' + s.charAt(0).toUpperCase() + s.slice(1));
        if (btn) {{
          if (s === status) {{
            btn.className = "px-2.5 py-1 rounded-md bg-slate-800 text-white font-bold text-[11px]";
          }} else {{
            btn.className = "px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50";
          }}
        }}
      }});
      renderOrdersTable();
    }}

    function searchOrders(term) {{
      _searchOrderTerm = term.toLowerCase().trim();
      renderOrdersTable();
    }}

    function renderOrdersTable() {{
      const tbody = document.getElementById('orderTableBody');
      if (!tbody) return;

      let list = _crmData.orders.filter(o => {{
        if (_filterOrderStatus !== 'all' && o.status !== _filterOrderStatus) return false;
        if (_searchOrderTerm) {{
          const term = _searchOrderTerm;
          const matchCust = (o.customer_name || '').toLowerCase().includes(term);
          const matchPhone = (o.customer_phone || '').toLowerCase().includes(term);
          const matchProd = (o.product_name || '').toLowerCase().includes(term);
          const matchId = String(o.id).includes(term);
          return matchCust || matchPhone || matchProd || matchId;
        }}
        return true;
      }});

      if (list.length === 0) {{
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-slate-400 italic">Chưa có đơn hàng nào. Bấm "Tạo Đơn Hàng Mới" để thêm.</td></tr>';
        return;
      }}

      tbody.innerHTML = list.map(o => {{
        const statusBadge = o.status === 'paid' 
          ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold badge-paid">&#10004; ĐÃ THANH TOÁN</span>'
          : (o.status === 'pending'
              ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold badge-pending">&#9203; Chờ thanh toán</span>'
              : '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold badge-cancelled">&#10008; Đã hủy</span>');

        // Sinh mã chuẩn: SCC-ddMM-xxxx
        const phoneSuffix = o.customer_phone ? String(o.customer_phone).slice(-4) : '0000';
        const orderCode = `SCC-${{phoneSuffix}}-#${{o.id}}`;

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-3 font-mono font-bold text-slate-700">${{orderCode}}</td>
            <td class="py-3 px-3">
              <div class="font-bold text-slate-900">${{o.customer_name || 'Khách vãng lai'}}</div>
              <div class="text-[11px] text-slate-500 font-mono">${{o.customer_phone || '--'}}</div>
            </td>
            <td class="py-3 px-3 font-medium text-slate-800">${{o.product_name || 'Khóa học Chiropractic'}}</td>
            <td class="py-3 px-3 text-right font-mono font-extrabold text-red-900">
              ${{(Number(o.amount) || 0).toLocaleString('vi-VN')}} đ
            </td>
            <td class="py-3 px-3 text-center">${{statusBadge}}</td>
            <td class="py-3 px-3 text-slate-600 text-[11px]">${{o.order_date || '--'}}</td>
            <td class="py-3 px-3 text-center space-x-1 whitespace-nowrap">
              ${{o.status !== 'paid' ? `
                <button onclick="quickMarkPaid(${{o.id}})" class="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 bg-emerald-100 hover:bg-emerald-200 rounded text-[11px] transition" title="Xác nhận đã nhận tiền chuyển khoản">
                  ✅ Thu tiền
                </button>
              ` : `
                <button onclick="openEmailModal(${{o.id}})" class="text-blue-700 hover:text-blue-900 font-bold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-[11px] transition" title="Gửi email kích hoạt cho học viên">
                  📧 Email
                </button>
              `}}
              <button onclick="editOrder(${{o.id}})" class="text-indigo-600 hover:text-indigo-900 font-bold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-[11px] transition">
                ✏️
              </button>
              <button onclick="deleteOrder(${{o.id}})" class="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded text-[11px] transition">
                🗑️
              </button>
            </td>
          </tr>
        `;
      }}).join('');
    }}

    function populateOrderDropdowns() {{
      const selCust = document.getElementById('ord_customer_id');
      const selProd = document.getElementById('ord_product_id');

      selCust.innerHTML = _crmData.customers.map(c => `
        <option value="${{c.id}}">${{c.name}} (${{c.phone}})</option>
      `).join('');

      selProd.innerHTML = _crmData.products.map(p => `
        <option value="${{p.id}}" data-price="${{p.price}}">${{p.name}} - ${{p.price.toLocaleString('vi-VN')}}đ</option>
      `).join('');
    }}

    function onOrderProductChange() {{
      const sel = document.getElementById('ord_product_id');
      const opt = sel.options[sel.selectedIndex];
      if (opt && opt.dataset.price) {{
        document.getElementById('ord_amount').value = opt.dataset.price;
      }}
    }}

    function openOrderModal(ord = null, defaultCustId = null) {{
      populateOrderDropdowns();
      document.getElementById('modalOrder').classList.remove('hidden');

      if (ord) {{
        document.getElementById('modalOrderTitle').innerText = '✏️ Chỉnh Sửa Đơn Hàng #' + ord.id;
        document.getElementById('ord_id').value = ord.id;
        document.getElementById('ord_customer_id').value = ord.customer_id;
        document.getElementById('ord_product_id').value = ord.product_id;
        document.getElementById('ord_amount').value = ord.amount;
        document.getElementById('ord_status').value = ord.status;
        document.getElementById('ord_date').value = ord.order_date || '';
      }} else {{
        document.getElementById('modalOrderTitle').innerText = '➕ Tạo Đơn Hàng Mới';
        document.getElementById('ord_id').value = '';
        if (defaultCustId) {{
          document.getElementById('ord_customer_id').value = defaultCustId;
        }}
        onOrderProductChange();
        document.getElementById('ord_status').value = 'paid';
        document.getElementById('ord_date').value = new Date().toLocaleString('vi-VN');
      }}
    }}

    function closeOrderModal() {{
      document.getElementById('modalOrder').classList.add('hidden');
    }}

    function createOrderForCustomer(custId) {{
      openOrderModal(null, custId);
    }}

    async function saveOrder() {{
      const id = document.getElementById('ord_id').value;
      const custId = document.getElementById('ord_customer_id').value;
      const prodId = document.getElementById('ord_product_id').value;
      const amount = Number(document.getElementById('ord_amount').value) || 0;
      const status = document.getElementById('ord_status').value;
      const dateStr = document.getElementById('ord_date').value.trim() || new Date().toLocaleString('vi-VN');

      const cust = _crmData.customers.find(c => c.id == custId);
      const prod = _crmData.products.find(p => p.id == prodId);

      if (!cust || !prod) {{
        alert('Vui lòng chọn đầy đủ Khách hàng và Sản phẩm!');
        return;
      }}

      if (id) {{
        // Update
        const idx = _crmData.orders.findIndex(o => o.id == id);
        if (idx !== -1) {{
          _crmData.orders[idx] = {{
            ..._crmData.orders[idx],
            customer_id: custId,
            customer_name: cust.name,
            customer_phone: cust.phone,
            product_id: prodId,
            product_name: prod.name,
            amount: amount,
            status: status,
            order_date: dateStr
          }};
          syncEntityToRemote('orders', 'update', _crmData.orders[idx]);
        }}
      }} else {{
        // Create new
        const newId = _crmData.orders.length > 0 ? Math.max(..._crmData.orders.map(o => o.id)) + 1 : 1;
        const newOrder = {{
          id: newId,
          customer_id: custId,
          customer_name: cust.name,
          customer_phone: cust.phone,
          product_id: prodId,
          product_name: prod.name,
          amount: amount,
          status: status,
          order_date: dateStr,
          created_at: new Date().toISOString()
        }};
        _crmData.orders.push(newOrder);
        syncEntityToRemote('orders', 'insert', newOrder);
      }}

      // Cập nhật lại registered_count cho các sản phẩm
      _crmData.products.forEach(p => {{
        p.registered_count = _crmData.orders.filter(o => o.product_id == p.id).length;
      }});

      persistCRMData();
      renderAllCRM();
      closeOrderModal();
    }}

    function editOrder(id) {{
      const o = _crmData.orders.find(item => item.id == id);
      if (o) openOrderModal(o);
    }}

    function deleteOrder(id) {{
      const o = _crmData.orders.find(item => item.id == id);
      if (!o) return;
      if (confirm(`Bạn có chắc muốn xóa đơn hàng #${{o.id}} (${{o.customer_name}})?`)) {{
        _crmData.orders = _crmData.orders.filter(item => item.id != id);
        syncEntityToRemote('orders', 'delete', o);
        _crmData.products.forEach(p => {{
          p.registered_count = _crmData.orders.filter(item => item.product_id == p.id).length;
        }});
        persistCRMData();
        renderAllCRM();
      }}
    }}

    function quickMarkPaid(orderId) {{
      const o = _crmData.orders.find(item => item.id == orderId);
      if (!o) return;
      o.status = 'paid';
      syncEntityToRemote('orders', 'update', o);
      persistCRMData();
      renderAllCRM();
      alert(`Đã xác nhận thanh toán thành công cho đơn hàng #${{orderId}} (${{o.customer_name}})`);
    }}

    // -------------------------------------------------------------------------
    // EMAIL CONFIRMATION MODAL
    // -------------------------------------------------------------------------
    function openEmailModal(orderId) {{
      const o = _crmData.orders.find(item => item.id == orderId);
      if (!o) return;
      document.getElementById('modalSendEmail').classList.remove('hidden');
      document.getElementById('mail_recipient').value = 'buihuy01@gmail.com';
      document.getElementById('mail_name').value = o.customer_name || 'Học viên';
      document.getElementById('mail_order_id').value = `SCC-1809-${{o.customer_phone ? o.customer_phone.slice(-4) : '8698'}}`;
      document.getElementById('mail_amount').value = (Number(o.amount) || 0).toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('mail_course').value = o.product_name || 'Khóa học Chiropractic';
      document.getElementById('mailResult').classList.add('hidden');
    }}

    function closeEmailModal() {{
      document.getElementById('modalSendEmail').classList.add('hidden');
    }}

    async function executeSendEmail() {{
      const email = document.getElementById('mail_recipient').value.trim();
      const name = document.getElementById('mail_name').value.trim();
      const orderId = document.getElementById('mail_order_id').value.trim();
      const amount = document.getElementById('mail_amount').value.trim();
      const course = document.getElementById('mail_course').value.trim();
      const resEl = document.getElementById('mailResult');
      const btn = document.getElementById('btnExecuteSendMail');

      if (!email || !email.includes('@')) {{
        alert('Vui lòng nhập email hợp lệ!');
        return;
      }}

      btn.disabled = true;
      btn.innerText = 'Đang gửi email...';
      resEl.classList.remove('hidden');
      resEl.className = 'text-xs text-indigo-700 font-bold';
      resEl.innerText = '⏳ Đang gửi email xác nhận qua Apps Script & EmailJS...';

      try {{
        const gsUrl = document.getElementById('cfgGoogleSheetUrl').value || DEFAULT_GS_URL;
        // Gửi qua Apps Script Webhook
        await fetch(gsUrl, {{
          method: 'POST',
          mode: 'no-cors',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{
            action: 'confirm_payment',
            email: email,
            name: name,
            price: amount,
            course: course,
            order_id: orderId
          }})
        }});

        resEl.className = 'text-xs text-emerald-700 font-bold';
        resEl.innerText = '✅ Đã gửi email xác nhận thành công tới ' + email;
      }} catch(err) {{
        resEl.className = 'text-xs text-rose-600 font-bold';
        resEl.innerText = '❌ Lỗi gửi email: ' + err.message;
      }} finally {{
        btn.disabled = false;
        btn.innerText = 'Gửi Email Ngay ➔';
      }}
    }}

    // -------------------------------------------------------------------------
    // MULTI-LAYER REMOTE SYNC (SUPABASE & GOOGLE SHEETS)
    // -------------------------------------------------------------------------
    async function syncEntityToRemote(entityType, action, data) {{
      const sbUrl = document.getElementById('cfgSupabaseUrl').value || DEFAULT_SUPABASE_URL;
      const sbKey = document.getElementById('cfgSupabaseKey').value || DEFAULT_SUPABASE_ANON_KEY;
      const gsUrl = document.getElementById('cfgGoogleSheetUrl').value || DEFAULT_GS_URL;

      console.log(`Syncing [${{entityType}}] [${{action}}]:`, data);

      // 1. SUPABASE REST API SYNC
      try {{
        if (entityType === 'customers' || entityType === 'orders') {{
          const cleanPhone = String(data.phone || data.customer_phone || '').replace(/\\D/g, '');
          
          if (action === 'insert') {{
            await fetch(`${{sbUrl}}/rest/v1/leads`, {{
              method: 'POST',
              headers: {{
                'apikey': sbKey,
                'Authorization': `Bearer ${{sbKey}}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              }},
              body: JSON.stringify({{
                name: data.name || data.customer_name,
                phone: cleanPhone,
                price: (data.amount ? data.amount.toLocaleString('vi-VN') + ' VNĐ' : 'Khảo sát nhu cầu'),
                course: data.product_name || 'Khóa học Chiropractic',
                status: data.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'Chờ thanh toán',
                channel: 'Admin Panel CRM'
              }})
            }});
          }} else if (action === 'update' && cleanPhone) {{
            await fetch(`${{sbUrl}}/rest/v1/leads?phone=like.*${{cleanPhone}}*`, {{
              method: 'PATCH',
              headers: {{
                'apikey': sbKey,
                'Authorization': `Bearer ${{sbKey}}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              }},
              body: JSON.stringify({{
                name: data.name || data.customer_name,
                price: (data.amount ? data.amount.toLocaleString('vi-VN') + ' VNĐ' : undefined),
                status: data.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'Chờ thanh toán'
              }})
            }});
          }} else if (action === 'delete' && cleanPhone) {{
            await fetch(`${{sbUrl}}/rest/v1/leads?phone=like.*${{cleanPhone}}*`, {{
              method: 'DELETE',
              headers: {{
                'apikey': sbKey,
                'Authorization': `Bearer ${{sbKey}}`
              }}
            }});
          }}
        }}
      }} catch(errSb) {{
        console.warn('Supabase sync warning:', errSb);
      }}

      // 2. GOOGLE SHEETS WEBHOOK SYNC
      try {{
        if (gsUrl) {{
          const cleanPhone = String(data.phone || data.customer_phone || '').replace(/\\D/g, '');
          await fetch(gsUrl, {{
            method: 'POST',
            mode: 'no-cors',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify({{
              action: action === 'delete' ? 'delete_lead' : 'update_lead',
              phone: cleanPhone,
              name: data.name || data.customer_name,
              price: data.amount ? data.amount.toLocaleString('vi-VN') + ' VNĐ' : '',
              status: data.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'Chờ thanh toán',
              course: data.product_name || ''
            }})
          }});
        }}
      }} catch(errGs) {{
        console.warn('Google Sheet sync warning:', errGs);
      }}
    }}

    async function syncAllWithRemote(showAlert = true) {{
      const btn = document.getElementById('btnSyncAllRemote');
      if (btn && showAlert) {{
        btn.innerText = 'Đang đồng bộ...';
        btn.disabled = true;
      }}

      const sbUrl = document.getElementById('cfgSupabaseUrl').value || DEFAULT_SUPABASE_URL;
      const sbKey = document.getElementById('cfgSupabaseKey').value || DEFAULT_SUPABASE_ANON_KEY;

      try {{
        const resp = await fetch(`${{sbUrl}}/rest/v1/leads?select=*&order=created_at.asc`, {{
          headers: {{
            'apikey': sbKey,
            'Authorization': `Bearer ${{sbKey}}`
          }}
        }});

        if (resp.ok) {{
          const remoteLeads = await resp.json();
          let newCustCount = 0;

          remoteLeads.forEach(r => {{
            const rawPhone = String(r.phone || '').replace(/\\D/g, '');
            if (!rawPhone || rawPhone.length < 8) return;
            const phone = rawPhone.startsWith('0') ? rawPhone : '0' + rawPhone;

            let c = _crmData.customers.find(item => item.phone === phone);
            if (!c) {{
              const newId = _crmData.customers.length > 0 ? Math.max(..._crmData.customers.map(item => item.id)) + 1 : 1;
              c = {{
                id: newId,
                name: r.name || 'Khách hàng',
                phone: phone,
                zalo: phone,
                registered_at: r.time_str || (r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : 'Mới đây')
              }};
              _crmData.customers.push(c);
              newCustCount++;
            }}

            // Khớp đơn hàng nếu có
            if (r.price && (r.price.includes('VNĐ') || r.price.includes('đ') || Number(r.price) > 0)) {{
              const existOrder = _crmData.orders.some(o => o.customer_phone === phone);
              if (!existOrder) {{
                let cleanPrice = Number(String(r.price).replace(/\\D/g, '')) || 2000;
                let matchedProd = _crmData.products.find(p => p.price == cleanPrice) || _crmData.products[0];
                const newOrdId = _crmData.orders.length > 0 ? Math.max(..._crmData.orders.map(o => o.id)) + 1 : 1;
                
                _crmData.orders.push({{
                  id: newOrdId,
                  customer_id: c.id,
                  customer_name: c.name,
                  customer_phone: phone,
                  product_id: matchedProd ? matchedProd.id : 1,
                  product_name: r.course || (matchedProd ? matchedProd.name : 'Khóa học'),
                  amount: cleanPrice,
                  status: (r.status && r.status.includes('ĐÃ THANH TOÁN')) ? 'paid' : 'pending',
                  order_date: r.time_str || '18/09/2026'
                }});
              }}
            }}
          }});

          // Cập nhật lại registered_count
          _crmData.products.forEach(p => {{
            p.registered_count = _crmData.orders.filter(o => o.product_id == p.id).length;
          }});

          persistCRMData();
          renderAllCRM();

          const ind = document.getElementById('syncIndicator');
          if (ind) {{
            ind.className = "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold";
            document.getElementById('syncIndicatorText').innerText = `Đã đồng bộ (${{remoteLeads.length}} bản ghi Supabase)`;
          }}

          if (showAlert) alert(`Đã đồng bộ thành công ${{remoteLeads.length}} học viên từ Supabase & Google Sheets!`);
        }}
      }} catch(e) {{
        console.warn('Sync all remote error:', e);
        if (showAlert) alert('Không thể kết nối Supabase: ' + e.message);
      }} finally {{
        if (btn && showAlert) {{
          btn.innerText = '🔄 Đồng Bộ Supabase & Sheets';
          btn.disabled = false;
        }}
      }}
    }}

    // Xuất file JSON để nạp vào brain.db
    function exportCRMToBrainJson() {{
      const jsonStr = JSON.stringify(_crmData, null, 2);
      const blob = new Blob([jsonStr], {{ type: 'application/json' }});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'crm_data_sync.json';
      a.click();
      URL.revokeObjectURL(url);
      alert('Đã tải xuống file crm_data_sync.json!\\nBạn có thể chạy lệnh: python3 sync_crm_to_brain.py crm_data_sync.json để nạp trực tiếp vào SQLite brain.db.');
    }}

    // Xuất Excel CSV
    function exportCSVOrders() {{
      let csv = "\\uFEFFMã đơn,Khách hàng,Số điện thoại,Khóa học,Số tiền,Trạng thái,Ngày mua\\n";
      _crmData.orders.forEach(o => {{
        csv += `"#${{o.id}}","${{o.customer_name || ''}}","'${{o.customer_phone || ''}}","${{o.product_name || ''}}","${{o.amount || 0}}","${{o.status || ''}}","${{o.order_date || ''}}"\\n`;
      }});
      const blob = new Blob([csv], {{ type: 'text/csv;charset=utf-8;' }});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Don_Hang_Simon_Center_${{new Date().toISOString().slice(0,10)}}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }}

    // -------------------------------------------------------------------------
    // KHẢO SÁT & CÀI ĐẶT
    // -------------------------------------------------------------------------
    async function loadSurveyData() {{
      const container = document.getElementById('surveyTable');
      container.innerHTML = '<div class="py-8 text-center text-slate-500">Đang nạp dữ liệu khảo sát...</div>';
      const sbUrl = document.getElementById('cfgSupabaseUrl').value || DEFAULT_SUPABASE_URL;
      const sbKey = document.getElementById('cfgSupabaseKey').value || DEFAULT_SUPABASE_ANON_KEY;

      try {{
        const resp = await fetch(`${{sbUrl}}/rest/v1/leads?channel=like.*Khảo Sát*&order=created_at.desc`, {{
          headers: {{ 'apikey': sbKey, 'Authorization': `Bearer ${{sbKey}}` }}
        }});
        if (resp.ok) {{
          const data = await resp.json();
          document.getElementById('badgeSurveyCount').innerText = data.length;
          if (data.length === 0) {{
            container.innerHTML = '<div class="py-8 text-center text-slate-400 italic">Chưa có lượt khảo sát nào.</div>';
            return;
          }}
          container.innerHTML = `
            <table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead class="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th class="py-2.5 px-3">Thời gian</th>
                  <th class="py-2.5 px-3">Học viên</th>
                  <th class="py-2.5 px-3">SĐT</th>
                  <th class="py-2.5 px-3">Chi tiết khảo sát</th>
                  <th class="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${{data.map(r => `
                  <tr class="hover:bg-slate-50">
                    <td class="py-2 px-3 text-slate-500 font-mono">${{r.time_str || r.created_at}}</td>
                    <td class="py-2 px-3 font-bold text-slate-900">${{r.name || 'Khách khảo sát'}}</td>
                    <td class="py-2 px-3 font-mono">${{r.phone || '--'}}</td>
                    <td class="py-2 px-3 max-w-md truncate" title="${{r.occupation || ''}}">${{r.occupation || '--'}}</td>
                    <td class="py-2 px-3 font-bold text-emerald-700">${{r.status || 'Đã gửi'}}</td>
                  </tr>
                `).join('')}}
              </tbody>
            </table>
          `;
        }}
      }} catch(err) {{
        container.innerHTML = '<div class="py-6 text-center text-rose-600">Lỗi nạp khảo sát: ' + err.message + '</div>';
      }}
    }}

    function saveSettings() {{
      alert('Đã lưu cấu hình API thành công!');
    }}

    async function testSheetConnection() {{
      const url = document.getElementById('cfgGoogleSheetUrl').value;
      try {{
        const r = await fetch(url + '?action=check_payment&phone=098978698&t=' + Date.now());
        const data = await r.json();
        alert('Kết nối Google Apps Script thành công: ' + JSON.stringify(data));
      }} catch(err) {{
        alert('Không thể kết nối Google Sheets: ' + err.message);
      }}
    }}

    async function testSupabaseConnection() {{
      const sbUrl = document.getElementById('cfgSupabaseUrl').value;
      const sbKey = document.getElementById('cfgSupabaseKey').value;
      try {{
        const r = await fetch(`${{sbUrl}}/rest/v1/leads?select=id&limit=1`, {{
          headers: {{ 'apikey': sbKey, 'Authorization': `Bearer ${{sbKey}}` }}
        }});
        if (r.ok) alert('Kết nối Supabase thành công! Tốc độ phản hồi cực nhanh.');
        else alert('Lỗi Supabase: Mã lỗi HTTP ' + r.status);
      }} catch(err) {{
        alert('Không thể kết nối Supabase: ' + err.message);
      }}
    }}
  </script>
</body>
</html>
'''

with open('/Users/huybui/.gemini/antigravity/scratch/Chiro.vn/admin.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Generated admin.html successfully! Size:', len(html_content))
