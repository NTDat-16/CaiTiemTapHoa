import { useAuth } from '../../context/AuthContext';
import './DropDown.css'
import { FiLock, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'

export default function DropDown() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const HandleLogOut = async () => {
        logout();
        navigate('/login');
    }

    return (
        <div className='DropDownWrapper'>
            <ul className="DropDownList">
                <li className="DropDownItem" > <FiLock size={18}/>Đổi mật khẩu</li>
                <li className="DropDownItem" onClick={HandleLogOut}> <FiLogOut size={18}/>Đăng xuất</li>
            </ul>
        </div>
    )
}
