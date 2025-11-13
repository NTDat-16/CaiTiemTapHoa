import { useEffect, useRef } from "react";
import { FiLock, FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./DropDown.css";
import { useAuth } from "../../context/AuthContext";
export default function DropDown({ CancleDrop, OpenPass, OpenInfo }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Ẩn dropdown nếu click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        CancleDrop();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [CancleDrop]);
  const HandleLogOut = async () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="DropDownWrapper" ref={dropdownRef}>
      <ul className="DropDownList">
        <li className="DropDownItem" onClick={OpenInfo}>
          <FiUser size={18} /> Thông tin cá nhân
        </li>
        <li className="DropDownItem" onClick={OpenPass}>
          <FiLock size={18} /> Đổi mật khẩu
        </li>

        <li className="DropDownItem" onClick={HandleLogOut}>
          <FiLogOut size={18} /> Đăng xuất
        </li>
      </ul>
    </div>
  );
}
