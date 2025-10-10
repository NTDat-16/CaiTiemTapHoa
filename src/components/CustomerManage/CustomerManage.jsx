import React, { useState, useEffect } from 'react';
import { FaSearch, FaUsers, FaUserFriends } from 'react-icons/fa';
import './CustomerManage.css';

export default function CustomerManage() {
  const [customers, setCustomers] = useState([
    {
      customer_id: 1,
      name: "Nguyễn Văn An",
      phone: "0901234567",
      email: "an.nguyen@example.com",
      province: "79", // TP.HCM
      ward: "27676", // Phường Bến Nghé
      house: "123 Nguyễn Trãi",
      created_at: "2025-10-01",
    },
    {
      customer_id: 2,
      name: "Nguyễn Văn Bình",
      phone: "0901234568",
      email: "binh.nguyen@example.com",
      province: "79",
      ward: "27688", // Phường 5
      house: "456 Lê Lợi",
      created_at: "2025-10-01",
    },
    {
      customer_id: 3,
      name: "Trần Thị Cẩm",
      phone: "0901234569",
      email: "cam.tran@example.com",
      province: "79",
      ward: "27700", // Phường 1 (Quận 5)
      house: "789 Trần Hưng Đạo",
      created_at: "2025-10-01",
    },
    {
      customer_id: 4,
      name: "Lê Văn Dũng",
      phone: "0901234570",
      email: "dung.le@example.com",
      province: "1", // Hà Nội
      ward: "31", // Phường Hàng Bạc
      house: "12 Hàng Bông",
      created_at: "2025-10-01",
    },
    {
      customer_id: 5,
      name: "Phạm Thị E",
      phone: "0901234571",
      email: "e.pham@example.com",
      province: "79",
      ward: "27712", // Phường Tân Phú
      house: "101 Nguyễn Thị Thập",
      created_at: "2025-10-01",
    },
    {
      customer_id: 6,
      name: "Hoàng Văn F",
      phone: "0901234572",
      email: "f.hoang@example.com",
      province: "1",
      ward: "46", // Phường Trúc Bạch
      house: "33 Thanh Niên",
      created_at: "2025-10-01",
    },
    {
      customer_id: 7,
      name: "Nguyễn Thị G",
      phone: "0901234573",
      email: "g.nguyen@example.com",
      province: "79",
      ward: "27724", // Phường 1 (Bình Thạnh)
      house: "45 Xô Viết Nghệ Tĩnh",
      created_at: "2025-10-01",
    },
    {
      customer_id: 8,
      name: "Trần Văn H",
      phone: "0901234574",
      email: "h.tran@example.com",
      province: "1",
      ward: "61", // Phường Ô Chợ Dừa
      house: "78 Tôn Đức Thắng",
      created_at: "2025-10-01",
    },
    {
      customer_id: 9,
      name: "Lê Thị I",
      phone: "0901234575",
      email: "i.le@example.com",
      province: "79",
      ward: "27736", // Phường 3 (Gò Vấp)
      house: "123 Nguyễn Văn Nghi",
      created_at: "2025-10-01",
    },
    {
      customer_id: 10,
      name: "Phạm Văn K",
      phone: "0901234576",
      email: "k.pham@example.com",
      province: "1",
      ward: "76", // Phường Bạch Đằng
      house: "56 Lò Đúc",
      created_at: "2025-10-01",
    },
    {
      customer_id: 11,
      name: "Nguyễn Văn L",
      phone: "0901234577",
      email: "l.nguyen@example.com",
      province: "79",
      ward: "27748", // Phường 2 (Phú Nhuận)
      house: "89 Phan Đình Phùng",
      created_at: "2025-10-01",
    },
    {
      customer_id: 12,
      name: "Trần Thị M",
      phone: "0901234578",
      email: "m.tran@example.com",
      province: "1",
      ward: "91", // Phường Dịch Vọng
      house: "34 Xuân Thủy",
      created_at: "2025-10-01",
    },
    {
      customer_id: 13,
      name: "Lê Văn N",
      phone: "0901234579",
      email: "n.le@example.com",
      province: "79",
      ward: "27760", // Phường 2 (Tân Bình)
      house: "67 Lý Thường Kiệt",
      created_at: "2025-10-01",
    },
    {
      customer_id: 14,
      name: "Phạm Thị O",
      phone: "0901234580",
      email: "o.pham@example.com",
      province: "1",
      ward: "106", // Phường Khương Mai
      house: "23 Lê Văn Lương",
      created_at: "2025-10-01",
    },
    {
      customer_id: 15,
      name: "Hoàng Văn P",
      phone: "0901234581",
      email: "p.hoang@example.com",
      province: "79",
      ward: "27772", // Phường Tân Quý
      house: "45 Lũy Bán Bích",
      created_at: "2025-10-01",
    },
    {
      customer_id: 16,
      name: "Trần Thị Bình",
      phone: "0919876543",
      email: "binh.tran@example.com",
      province: "1", // Hà Nội
      ward: "31", // Phường Hàng Bạc
      house: "45 Hai Bà Trưng",
      created_at: "2025-10-02",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    ward: "",
    house: "",
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================== API CALLS ====================
  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      alert("Lỗi khi tải danh sách tỉnh/thành phố: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async (provinceCode) => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Wards fetched for province:", provinceCode, data.wards);
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      alert("Lỗi khi tải danh sách phường/xã: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch wards when province changes
  useEffect(() => {
    if (newCustomer.province) {
      fetchWards(newCustomer.province);
      setNewCustomer(prev => ({ ...prev, ward: "" }));
    } else {
      setWards([]);
    }
  }, [newCustomer.province]);

  // Fetch wards for editing customer
  useEffect(() => {
    if (editingCustomer && editingCustomer.province) {
      fetchWards(editingCustomer.province);
    }
  }, [editingCustomer?.province]);

  // ==================== HANDLER FUNCTIONS ====================
  const handleAddClick = () => setShowAddForm(true);

  const handleCloseForm = () => {
    setShowAddForm(false);
    setNewCustomer({ name: "", phone: "", email: "", province: "", ward: "", house: "" });
    setWards([]);
  };

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.province || !newCustomer.ward) {
      alert("⚠️ Vui lòng nhập đầy đủ họ tên, số điện thoại, tỉnh/thành và phường/xã!");
      return;
    }

    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.customer_id)) + 1 : 1;
    const today = new Date().toISOString().split("T")[0];

    const customerToAdd = {
      customer_id: newId,
      ...newCustomer,
      created_at: today,
    };

    setCustomers([...customers, customerToAdd]);
    handleCloseForm();
  };

  const handleEdit = (id) => {
    const customer = customers.find(c => c.customer_id === id);
    setEditingCustomer(customer);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingCustomer(null);
    setWards([]);
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer.name || !editingCustomer.phone || !editingCustomer.province || !editingCustomer.ward) {
      alert("⚠️ Vui lòng nhập đầy đủ họ tên, số điện thoại, tỉnh/thành và phường/xã!");
      return;
    }

    setCustomers(customers.map(c =>
      c.customer_id === editingCustomer.customer_id ? editingCustomer : c
    ));
    handleCloseEditForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
      setCustomers(customers.filter(c => c.customer_id !== id));
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get name from code
  const getProvinceName = (code) => provinces.find(p => p.code.toString() === code)?.name || code;
  const getWardName = (code) => wards.find(w => w.code.toString() === code)?.name || code;

  // ==================== RENDER JSX ====================
  return (
    <div className="CustomerManage">
      <div className="CustomerManageWrapper">
        {/* ==== PHẦN TRÊN ==== */}
        <div className="CustomerTop">
          <h2 className="CustomerTitle">
            <FaUserFriends />
            Quản lý khách hàng
          </h2>

          <div className="CustomerSearchBar">
            <div className="SearchInputWrapper">
              <FaSearch className="searchIcon" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="addCustomerBtn" onClick={handleAddClick}>
              + Thêm khách hàng
            </button>
          </div>
        </div>

        {/* ==== PHẦN DƯỚI ==== */}
        <div className="CustomerBottom">
          <div className="CustomerTableContainer">
            <div className="CustomerTableWrapper">
              <table className="CustomerTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ và tên</th>
                    <th>Số điện thoại</th>
                    <th>Email</th>
                    <th>Địa chỉ</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.customer_id}>
                      <td>{c.customer_id}</td>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.email}</td>
                      <td>
                        {c.ward ? `${getWardName(c.ward)}, ` : ""}
                        {c.house ? `${c.house}, ` : ""}
                        {getProvinceName(c.province)}
                      </td>
                      <td>{c.created_at}</td>
                      <td className="CustomerActions">
                        <button className="editBtn" onClick={() => handleEdit(c.customer_id)}>✏️ Sửa</button>
                        <button className="deleteBtn" onClick={() => handleDelete(c.customer_id)}>🗑️ Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="CustomerFooter">
              <span>Tổng {filteredCustomers.length} khách hàng</span>
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

        {/* ==== FORM THÊM KHÁCH HÀNG ==== */}
        {showAddForm && (
          <div className="AddCustomerOverlay">
            <div className="AddCustomerForm">
              <div className="formHeader">
                <h3>THÊM KHÁCH HÀNG MỚI</h3>
              </div>

              <div className="formSection">
                <div className="sectionTitle">
                  <FaUsers className="icon" /> <span>THÔNG TIN KHÁCH HÀNG</span>
                </div>

                <div className="formGroup">
                  <label>Họ và tên<span className="required"> *</span></label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>

                <div className="formGroup">
                  <label>Số điện thoại<span className="required"> *</span></label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>

                <div className="formGroup">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>

                <div className="formGroup">
                  <label>Tỉnh/Thành phố<span className="required"> *</span></label>
                  <select
                    value={newCustomer.province}
                    onChange={(e) => setNewCustomer({ ...newCustomer, province: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                  {loading && <span className="loading"></span>}
                </div>

                <div className="formGroup">
                  <label>Phường/Xã<span className="required"> *</span></label>
                  <select
                    value={newCustomer.ward}
                    onChange={(e) => setNewCustomer({ ...newCustomer, ward: e.target.value })}
                    disabled={loading || !newCustomer.province}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                  {loading && <span className="loading"></span>}
                </div>

                <div className="formGroup">
                  <label>Số nhà / Đường</label>
                  <input
                    type="text"
                    placeholder="Nhập số nhà và tên đường"
                    value={newCustomer.house}
                    onChange={(e) => setNewCustomer({ ...newCustomer, house: e.target.value })}
                  />
                </div>
              </div>

              <div className="formActions">
                <button className="cancelBtn" onClick={handleCloseForm}>❌ Hủy</button>
                <button className="saveBtn" onClick={handleSaveCustomer}>💾 Lưu</button>
              </div>
            </div>
          </div>
        )}

        {/* ==== FORM SỬA KHÁCH HÀNG ==== */}
        {showEditForm && editingCustomer && (
          <div className="AddCustomerOverlay">
            <div className="AddCustomerForm">
              <div className="formHeader">
                <h3>SỬA KHÁCH HÀNG</h3>
              </div>

              <div className="formSection">
                <div className="sectionTitle">
                  <FaUsers className="icon" /> <span>THÔNG TIN KHÁCH HÀNG</span>
                </div>

                <div className="formGroup">
                  <label>Họ và tên<span className="required"> *</span></label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={editingCustomer.name || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  />
                </div>

                <div className="formGroup">
                  <label>Số điện thoại<span className="required"> *</span></label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={editingCustomer.phone || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                </div>

                <div className="formGroup">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={editingCustomer.email || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  />
                </div>

                <div className="formGroup">
                  <label>Tỉnh/Thành phố<span className="required"> *</span></label>
                  <select
                    value={editingCustomer.province || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, province: e.target.value, ward: "" })}
                    disabled={loading}
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                  {loading && <span className="loading"></span>}
                </div>

                <div className="formGroup">
                  <label>Phường/Xã<span className="required"> *</span></label>
                  <select
                    value={editingCustomer.ward || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, ward: e.target.value })}
                    disabled={loading || !editingCustomer.province}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                  {loading && <span className="loading"></span>}
                </div>

                <div className="formGroup">
                  <label>Số nhà / Đường</label>
                  <input
                    type="text"
                    placeholder="Nhập số nhà và tên đường"
                    value={editingCustomer.house || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, house: e.target.value })}
                  />
                </div>
              </div>

              <div className="formActions">
                <button className="cancelBtn" onClick={handleCloseEditForm}>❌ Hủy</button>
                <button className="saveBtn" onClick={handleUpdateCustomer}>💾 Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}