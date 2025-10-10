import  './Sidebar.css'
import { FiUsers, FiFileText, FiTrendingUp, FiPackage, FiUser, FiGift, FiLogOut, FiGrid, FiBox } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({onTag, choosen}) {
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
      <div className="SidebarWrapper">
        <ul className="SidebarList">
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
            className={`SidebarItem ${choosen === 'category' ? 'active' : ''}`}
            data-label="Loại sản phẩm"
            onClick={() => onTag('category')}
          >
            <FiGrid />
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
            className={`SidebarItem ${choosen === 'inventory' ? 'active' : ''}`}
            data-label="Tồn kho"
            onClick={() => onTag('inventory')}
          >
            <FiBox />
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
        </ul>

        <div className="SidebarLogout" data-label="Đăng xuất" onClick={HandleLogOut}>
          <FiLogOut style={{ rotate: '180deg' }} />
        </div>
      </div>
    </div>
  )
}
