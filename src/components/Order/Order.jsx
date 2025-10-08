import { useState, useEffect } from "react";
import "./Order.css";

export default function Order() {
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]); // ✅ Giỏ hàng
  const [search, setSearch] = useState("");

  // Danh sách sản phẩm mẫu
  const products = [
    {
      product_id: 1,
      category_id: 1,
      supplier_id: 1,
      product_name: "Nước suối Aquafina 500ml",
      barcode: "8938505970025",
      price: 5000,
      unit: "chai",
      created_at: "2025-10-08",
      type: "do-uong",
    },
    {
      product_id: 2,
      category_id: 2,
      supplier_id: 3,
      product_name: "Bánh mì sandwich",
      barcode: "8934567823912",
      price: 15000,
      unit: "ổ",
      created_at: "2025-10-07",
      type: "thuc-pham",
    },
    {
      product_id: 3,
      category_id: 1,
      supplier_id: 2,
      product_name: "Coca-Cola lon 330ml",
      barcode: "8934823912345",
      price: 10000,
      unit: "lon",
      created_at: "2025-10-06",
      type: "do-uong",
    },
  ];

  // Lọc sản phẩm theo loại và tìm kiếm
  const filteredProducts = products.filter((p) => {
    const matchCategory = category === "all" || p.type === category;
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ✅ Hàm thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        // Tăng số lượng nếu sản phẩm đã có
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Thêm sản phẩm mới
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // ✅ Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Hàm tăng / giảm số lượng
  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === id
            ? { ...item, quantity: Math.max(item.quantity + delta, 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ✅ Hàm xóa sản phẩm khỏi giỏ
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.product_id !== id));
  };

  return (
    <div className="order-page">
      <header className="order-header">
        <h1>Đặt hàng</h1>
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <main className="order-main">
        {/* Cột bên trái: Giỏ hàng */}
        <section className="order-left">
          <div>
            <div className="input-group">
              <label>Nhân viên </label>
              <input type="text" placeholder="Tên nhân viên" disabled />
            </div>

            <div className="input-group">
              <label>Số điện thoại</label>
              <input type="text" placeholder="Nhập số điện thoại" />
            </div>

            <div className="product-list">
              <h2>🛒 Giỏ hàng</h2>
              <div className="product-box">
                {cart.length === 0 ? (
                  <p>Chưa có sản phẩm</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.product_id} className="cart-item">
                      <div className="cart-info">
                        <strong>{item.product_name}</strong>
                        <p>
                          {item.price.toLocaleString()} ₫ × {item.quantity} ={" "}
                          <span className="text-yellow-400">
                            {(item.price * item.quantity).toLocaleString()} ₫
                          </span>
                        </p>
                      </div>
                      <div className="cart-actions">
                        <button onClick={() => updateQuantity(item.product_id, -1)}>-</button>
                        <button onClick={() => updateQuantity(item.product_id, +1)}>+</button>
                        <button onClick={() => removeFromCart(item.product_id)}>🗑</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="payment-section">
            <div className="payment-title">Phương thức thanh toán</div>
            <select>
              <option>Tiền mặt</option>
              <option>Chuyển khoản</option>
              <option>Thẻ</option>
            </select>

            <div className="total-price">
              <strong>Tổng cộng: </strong>
              <span className="text-yellow-400">
                {total.toLocaleString()} ₫
              </span>
            </div>

            <button className="confirm-btn">Xác nhận đơn hàng</button>
          </div>
        </section>

        {/* Cột bên phải: Danh sách sản phẩm */}
        <section className="order-right">
          <div className="product-header">
            <h2>Danh sách sản phẩm</h2>
          </div>

          <div className="type-product">
            <label>Loại sản phẩm: </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="do-uong">Đồ uống</option>
              <option value="thuc-pham">Thực phẩm</option>
              <option value="gia-dung">Gia dụng</option>
            </select>
          </div>

          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div
                key={p.product_id}
                className="product-item"
                onClick={() => handleAddToCart(p)} // ✅ Click để thêm vào giỏ
              >
                <div className="product-name">{p.product_name}</div>
                <div className="product-price">
                  {p.price.toLocaleString()} ₫ / {p.unit}
                </div>
                <div className="product-barcode">Mã: {p.barcode}</div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button>Trước</button>
            <button>Sau</button>
          </div>
        </section>
      </main>
    </div>
  );
}
