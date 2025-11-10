import React, { useState, useEffect } from "react";
import "./PriceErrorNotification.css";

const PriceErrorNotification = ({ invalidItems, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!invalidItems.length) return;

    // Reset trạng thái closing khi có items mới
    setIsClosing(false);

    // Tự động đóng sau 3 giây
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [invalidItems]);

  if (!invalidItems.length) return null;

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  return (
    <div
      className={`price-error-notification ${isClosing ? "closing" : ""}`}
      role="alert"
      aria-live="assertive"
    >
        {/* Viền đỏ đơn giản */}
        <div className="progress-ring-error"></div>

        <div className="notification-glass-error">
        <header className="notification-header-error">
          <div className="notification-icon-error">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="notification-content-error">
            <h3 className="notification-title-error">⚠️ Lỗi giá nhập hàng</h3>
            <p className="notification-subtitle-error">
              {invalidItems.length} sản phẩm có giá nhập cao hơn giá bán
            </p>
          </div>

          <button
            className="notification-close-error"
            onClick={handleClose}
            aria-label="Đóng thông báo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* BODY: Scroll khi dài */}
        <div className="notification-body-error">
          {invalidItems.map((item, i) => (
            <div
              key={i}
              className="notification-item-error"
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <div className="item-header-error">
                <span className="bullet-error"></span>
                <span className="item-name-error">{item.productName}</span>
              </div>
              <div className="item-details-error">
                <div className="price-row-error">
                  <span className="price-label-error">Giá bán:</span>
                  <span className="price-value-error sale-price">
                    {item.salePrice?.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="price-row-error">
                  <span className="price-label-error">Giá nhập:</span>
                  <span className="price-value-error purchase-price">
                    {item.purchasePrice?.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceErrorNotification;
