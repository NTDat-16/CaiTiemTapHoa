import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ChangPassWord.css'
import { useState } from 'react';

export default function ChangPassWord({OpenPass}) {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errors, setErrors] = useState({});
    const { user, logout } = useAuth();
    const nagavite = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!oldPass) newErrors.oldPass = 'Vui lòng nhập mật khẩu cũ';
        if (!newPass) newErrors.newPass = 'Vui lòng nhập mật khẩu mới';
        else if (newPass.length < 6) newErrors.newPass = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        if (confirmPass !== newPass) newErrors.confirmPass = 'Mật khẩu xác nhận không khớp';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/Users/${user.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: oldPass,
                    newPassword: newPass
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Đổi mật khẩu thất bại!');
                return;
            }

            alert('Đổi mật khẩu thành công!');
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
            OpenPass();
            logout();
            nagavite('/login');
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            alert('Không thể kết nối tới server!');
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