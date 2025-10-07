import  './Sidebar.css'
import { FiUsers, FiFileText, FiTrendingUp, FiPackage, FiUser, FiGift} from 'react-icons/fi'

export default function Sidebar() {
  return (
    <div className='SidebarWrapper'>
        <ul className="SidebarList">
            <li className="SidebarItem"><FiFileText /></li>
            <li className="SidebarItem"><FiPackage /></li>
            <li className="SidebarItem"><FiUser /></li>
            <li className="SidebarItem"><FiUsers /></li>
            <li className="SidebarItem"><FiGift /></li>
            <li className="SidebarItem"><FiTrendingUp /></li>
        </ul>
    </div>
  )
}
