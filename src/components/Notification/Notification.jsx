// components/Notification.jsx
import React, { useState, useEffect } from "react";
import "./Notification.css";

const Notification = ({ productNames, onClose, onNavigate }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!productNames.length) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 600);
    }, 8000);

    return () => clearTimeout(timer);
  }, [productNames.length, onClose]);

  if (!productNames.length) return null;

  return (
    <div
      className={`low-stock-notification ${isClosing ? "closing" : ""}`}
      onClick={() => onNavigate?.("inventory")}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
    >
      {/* Viền progress chạy tròn */}
      <div className="progress-ring"></div>

      <div className="notification-glass">
        <header className="notification-header">
          <div className="notification-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="notification-content">
            <h3 className="notification-title">Cảnh báo tồn kho</h3>
            <p className="notification-subtitle">
              {productNames.length} sản phẩm sắp hết hàng
            </p>
          </div>

          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              setIsClosing(true);
              setTimeout(onClose, 600);
            }}
            aria-label="Đóng thông báo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* BODY: Scroll khi dài, màu đỏ nổi bật */}
        <div className="notification-body">
          {productNames.map((name, i) => (
            <div
              key={i}
              className="notification-item"
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <span className="bullet"></span>
              <span className="item-name">{name}</span>
            </div>
          ))}
        </div>

        <footer className="notification-footer">
          <div className="footer-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="footer-text">Click để xem chi tiết</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Notification;