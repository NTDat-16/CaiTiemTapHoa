import { useState, useEffect } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassWord] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "CaiTiemTapHoa - Đăng nhập";

        // Nếu muốn khi rời trang reset lại tiêu đề mặc định
        return () => {
            document.title = "CaiTiemTapHoa"; 
        }
    }, []);

    /*Xử lý login*/
    const handleLogin = async () => {
        if (!userName || !password ){
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        
        const result = await login(userName, password);
        if (result.success){
            setError('');
            navigate('/');
        }
        else{
            setError(result.message);
        }  
    }

    return (
        <div className="login">
            <div className="loginWrapper">
                <div className="loginLeft">
                    <h3 className="loginLogo">Cái tiệm tạp hóa</h3>
                    <span className="loginDesc">Đi đâu chi xa — ra Cái Tiệm là có!</span>
                </div>
                <div className="loginRight">
                    <div className="loginBox">
                        <span className="titleLogin">
                            Đăng Nhập
                        </span>
                        {/*Input lấy dữ liêu*/}
                        <input 
                            placeholder="Tên đăng nhập" 
                            className="loginInput"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value) }
                        />
                        <input 
                            placeholder="Mật khẩu"
                            type='password'
                            className="loginInput"
                            value={password}
                            onChange={(e) => setPassWord(e.target.value) }
                        />

                        {/*Nơi hiển thị lỗi*/}
                        {error &&
                            <span className="errorForm">{error}</span>
                        }

                        {/*Nút đăng nhập*/}
                        <button 
                            className="loginButton" 
                            onClick={handleLogin}
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}