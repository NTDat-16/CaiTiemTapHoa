import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import UserManage from '../../components/UserManage/UserManage';
import Order from '../../components/Order/Order';
import CustomerManage from '../../components/CustomerManage/CustomerManage';
import Promotion from '../../components/Promotion/Promotion';
import './Home.css';

export default function Home() {
  const [choosen, setChoosen] = useState('employee');

  function handleChoosen(frame) {
    setChoosen(frame); 
    console.log('Đã chọn:', frame);
  }

  return (
    <div className="home-container">
      <Navbar />
      <div className="HomeWrapper">
        {/* Sidebar cố định bên trái */}
        <Sidebar onTag={handleChoosen} choosen={choosen} />

        {/* Khu vực nội dung chính thay đổi */}
        <div className="HomeContent">
          {choosen === 'employee' && <UserManage />}
          {choosen === 'customer' && <CustomerManage />}
          {choosen === 'order' && <Order />}
          {choosen === 'promotion' && <Promotion />}
          {choosen === 'report' && (
            <p style={{ textAlign: 'center', marginTop: '100px' }}>Trang Báo cáo</p>
          )}
        </div>
      </div>
    </div>
  );
}
