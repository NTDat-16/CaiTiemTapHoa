import "./Sidebar.css";
import {
  FiTruck,
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiPackage,
  FiUser,
  FiGift,
  FiLogOut,
  FiGrid,
  FiBox,
  FiPlusSquare,
  FiEdit,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ onTag, choosen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || user?.user?.role;

  const HandleLogOut = async () => {
    logout();
    navigate("/login");
  };

  function handleTag(frame) {
    onTag(frame);
  }

  return (
    <div className="sidebar">
      <div className="SidebarWrapper">
        <ul className="SidebarList">
          {role === "Admin" && (
            <>
              {/* Hóa đơn */}
              <li
                className={`SidebarItem ${choosen === "order" ? "active" : ""}`}
                data-label="Hóa đơn"
                onClick={() => onTag("order")}
              >
                <FiFileText />
              </li>

              {/* Quản lý danh mục */}

              <li
                className={`SidebarItem ${
                  choosen === "category" ? "active" : ""
                }`}
                data-label="Danh mục"
                onClick={() => onTag("category")}
              >
                <FiGrid />
              </li>

              {/* Quản lý nhà cung cấp */}
              <li
                className={`SidebarItem ${
                  choosen === "supplier" ? "active" : ""
                }`}
                data-label="Nhà cung cấp"
                onClick={() => onTag("supplier")}
              >
                <FiTruck />
              </li>

              {/* Quản lý sản phẩm */}
              <li
                className={`SidebarItem ${
                  choosen === "product" ? "active" : ""
                }`}
                data-label="Sản phẩm"
                onClick={() => onTag("product")}
              >
                <FiPackage />
              </li>

              {/* Quản lý nhân viên */}
              <li
                className={`SidebarItem ${
                  choosen === "employee" ? "active" : ""
                }`}
                data-label="Nhân viên"
                onClick={() => onTag("employee")}
              >
                <FiUser />
              </li>

              {/* Quản lý khách hàng */}
              <li
                className={`SidebarItem ${
                  choosen === "customer" ? "active" : ""
                }`}
                data-label="Khách hàng"
                onClick={() => onTag("customer")}
              >
                <FiUsers />
              </li>

              {/* Quản lý kho */}
              <li
                className={`SidebarItem ${
                  choosen === "inventory" ? "active" : ""
                }`}
                data-label="Tồn kho"
                onClick={() => onTag("inventory")}
              >
                <FiBox />
              </li>

              {/* Nhập hàng */}
              <li
                className={`SidebarItem ${
                  choosen === "purchase" ? "active" : ""
                }`}
                data-label="Nhập hàng"
                onClick={() => onTag("purchase")}
              >
                <FiPlusSquare />
              </li>

              {/* Điều chỉnh kho */}
              <li
                className={`SidebarItem ${
                  choosen === "adjustment" ? "active" : ""
                }`}
                data-label="Điều chỉnh kho"
                onClick={() => onTag("adjustment")}
              >
                <FiEdit />
              </li>

              {/* Khuyến mãi */}
              <li
                className={`SidebarItem ${
                  choosen === "promotion" ? "active" : ""
                }`}
                data-label="Khuyến mãi"
                onClick={() => onTag("promotion")}
              >
                <FiGift />
              </li>

              {/* Thống kê */}
              <li
                className={`SidebarItem ${
                  choosen === "report" ? "active" : ""
                }`}
                data-label="Báo cáo"
                onClick={() => onTag("report")}
                onMouseEnter={() => setShowReportMenu(true)}
                onMouseLeave={() => setShowReportMenu(false)}
              >
                <FiTrendingUp />
              </li>
            </>
          )}

          {role === "Staff" && (
            <>
              {/* Hóa đơn */}
              <li
                className={`SidebarItem ${choosen === "order" ? "active" : ""}`}
                data-label="Hóa đơn"
                onClick={() => onTag("order")}
              >
                <FiFileText />
              </li>

              {/* Thống kê */}
              <li
                className={`SidebarItem ${
                  choosen === "report" ? "active" : ""
                }`}
                data-label="Báo cáo"
                onClick={() => onTag("report")}
                onMouseEnter={() => setShowReportMenu(true)}
                onMouseLeave={() => setShowReportMenu(false)}
              >
                <FiTrendingUp />
              </li>
            </>
          )}
        </ul>

        <div
          className="SidebarLogout"
          data-label="Đăng xuất"
          onClick={HandleLogOut}
        >
          <FiLogOut style={{ rotate: "180deg" }} />
        </div>
      </div>
    </div>
  );
}
