import { useEffect, useRef } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';
import './DropDown.css'

export default function DropDown({ CancleDrop, OpenPass, OpenInfo }) {
    const dropdownRef = useRef(null);
     // Ẩn dropdown nếu click ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                CancleDrop();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [CancleDrop]);

    return (
        <div className='DropDownWrapper' ref={dropdownRef}>
            <ul className="DropDownList">
                <li className="DropDownItem" onClick={OpenInfo}> 
                    <FiUser size={18}/> Thông tin cá nhân
                </li>
                <li className="DropDownItem" onClick={OpenPass}> 
                    <FiLock size={18}/> Đổi mật khẩu
                </li>
            </ul>
        </div>
    );
}