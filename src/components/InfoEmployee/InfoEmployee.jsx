import './InfoEmployee.css';
import { FiX } from 'react-icons/fi';

export default function InfoEmployee({ OpenInfo }) {
  return (
    <div className="EmployeeProfileOverlay">
      <div className="EmployeeProfile">
        {/* Header */}
        <div className="ProfileHeader">
          <img src="./img/AvtUser.png" alt="" className="ProfileAvatar" />
          <div className="ProfileInfo">
            <h2>Nguyễn Văn A</h2>
            <p>Nhân viên bán hàng</p>
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
          <div className="ContactRow"><span>Họ tên:</span> nguyễn văn a</div>
          <div className="ContactRow"><span>Chức vụ:</span> bán hàng</div>
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