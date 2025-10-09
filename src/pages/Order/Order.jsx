import React from "react";
import "./Order.css";

export default function Order() {
  return (
    <div className="order-page">
   
      <header className="order-header">
        <h1>Bán Hàng</h1>
        <input type="text" placeholder="Tìm kiếm sản phẩm..." />
      </header>

  
      <main className="order-main">
    
        <aside className="order-left">
          <div>
            <div className="input-group">
              <label>Chọn nhân viên:</label>
              <input type="text" placeholder="Nhập tên nhân viên" />
            </div>

            <div className="input-group">
              <label>Khách hàng:</label>
              <input type="text" placeholder="Tên khách hàng" />
            </div>

            <div className="product-list">
              <h2>Danh sách sản phẩm đã chọn</h2>
              <div className="product-box">
                <p>(Chưa có sản phẩm nào)</p>
              </div>
            </div>
          </div>

    
          <div className="payment-section">
            <p className="payment-title">Cách thức thanh toán</p>
            <select>
              <option>Tiền mặt</option>
              <option>Chuyển khoản</option>
              <option>Thẻ</option>
            </select>
            <button>Thanh toán</button>
          </div>
        </aside>

 
        <section className="order-right">
          <div className="product-header">
            <h2>Loại sản phẩm</h2>
            <select>
              <option>Tất cả</option>
              <option>Đồ uống</option>
              <option>Bánh kẹo</option>
              <option>Hàng tiêu dùng</option>
            </select>
          </div>

   
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="product-item">
                SP {item}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button>Phân trang</button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="order-footer"></footer>
    </div>
  );
}
