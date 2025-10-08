import { useState, useEffect } from 'react';
import './Navbar.css'
import DropDown from '../DropDown/DropDown';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState('');
    // const [openDropDown, setOpenDropDown] = useState(false);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            // Ngày trong tuần
            const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            const dayOfWeek = days[now.getDay()];

            // Ngày, tháng, năm
            const day = now.getDate();
            const month = now.getMonth() + 1; // Tháng từ 0-11
            const year = now.getFullYear();

            // Giờ, phút, giây
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');

            setCurrentTime(`${dayOfWeek}, ${day} tháng ${month} năm ${year} ${hours}:${minutes}:${seconds}`);
        };

        updateDateTime(); // cập nhật ngay khi load
        const interval = setInterval(updateDateTime, 1000); // update mỗi giây

        return () => clearInterval(interval);
    }, []);

    // function handleDropDown() {
    //     setOpenDropDown(!openDropDown);
    // }

    return (
        <>
            <div className="NavbarWrapper">
                {/* Logo */}
                <div className="NavbarLogo">
                    <span className="LogoText">CaiTiemTapHoa</span>
                </div>

                {/* Time / Status */}
                <div className="NavbarTime">
                    {currentTime}
                </div>

                {/* User Avatar */}
                <div className="NavbarUser">
                    <span>{user?.fullName}</span>
                    <img 
                        className='UserAvatar'
                        src="./img/AvtUser.png" 
                        alt=""
                        // onClick={handleDropDown}
                    />
                </div>
                
            </div>
            {/* {openDropDown && <DropDown />} */}
        </>
    )
}