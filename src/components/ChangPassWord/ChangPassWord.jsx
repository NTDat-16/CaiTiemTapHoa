import './ChangPassWord.css'
import { useState } from 'react';

export default function ChangPassWord({OpenPass}) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!oldPass) newErrors.oldPass = 'Vui lòng nhập mật khẩu cũ';
        if (!newPass) newErrors.newPass = 'Vui lòng nhập mật khẩu mới';
        else if (newPass.length < 6) newErrors.newPass = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        if (confirmPass !== newPass) newErrors.confirmPass = 'Mật khẩu xác nhận không khớp';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
        alert('Đổi mật khẩu thành công!');
        // Gọi API đổi mật khẩu ở đây
        }
    };

    return (
        <div className="ChangPassWord">
        <div className="ChangPassWordBox">
            <div className="ChangPassWordBoxTop">
            <span className="Title">Đổi mật khẩu</span>
            <span className="Icon" onClick={OpenPass}>×</span>
            </div>

            <div className="ChangPassWordBoxCenter">
            <label>Mật khẩu cũ</label>
            <input
                type="password"
                className={errors.oldPass ? 'input-error' : ''}
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
            />
            {errors.oldPass && <div className="error-text">{errors.oldPass}</div>}

            <label>Mật khẩu mới</label>
            <input
                type="password"
                className={errors.newPass ? 'input-error' : ''}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
            />
            {errors.newPass && <div className="error-text">{errors.newPass}</div>}

            <label>Xác nhận mật khẩu mới</label>
            <input
                type="password"
                className={errors.confirmPass ? 'input-error' : ''}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
            />
            {errors.confirmPass && <div className="error-text">{errors.confirmPass}</div>}
            </div>

            <div className="ChangPassWordBoxBottom">
            <button className="btnCancle" onClick={OpenPass}>Hủy</button>
            <button className="btnSave" onClick={handleSave}>Lưu</button>
            </div>
        </div>
        </div>
    );
}