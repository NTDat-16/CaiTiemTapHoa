import  './Sidebar.css'
import { FiUsers, FiFileText, FiTrendingUp, FiPackage, FiUser, FiGift, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({onTag}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const HandleLogOut = async () => {
    logout();
    navigate('/login');
  }

  function handleTag(frame) {
    onTag(frame);
  }

  return (
    <div className="sidebar">
      <div className='SidebarWrapper'>
          <ul className="SidebarList">
              <li className="SidebarItem" data-label="Hóa đơn"><FiFileText /></li>
              <li className="SidebarItem" data-label="Sản phẩm"><FiPackage /></li>
              <li className="SidebarItem" data-label='Nhân viên' onClick={()=> {handleTag("employee")}}><FiUser /></li>
              <li className="SidebarItem" data-label='Khách hàng' onClick={()=> {handleTag("customer")}}><FiUsers /></li>
              <li className="SidebarItem" data-label='Mã giảm giá'><FiGift /></li>
              <li className="SidebarItem" data-label='Báo cáo'><FiTrendingUp /></li>
          </ul>

          <div className="SidebarLogout" data-label="Đăng xuất" onClick={HandleLogOut}>
            <FiLogOut style={{rotate:"180deg"}}/>
          </div>
      </div>
    </div>
  )
}
