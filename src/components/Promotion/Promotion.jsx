import { useState, useEffect } from 'react'
import './Promotion.css' // Đảm bảo bạn có file CSS này để tạo kiểu

// Dữ liệu giả lập khuyến mãi
const mockPromotions = [
    { promo_id: 1, promo_code: 'SALE10', description: 'Giảm 10% cho mọi đơn hàng', discount_type: 'percent', discount_value: 10, start_date: '2025-10-01', end_date: '2025-10-31', min_order_amount: 100000, usage_limit: 50, used_count: 5, status: 'active' },
    { promo_id: 2, promo_code: 'FREE30K', description: 'Giảm 30.000 VNĐ', discount_type: 'amount', discount_value: 30000, start_date: '2025-11-01', end_date: '2025-11-15', min_order_amount: 200000, usage_limit: 20, used_count: 12, status: 'expired' },
    { promo_id: 3, promo_code: 'NEWUSER50', description: 'Giảm 50% cho khách hàng mới', discount_type: 'percent', discount_value: 50, start_date: '2025-09-01', end_date: '2025-12-31', min_order_amount: 50000, usage_limit: 100, used_count: 55, status: 'active' },
    { promo_id: 4, promo_code: 'BLACKFRIDAY', description: 'Giảm cố định 50K', discount_type: 'amount', discount_value: 50000, start_date: '2025-11-25', end_date: '2025-11-28', min_order_amount: 300000, usage_limit: 10, used_count: 10, status: 'expired' },
    { promo_id: 5, promo_code: 'TET2026', description: 'Khuyến mãi Tết Nguyên Đán', discount_type: 'percent', discount_value: 15, start_date: '2026-01-01', end_date: '2026-02-10', min_order_amount: 150000, usage_limit: 75, used_count: 0, status: 'active' },
];

// Component Modal đơn giản (giữ nguyên)
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal-content">
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

export default function Promotion() {
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true) // ✅ Thêm state loading
    const [formData, setFormData] = useState({
        promo_code: '',
        description: '',
        discount_type: 'percent',
        discount_value: '',
        start_date: '',
        end_date: '',
        min_order_amount: '',
        usage_limit: '',
        used_count: '0',
        status: 'active'
    })
    const [editingId, setEditingId] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // ✅ States cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Ví dụ: 5 khuyến mãi trên mỗi trang

    // ✅ Hàm giả lập fetch dữ liệu
    const fetchPromotions = async () => {
        setLoading(true);
        console.log("Đang giả lập gọi API fetch Khuyến mãi...");
        
        // Mô phỏng độ trễ của API
        await new Promise(resolve => setTimeout(resolve, 800));

        // ⛔️ CHỖ NÀY SẼ ĐƯỢC THAY THẾ BẰNG LỆNH GỌI API THẬT
        /*
        try {
            const response = await fetch('/api/promotions');
            const data = await response.json();
            setPromotions(data);
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
        }
        */
        
        // Hiện tại: dùng dữ liệu giả lập
        setPromotions(mockPromotions);
        setLoading(false);
        console.log("Hoàn thành giả lập gọi API.");
    };

    // ✅ Gọi API giả lập khi component mount
    useEffect(() => {
        fetchPromotions()
    }, [])
    
    // ✅ Logic Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPromotions = promotions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(promotions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Hàm đặt lại form (giữ nguyên)
    const resetForm = () => {
        setFormData({
            promo_code: '', description: '', discount_type: 'percent',
            discount_value: '', start_date: '', end_date: '',
            min_order_amount: '', usage_limit: '', used_count: '0', status: 'active'
        })
        setEditingId(null)
    }

    // Mở Modal cho việc thêm mới (giữ nguyên)
    const handleOpenAddModal = () => {
        resetForm()
        setIsModalOpen(true)
    }

    // Đóng Modal (giữ nguyên)
    const handleCloseModal = () => {
        setIsModalOpen(false)
        resetForm()
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Hàm submit (đã sửa để mô phỏng API)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); // Bắt đầu loading khi submit
        await new Promise(resolve => setTimeout(resolve, 300)); // Mô phỏng độ trễ

        const finalData = {
            ...formData,
            discount_value: Number(formData.discount_value),
            min_order_amount: Number(formData.min_order_amount),
            usage_limit: Number(formData.usage_limit),
            used_count: Number(formData.used_count),
        }

        if (editingId) {
            // ✅ Mock PUT API
            setPromotions(promotions.map(p => p.promo_id === editingId ? { ...p, ...finalData } : p))
            console.log("Giả lập: Cập nhật khuyến mãi thành công", finalData);
        } else {
            // ✅ Mock POST API
            const newPromo = { promo_id: Date.now(), ...finalData };
            setPromotions([...promotions, newPromo]);
            console.log("Giả lập: Thêm khuyến mãi thành công", newPromo);
        }
        
        setLoading(false);
        handleCloseModal();
    }

    // Mở Modal và điền dữ liệu cho việc chỉnh sửa (giữ nguyên)
    const handleEdit = (promo) => {
        setFormData({
            ...promo,
            discount_value: String(promo.discount_value),
            min_order_amount: String(promo.min_order_amount),
            usage_limit: String(promo.usage_limit),
            used_count: String(promo.used_count),
        })
        setEditingId(promo.promo_id)
        setIsModalOpen(true)
    }

    // Hàm xóa (đã sửa để mô phỏng API)
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
            setLoading(true); // Bắt đầu loading khi xóa
            await new Promise(resolve => setTimeout(resolve, 300)); // Mô phỏng độ trễ
            
            // ✅ Mock DELETE API
            setPromotions(promotions.filter(p => p.promo_id !== id))
            console.log(`Giả lập: Xóa khuyến mãi ID ${id} thành công`);
            
            setLoading(false);
            // Sau khi xóa, kiểm tra lại trang hiện tại
            if (currentPromotions.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    }

    // ✅ Hiển thị loading screen
    if (loading) {
        return <div className="loading-screen">Đang tải dữ liệu Khuyến mãi...</div>;
    }

    return (
        <div className="PromotionWrapper">
            <div className="header-bar">
                <h2>Quản lý Khuyến mãi</h2>
                <button className="add-button" onClick={handleOpenAddModal}>
                    + Thêm Khuyến mãi
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
                                        <button className="edit-button" onClick={() => handleEdit(p)}>Sửa</button>
                                        <button className="delete-button" onClick={() => handleDelete(p.promo_id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* ✅ Thanh Footer và Phân trang */}
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
                </div>
            </div>

            {/* Modal Thêm/Sửa Khuyến mãi (giữ nguyên) */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi mới'}
            >
                <form className="ModalForm" onSubmit={handleSubmit}>
                    {/* ... Các trường Form giữ nguyên ... */}
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