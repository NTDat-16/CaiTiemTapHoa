import React, { useState } from 'react';
import './UserManage.css';
import { FaSearch, FaUsers } from 'react-icons/fa';

export default function UserManage() {
  const [users, setUsers] = useState([
    { user_id: 1, username: "admin01", full_name: "Nguyễn Văn A", role: "admin", created_at: "2025-10-01" },
    { user_id: 1, username: "admin01", full_name: "Nguyễn Văn A", role: "admin", created_at: "2025-10-01" },
    { user_id: 2, username: "staff01", full_name: "Trần Thị B", role: "staff", created_at: "2025-10-02" },
    { user_id: 3, username: "staff02", full_name: "Lê Văn C", role: "staff", created_at: "2025-10-03" },
    { user_id: 4, username: "admin02", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    full_name: "",
    role: "",
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddClick = () => setShowAddForm(true);

  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewUser({ username: "", full_name: "", role: "" });
  };

  const handleSaveUser = () => {
    if (!newUser.full_name || !newUser.username || !newUser.role) {
      alert("⚠️ Vui lòng nhập đầy đủ tên đăng nhập, họ tên và chức vụ!");
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.user_id)) + 1 : 1;
    const today = new Date().toISOString().split("T")[0];

    const userToAdd = {
      user_id: newId,
      ...newUser,
      created_at: today,
    };

    setUsers([...users, userToAdd]);
    handleCloseForm();
  };

  const handleEdit = (id) => {
    const user = users.find(u => u.user_id === id);
    setEditingUser(user);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingUser(null);
  };

  const handleUpdateUser = () => {
    if (!editingUser.full_name || !editingUser.username || !editingUser.role) {
      alert("⚠️ Vui lòng nhập đầy đủ tên đăng nhập, họ tên và chức vụ!");
      return;
    }

    setUsers(users.map(u =>
      u.user_id === editingUser.user_id ? editingUser : u
    ));
    handleCloseEditForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
      setUsers(users.filter(u => u.user_id !== id));
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = ["admin", "staff"];

  return (
    <div className="UserManage">
      <div className="UserManageWrapper">
        <div className="UserTop">
          <h2 className="UserTitle">
            <FaUsers /> Quản lý nhân viên
          </h2>
          <div className="UserSearchBar">
            <div className="SearchInputWrapper">
              <FaSearch className="searchIcon" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="addUserBtn" onClick={handleAddClick}>
              + Thêm nhân viên
            </button>
          </div>
        </div>

        <div className="UserBottom">
          <div className="UserTableContainer">
            <div className="UserTableWrapper">
              <table className="UserTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên đăng nhập</th>
                    <th>Họ và tên</th>
                    <th>Chức vụ</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_id}</td>
                      <td>{u.username}</td>
                      <td>{u.full_name}</td>
                      <td>{u.role === "admin" ? "Quản trị viên" : "Nhân viên"}</td>
                      <td>{u.created_at}</td>
                      <td className="UserActions">
                        <button className="editBtn" onClick={() => handleEdit(u.user_id)}>✏️ Sửa</button>
                        <button className="deleteBtn" onClick={() => handleDelete(u.user_id)}>🗑️ Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="UserFooter">
              <span>Tổng {filteredUsers.length} nhân viên</span>
              <div className="pagination">
                <button disabled>{"<"}</button>
                <span>1</span>
                <button disabled>{">"}</button>
                <select>
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="AddUserOverlay">
            <div className="AddUserForm">
              <div className="formHeader">
                <h3>THÊM NHÂN VIÊN MỚI</h3>
              </div>
              <div className="formSection">
                <div className="sectionTitle">
                  <FaUsers className="icon" /> <span>THÔNG TIN NHÂN VIÊN</span>
                </div>
                <div className="formGroup">
                  <label><span className="required">*</span> Tên đăng nhập</label>
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="formGroup">
                  <label><span className="required">*</span> Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  />
                </div>
                <div className="formGroup">
                  <label><span className="required">*</span> Chức vụ</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="">-- Chọn chức vụ --</option>
                    {roles.map((r, i) => (
                      <option key={i} value={r}>{r === "admin" ? "Quản trị viên" : "Nhân viên"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="formActions">
                <button className="cancelBtn" onClick={handleCloseForm}>❌ Hủy</button>
                <button className="saveBtn" onClick={handleSaveUser}>💾 Lưu</button>
              </div>
            </div>
          </div>
        )}

        {showEditForm && editingUser && (
          <div className="AddUserOverlay">
            <div className="AddUserForm">
              <div className="formHeader">
                <h3>SỬA NHÂN VIÊN</h3>
              </div>
              <div className="formSection">
                <div className="sectionTitle">
                  <FaUsers className="icon" /> <span>THÔNG TIN NHÂN VIÊN</span>
                </div>
                <div className="formGroup">
                  <label><span className="required">*</span> Tên đăng nhập</label>
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                </div>
                <div className="formGroup">
                  <label><span className="required">*</span> Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={editingUser.full_name}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  />
                </div>
                <div className="formGroup">
                  <label><span className="required">*</span> Chức vụ</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="">-- Chọn chức vụ --</option>
                    {roles.map((r, i) => (
                      <option key={i} value={r}>{r === "admin" ? "Quản trị viên" : "Nhân viên"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="formActions">
                <button className="cancelBtn" onClick={handleCloseEditForm}>❌ Hủy</button>
                <button className="saveBtn" onClick={handleUpdateUser}>💾 Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}