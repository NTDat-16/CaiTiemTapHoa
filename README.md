# 🛍️ Cái Tiệm Tạp Hóa

Ứng dụng web quản lý tiệm tạp hóa được xây dựng bằng **React + Vite**, tích hợp giao diện hiện đại từ **Ant Design (v5)**, cùng các công cụ xuất báo cáo PDF như **jspdf** và **html2canvas**.

---

## 🚀 Công nghệ sử dụng

- ⚛️ **React 19** – Thư viện giao diện hiện đại, hiệu năng cao.
- ⚡ **Vite** – Trình build siêu nhanh với HMR (Hot Module Replacement).
- 🎨 **Ant Design 5** – Bộ giao diện người dùng chuyên nghiệp, dễ dùng.
- 🧩 **@ant-design/v5-patch-for-react-19** – Hỗ trợ Ant Design tương thích với React 19.
- 📄 **jspdf & html2canvas** – Tạo và xuất file PDF trực tiếp từ giao diện.

---

## Cấu trúc thư mục

```
└── 📁CaiTiemTapHoa
    └── 📁public
        └── 📁img
            ├── AvtUser.png
            ├── Default_Product.png
            ├── LogoCaiTiemTapHoa.png
    └── 📁src
        └── 📁assets
            ├── aquavoiem.png
            ├── QR.png
            ├── react.svg
        └── 📁components
            └── 📁Category
                ├── Category.css
                ├── Category.jsx
            └── 📁ChangPassWord
                ├── ChangPassWord.css
                ├── ChangPassWord.jsx
            └── 📁Customer
                ├── Customer.css
                ├── Customer.jsx
            └── 📁Dashboard
                ├── Dashboard.css
                ├── Dashboard.jsx
            └── 📁DeadStock
                ├── Deadstock.css
                ├── Deadstock.jsx
            └── 📁DropDown
                ├── DropDown.css
                ├── DropDown.jsx
            └── 📁Employee
                ├── Employee.css
                ├── Employee.jsx
            └── 📁Forecast
                ├── Forecast.css
                ├── Forecast.jsx
            └── 📁Hooks
                ├── useCustomer.js
                ├── useFetchpPromotion.js
            └── 📁InfoEmployee
                ├── InfoEmployee.css
                ├── InfoEmployee.jsx
            └── 📁Inventory
                ├── Inventory.css
                ├── Inventory.jsx
            └── 📁Navbar
                ├── Navbar.css
                ├── Navbar.jsx
            └── 📁Notification
                ├── Notification.css
                ├── Notification.jsx
            └── 📁Order
                ├── Order.css
                ├── Order.jsx
                ├── printInvoice.js
            └── 📁Overview
                ├── Overview.css
                ├── Overview.jsx
            └── 📁ProductManage
                ├── ProductManage.css
                ├── ProductManage.jsx
            └── 📁Promotion
                ├── Promotion.css
                ├── Promotion.jsx
            └── 📁Purchase
                ├── Purchase.css
                ├── Purchase.jsx
            └── 📁SaleReport
                ├── SaleReport.css
                ├── SaleReport.jsx
            └── 📁Sidebar
                ├── Sidebar.css
                ├── Sidebar.jsx
            └── 📁Supplier
                ├── Supplier.css
                ├── Supplier.jsx
        └── 📁context
            ├── AuthContext.jsx
        └── 📁pages
            └── 📁Home
                ├── Home.css
                ├── Home.jsx
            └── 📁Login
                ├── Login.css
                ├── Login.jsx
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── vite.config.js
```

### 🛠️ Cài đặt và chạy dự án

#### 1️⃣ Clone dự án

```bash
git clone https://github.com/your-username/caitiemtaphoa.git
hoặc tải file zip về giải nén
```

#### 2️⃣ Chạy dự án

```bash
cd caitiemtaphoa
npm install
npm run dev
```

#### 3️⃣ Truy cập tại

```bash
open "http://localhost:5174/"
```
