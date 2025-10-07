import  './Sidebar.css'
import { FiUsers, FiFileText, FiTrendingUp, FiPackage, FiUser, FiGift} from 'react-icons/fi'
import { Link } from 'react-router-dom';
import Order from "../../pages/Order/Order";

export default function Sidebar() {
  return (
    <div className='SidebarWrapper'>
        <ul className="SidebarList">
            <li className="SidebarItem"><Link to='/order' className="SidebarLink">
            <FiFileText/></Link></li>
            <li className="SidebarItem"><FiPackage /></li>
            <li className="SidebarItem"><FiUser /></li>
            <li className="SidebarItem"><FiUsers /></li>
            <li className="SidebarItem"><FiGift /></li>
            <li className="SidebarItem"><FiTrendingUp /></li>
        </ul>
    </div>
  )
}
