import { useState, useEffect } from 'react';
import './Navbar.css';
import DropDown from '../DropDown/DropDown';
import ChangPassWord from '../ChangPassWord/ChangPassWord';
import { useAuth } from '../../context/AuthContext';
import InfoEmplyee from '../InfoEmployee/InfoEmployee';

export default function Navbar() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenPass, setIsOpenPass] = useState(false);
    const [isOpenInfo, setIsOpenInfo] = useState(false);

    useEffect(() => {
        const updateDateTime = () => {
        const now = new Date();
        const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayOfWeek = days[now.getDay()];
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        setCurrentTime(`${dayOfWeek}, ${day} tháng ${month} năm ${year} ${hours}:${minutes}:${seconds}`);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    function HandleDropDown() {
        setIsOpen(!isOpen);
    }

    function OpenPass() {
        setIsOpenPass(!isOpenPass);
        setIsOpen(false); // đóng dropdown khi mở đổi mật khẩu
    }

    function OpenInfo() {
        setIsOpenInfo(!isOpenInfo);
        setIsOpen(false); // đóng dropdown khi mở đổi mật khẩu
    }

    return (
        <>
            <div className="NavbarWrapper">
                <div className="NavbarLogo">
                <span className="LogoText">CaiTiemTapHoa</span>
                </div>

                <div className="NavbarTime">
                {currentTime}
                </div>

                <div className="NavbarUser" onClick={HandleDropDown}>
                <span>{user.user?.fullName || user.fullName}</span>
                <img
                    className='UserAvatar'
                    src="./img/AvtUser.png"
                    alt=""
                />
                </div>
            </div>

            {isOpen && <DropDown CancleDrop={HandleDropDown} OpenPass={OpenPass} OpenInfo={OpenInfo}/>}
            {isOpenPass && <ChangPassWord OpenPass={OpenPass} />}
            {isOpenInfo && <InfoEmplyee OpenInfo={OpenInfo} />}
        </>
    );
}