import { useState, useEffect } from 'react'
import './Promotion.css' 
import { Popconfirm } from 'antd'; 


// Dữ liệu giả lập khuyến mãi (Giữ nguyên để dự phòng)
const mockPromotions = [
    { promo_id: 1, promo_code: 'SALE10', description: 'Giảm 10% cho mọi đơn hàng', discount_type: 'percent', discount_value: 10, start_date: '2025-10-01', end_date: '2025-10-31', min_order_amount: 100000, usage_limit: 50, used_count: 5, status: 'active' },
    // ... dữ liệu mock khác
];

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default function App() {
    // URL API (Giả định là endpoint Promotions)
    const PROMOTION_API_URL = "http://localhost:5000/api/Promotion";

    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        promo_code: '', description: '', discount_type: 'percent',
        discount_value: '', start_date: '', end_date: '',
        min_order_amount: '', usage_limit: '', used_count: '0', status: 'active'
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    
    // Hàm Lấy Token Xác thực từ LocalStorage
    const getAuthToken = () => {
        // Giả sử token được lưu với key 'authToken'
        return localStorage.getItem('authToken');
    };

    // Hàm gọi API TẢI DỮ LIỆU
    const fetchPromotions = async () => {
        setLoading(true);
        console.log("Đang gọi API GET: " + PROMOTION_API_URL);
        
        const token = getAuthToken(); // Lấy token

        if (!token) {
            console.error("Lỗi: Không tìm thấy Token Xác thực.");
            // Tạm thời hiển thị mock data nếu không có token (chỉ cho dev/test)
            // setPromotions(mockPromotions); 
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(PROMOTION_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (response.status === 401) {
                // Xử lý lỗi 401: chuyển hướng người dùng về trang đăng nhập
                console.error("Lỗi 401: Token hết hạn hoặc không hợp lệ. Cần đăng nhập lại.");
                // alert("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
                // window.location.href = '/login'; // Ví dụ chuyển hướng
                throw new Error(`Lỗi HTTP! Status: ${response.status} (Unauthorized)`);
            }
            
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! Status: ${response.status}`);
            }
            
            const data = await response.json();
            setPromotions(data);
            console.log("Dữ liệu khuyến mãi đã được tải thành công.");
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu khuyến mãi:", error);
            setPromotions([]); 
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchPromotions();
    }, []);
    
    // ... Logic Phân trang (Giữ nguyên) ...
    const filteredPromotions = promotions.filter(p => 
        p.promo_code.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPromotions = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    }
    
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);


    // ... Hàm đặt lại form, mở/đóng Modal (Giữ nguyên) ...
    const resetForm = () => {
        setFormData({
            promo_code: '', description: '', discount_type: 'percent',
            discount_value: '', start_date: '', end_date: '',
            min_order_amount: '', usage_limit: '', used_count: '0', status: 'active'
        });
        setEditingId(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // Hàm gọi API THÊM MỚI hoặc CẬP NHẬT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const token = getAuthToken(); // Lấy token

        if (!token) {
            console.error("Lỗi: Không tìm thấy Token Xác thực.");
            setLoading(false);
            return;
        }
        
        const finalData = {
            ...formData,
            discount_value: Number(formData.discount_value),
            min_order_amount: Number(formData.min_order_amount),
            usage_limit: Number(formData.usage_limit),
            used_count: Number(formData.used_count || 0), 
        };

        try {
            let url = PROMOTION_API_URL;
            let method = 'POST';

            if (editingId) {
                url = `${PROMOTION_API_URL}/${editingId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    // 🔑 THÊM HEADER AUTHORIZATION VÀO ĐÂY
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi ${method} API: ${response.status}. Chi tiết: ${errorText || response.statusText}`);
            }

            console.log(`Thao tác ${editingId ? 'cập nhật' : 'thêm mới'} thành công.`);
            
            await fetchPromotions(); 
            handleCloseModal();

        } catch (error) {
            console.error("Lỗi khi gửi form:", error);
            // TODO: Hiển thị lỗi này cho người dùng trên UI
        } finally {
            setLoading(false);
        }
    };

    // Mở Modal và điền dữ liệu cho việc chỉnh sửa (Giữ nguyên)
    const handleEdit = (promo) => {
        setFormData({
            ...promo,
            discount_value: String(promo.discount_value),
            min_order_amount: String(promo.min_order_amount),
            usage_limit: String(promo.usage_limit),
            used_count: String(promo.used_count),
        });
        setEditingId(promo.promo_id);
        setIsModalOpen(true);
    };

    // Hàm gọi API XÓA
    const handleDelete = async (id) => {
        setLoading(true); 
        const token = getAuthToken(); // Lấy token

        if (!token) {
            console.error("Lỗi: Không tìm thấy Token Xác thực.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${PROMOTION_API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    // 🔑 THÊM HEADER AUTHORIZATION VÀO ĐÂY
                    'Authorization': `Bearer ${token}` 
                },
            });

            if (!response.ok) {
                throw new Error(`Lỗi DELETE API: ${response.status}. Thao tác thất bại.`);
            }

            console.log(`Xóa khuyến mãi ID ${id} thành công.`);
            
            await fetchPromotions(); 
            
        } catch (error) {
            console.error("Lỗi khi xóa khuyến mãi:", error);
            // TODO: Hiển thị lỗi này cho người dùng trên UI
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="loading-screen">Đang tải dữ liệu Khuyến mãi từ Backend...</div>;
    }


    return (
        <div className="PromotionWrapper">
            {/* ... Phần UI giữ nguyên ... */}
            <div className="header-bar">
                <h2>Quản lý khuyến mãi</h2>
                <input
                    type="text"
                    placeholder="Tìm khuyến mãi theo tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="add-button" onClick={handleOpenAddModal}>
                    + Thêm khuyến mãi
                </button>
            </div>

            <div className="table-container">
                <table className="PromotionTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Mã KM</th>
                            <th>Mô tả</th>
                            <th>Loại</th>
                            <th>Giá trị</th>
                            <th>Bắt đầu</th>
                            <th>Kết thúc</th>
                            <th>Đơn tối thiểu</th>
                            <th>Giới hạn SL</th>
                            <th>Đã dùng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPromotions.length === 0 ? (
                            <tr>
                                <td colSpan="12" className="no-data-row">Không có dữ liệu khuyến mãi.</td>
                            </tr>
                        ) : (
                            currentPromotions.map(p => (
                                <tr key={p.promo_id}>
                                    <td>{p.promo_id}</td>
                                    <td>{p.promo_code}</td>
                                    <td>{p.description}</td>
                                    <td>{p.discount_type === 'percent' ? 'Phần trăm' : 'Số tiền'}</td>
                                    <td>
                                        {p.discount_type === 'percent'
                                            ? `${p.discount_value}%`
                                            : `${p.discount_value.toLocaleString('vi-VN')} VNĐ`
                                        }
                                    </td>
                                    <td>{p.start_date}</td>
                                    <td>{p.end_date}</td>
                                    <td>{p.min_order_amount.toLocaleString('vi-VN')} VNĐ</td>
                                    <td>{p.usage_limit}</td>
                                    <td>{p.used_count}</td>
                                    <td><span className={`status-${p.status}`}>{p.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}</span></td>
                                    <td>
                                        <button 
                                            className="edit-button" 
                                            onClick={() => handleEdit(p)}
                                        >
                                            Sửa
                                        </button>
                                        
                                        <Popconfirm
                                            title="Xóa khuyến mãi"
                                            description={`Bạn có chắc chắn muốn xóa mã KM: ${p.promo_code}?`} 
                                            onConfirm={() => handleDelete(p.promo_id)} 
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true }} 
                                        >
                                            <button className="delete-button">
                                                Xóa
                                            </button>
                                        </Popconfirm>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="table-footer">
                <p>Tổng {promotions.length} khuyến mãi</p> 
                <div className="pagination">
                    <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        Trước
                    </button>
                    <span>Trang {currentPage} / {totalPages}</span> 
                    <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Sau
                    </button>
                    <select className='selectpage'
                        value={itemsPerPage} 
                        onChange={(e) => {
                            console.log("Tính năng thay đổi số mục/trang không được kích hoạt để đồng bộ với ProductManage (pageSize cố định là 10)");
                        }}
                        
                    >
                        <option value="10">10 / trang</option>
                        <option value="20">20 / trang</option>
                    </select>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi mới'}
            >
                <form className="ModalForm" onSubmit={handleSubmit}>
                    <div className="form-group"><label>Mã Khuyến mãi *</label><input name="promo_code" value={formData.promo_code} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Mô tả</label><input name="description" value={formData.description} onChange={handleChange} /></div>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Loại giảm giá *</label>
                            <select name="discount_type" value={formData.discount_type} onChange={handleChange} required>
                                <option value="percent">Phần trăm (%)</option>
                                <option value="amount">Số tiền (VNĐ)</option>
                            </select>
                        </div>
                        <div className="form-group half-width">
                            <label>Giá trị giảm giá *</label>
                            <input name="discount_value" type="number" value={formData.discount_value} onChange={handleChange} required min="0"/>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Ngày bắt đầu *</label>
                            <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
                        </div>
                        <div className="form-group half-width">
                            <label>Ngày kết thúc *</label>
                            <input name="end_date" type="date" value={formData.end_date} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Đơn tối thiểu (VNĐ)</label>
                            <input name="min_order_amount" type="number" value={formData.min_order_amount} onChange={handleChange} min="0"/>
                        </div>
                        <div className="form-group half-width">
                            <label>Giới hạn sử dụng</label>
                            <input name="usage_limit" type="number" value={formData.usage_limit} onChange={handleChange} min="1"/>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Số lần đã dùng</label>
                            <input name="used_count" type="number" value={formData.used_count} onChange={handleChange} readOnly={!editingId} min="0" />
                        </div>
                        <div className="form-group half-width">
                            <label>Trạng thái *</label>
                            <select name="status" value={formData.status} onChange={handleChange} required>
                                <option value="active">Đang hoạt động</option>
                                <option value="expired">Hết hạn</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={handleCloseModal}>Hủy</button>
                        <button type="submit" className="save-button">{editingId ? 'Cập nhật' : 'Lưu'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}