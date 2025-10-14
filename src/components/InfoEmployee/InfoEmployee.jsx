import { useAuth } from '../../context/AuthContext';
import './InfoEmployee.css';
import { FiX } from 'react-icons/fi';

export default function InfoEmployee({ OpenInfo }) {
  const { user } = useAuth();
  return (
    <div className="EmployeeProfileOverlay">
      <div className="EmployeeProfile">
        {/* Header */}
        <div className="ProfileHeader">
          <img src="./img/AvtUser.png" alt="" className="ProfileAvatar" />
          <div className="ProfileInfo">
            <h2>{user.user?.fullName}</h2>
            <p>{user.user?.role === "Admin" ? "Quản trị viên" : "Nhân viên"}</p>
          </div>
          <FiX
            size={30}
            onClick={OpenInfo}
            className='CloseButton'
          />
        </div>

        {/* Liên hệ */}
        <div className="ProfileContact">
          <h3>Thông tin liên hệ</h3>
          <div className="ContactRow"><span>Họ tên:</span>{user.user?.fullName}</div>
          <div className="ContactRow"><span>Chức vụ:</span>{user.user?.role === "Admin" ? "Quản trị viên" : "Nhân viên"} </div>
          <div className="ContactRow"><span>Ngày tạo:</span>2025-10-01</div>
        </div>

        {/* Cập nhật */}
        {/* <div className="ProfileUpdate">
          <h3>Cập nhật thông tin</h3>
          <div className="FormRow">
            <label>Email</label>
            <input type="email" placeholder="Nhập email mới..." />
          </div>
          <div className="FormRow">
            <label>Số điện thoại</label>
            <input type="text" placeholder="Nhập số điện thoại mới..." />
          </div>
          <div className="ProfileActions">
            <button className="btnCancel" onClick={OpenInfo}>Hủy</button>
            <button className="btnSave">Lưu thay đổi</button>
          </div>
        </div> */}
      </div>
    </div>
  );
}