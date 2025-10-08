import  './Sidebar.css'
<<<<<<< HEAD
import { FiUsers, FiFileText, FiTrendingUp, FiPackage, FiUser, FiGift} from 'react-icons/fi'
import { Link } from 'react-router-dom';
import Order from "../../pages/Order/Order";
=======
import { FiUsers, FiFileText, FiTrendingUp, FiPackage, FiUser, FiGift, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({onTag, choosen}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const HandleLogOut = async () => {
    logout();
    navigate('/login');
  }

  function handleTag(frame) {
 
      onTag(frame)
    
  }


>>>>>>> origin/main

  return (
    <div className="sidebar">
      <div className="SidebarWrapper">
        <ul className="SidebarList">
<<<<<<< HEAD
            <li className="SidebarItem"><Link to='/order' className="SidebarLink">
            <FiFileText/></Link></li>
            <li className="SidebarItem"><Link to='/promotion' className="SidebarLink">
            <FiFileText/></Link></li>
            <li className="SidebarItem"><FiUser /></li>
            <li className="SidebarItem"><FiUsers /></li>
            <li className="SidebarItem"><FiGift /></li>
            <li className="SidebarItem"><FiTrendingUp /></li>
=======
          <li
            className={`SidebarItem ${choosen === 'order' ? 'active' : ''}`}
            data-label="Hóa đơn"
            onClick={() => onTag('order')}
          >
            <FiFileText />
          </li>
          <li
            className={`SidebarItem ${choosen === 'product' ? 'active' : ''}`}
            data-label="Sản phẩm"
            onClick={() => onTag('product')}
          >
            <FiPackage />
          </li>
          <li
            className={`SidebarItem ${choosen === 'employee' ? 'active' : ''}`}
            data-label="Nhân viên"
            onClick={() => onTag('employee')}
          >
            <FiUser />
          </li>
          <li
            className={`SidebarItem ${choosen === 'customer' ? 'active' : ''}`}
            data-label="Khách hàng"
            onClick={() => onTag('customer')}
          >
            <FiUsers />
          </li>
          <li
            className={`SidebarItem ${choosen === 'promotion' ? 'active' : ''}`}
            data-label="Mã giảm giá"
            onClick={() => onTag('promotion')}
          >
            <FiGift />
          </li>
          <li
            className={`SidebarItem ${choosen === 'report' ? 'active' : ''}`}
            data-label="Báo cáo"
            onClick={() => onTag('report')}
          >
            <FiTrendingUp />
          </li>
>>>>>>> origin/main
        </ul>

        <div className="SidebarLogout" data-label="Đăng xuất" onClick={HandleLogOut}>
          <FiLogOut style={{ rotate: '180deg' }} />
        </div>
      </div>
    </div>
  )
}
