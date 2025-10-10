import { useState } from 'react';
import './DropDown.css'
import { FiLock, FiLogOut } from 'react-icons/fi';

export default function DropDown({ CancleDrop, OpenPass, OpenInfo }) {
    return (
        <>
            <div className='DropDownWrapper'>
                <ul className="DropDownList">
                    <li className="DropDownItem" 
                        onClick={OpenPass}
                    > 
                        <FiLock size={18}/>Đổi mật khẩu
                    </li>
                    <li className="DropDownItem"
                        onClick={OpenInfo} 
                    > 
                        <FiLogOut size={18}/>Thông tin cá nhân
                    </li>
                </ul>
            </div>
        </>
    )
}