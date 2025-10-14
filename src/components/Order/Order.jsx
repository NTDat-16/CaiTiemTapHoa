import { useState, useEffect, useMemo } from "react";
// Import component Pagination từ Ant Design (giả sử bạn đã cài đặt antd)
import { Pagination } from 'antd'; 
import "./Order.css"; 
import aquavoiem from '../../assets/aquavoiem.png';  
import QR from '../../assets/QR.png'

const mockProducts = [
    { product_id: 1, product_name: "Nước suối Aquafina 500ml", barcode: "8938505970025", price: 5000, unit: "chai", type: "do-uong", image_url:aquavoiem },
    { product_id: 2, product_name: "Bánh mì sandwich", barcode: "8934567823912", price: 15000, unit: "ổ", type: "thuc-pham", image_url: "https://via.placeholder.com/60/a65c4c?text=B+M" },
    { product_id: 3, product_name: "Coca-Cola lon 330ml", barcode: "8934823912345", price: 10000, unit: "lon", type: "do-uong", image_url: "https://via.placeholder.com/60/a04c4c?text=CCL" },
    { product_id: 4, product_name: "Kẹo cao su Doublemint", barcode: "8935049510011", price: 3000, unit: "gói", type: "thuc-pham", image_url: "https://via.placeholder.com/60/4c8ca0?text=KCS" },
    { product_id: 5, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: "https://via.placeholder.com/60/4c8c5c?text=BSA" },
    { product_id: 6, product_name: "Mì gói Hảo Hảo", barcode: "8935049510033", price: 4000, unit: "gói", type: "thuc-pham", image_url: "https://via.placeholder.com/60/a65c4c?text=MHH" },
    { product_id: 7, product_name: "Sữa tươi Vinamilk", barcode: "8935049510044", price: 7000, unit: "hộp", type: "do-uong", image_url: "https://via.placeholder.com/60/a04ca0?text=SVN" },
    { product_id: 8, product_name: "Khoai tây chiên", barcode: "8935049510055", price: 20000, unit: "túi", type: "thuc-pham", image_url: "https://via.placeholder.com/60/4c7c8c?text=KTC" },
    { product_id: 9, product_name: "Nước tăng lực Redbull", barcode: "8935049510066", price: 12000, unit: "lon", type: "do-uong", image_url: "https://via.placeholder.com/60/4c8ca0?text=RTB" },
    { product_id: 10, product_name: "Bánh bông lan", barcode: "8935049510077", price: 25000, unit: "cái", type: "thuc-pham", image_url: "https://via.placeholder.com/60/a65c4c?text=BBL" },
    { product_id: 11, product_name: "Gia vị", barcode: "8935049510088", price: 15000, unit: "hộp", type: "gia-dung", image_url: "https://via.placeholder.com/60/4c8c5c?text=GVI" },
    { product_id: 12, product_name: "Khăn giấy", barcode: "8935049510099", price: 10000, unit: "gói", type: "gia-dung", image_url: "https://via.placeholder.com/60/a04c4c?text=KGJ" },
];
// Dữ liệu giả lập cho Khuyến mãi
const mockPromotions = [
    { promo_id: 1, promo_code: 'KM10', discount_type: 'percent', discount_value: 10, name: 'Giảm 10%' },
    { promo_id: 2, promo_code: 'FREESHIP', discount_type: 'amount', discount_value: 20000, name: 'Giảm 20K' },
];

// Dữ liệu giả lập cho Nhân viên/Khách hàng (Tùy chọn)
const mockUsers = [{ user_id: 1, name: "Nguyễn Văn A" }];
const mockCustomers = [{ customer_id: 1, phone: "0901234567", name: "Trần Thị B" }];


export default function Order() {
    const [category, setCategory] = useState("all");
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPromoId, setSelectedPromoId] = useState("");
    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("Tiền mặt"); 
 const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
   const [productsPerPage, setProductsPerPage] = useState(10); 

    const fetchData = async () => {
        setLoading(true);
        // Giả lập gọi API (giữ lại để test)
        await new Promise(resolve => setTimeout(resolve, 800));
        setProducts(mockProducts);
        setPromotions(mockPromotions);
        setUsers(mockUsers);
        setCustomers(mockCustomers);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 1. Lọc sản phẩm theo loại và tìm kiếm
    const filteredProducts = products.filter((p) => {
        const matchCategory = category === "all" || p.type === category;
        const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    // 2. Logic Phân trang (Client-Side)
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    // const totalPages = Math.ceil(filteredProducts.length / productsPerPage); // Không cần nữa vì antd tự tính

    // Hàm xử lý sự kiện khi thay đổi trang từ antd
  const handlePageChange = (page, size) => {
        setCurrentPage(page);
        // Nếu pageSize thay đổi, cập nhật state productsPerPage
        if (size !== productsPerPage) {
            setProductsPerPage(size);
        }
    };
         const handlePaymentMethodChange = (e) => {
        const newMethod = e.target.value;
        setPaymentMethod(newMethod);
        
        // Mở modal nếu chọn 'Chuyển khoản'
        if (newMethod === 'Chuyển khoản') {
            setIsTransferModalOpen(true);
        } else {
            setIsTransferModalOpen(false); // Đảm bảo đóng nếu chuyển sang phương thức khác
        }
    };  
     const closeModal = () => {
        setIsTransferModalOpen(false);
        // Có thể reset paymentMethod nếu muốn, ví dụ: setPaymentMethod('Tiền mặt');
    };
    useEffect(() => {
        // Reset về trang 1 khi thay đổi loại hoặc tìm kiếm
        setCurrentPage(1); 
    }, [category, search]);

    const handleAddToCart = (product) => {
        setCart((prev) => {
        const existing = prev.find((item) => item.product_id === product.product_id);
        if (existing) {
            return prev.map((item) =>
            item.product_id === product.product_id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
        } else {
            return [...prev, { ...product, quantity: 1 }];
        }
        });
    };
    const updateQuantity = (id, delta) => {
        setCart((prev) =>
        prev
            .map((item) =>
                item.product_id === id
                ? { ...item, quantity: Math.max(item.quantity + delta, 0) }
                : item
            )
            .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.product_id !== id));
    };

    const { subtotal, discountAmount, total } = useMemo(() => {
        const currentSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const selectedPromo = promotions.find(p => p.promo_id === Number(selectedPromoId));
        let currentDiscount = 0; 

        if (selectedPromo) {
            if (selectedPromo.discount_type === 'percent') {
                currentDiscount = (currentSubtotal * selectedPromo.discount_value) / 100;
            } else if (selectedPromo.discount_type === 'amount') {
                currentDiscount = selectedPromo.discount_value;
            }
        }

        const currentTotal = Math.max(0, currentSubtotal - currentDiscount);
        
        return {
            subtotal: currentSubtotal,
            discountAmount: currentDiscount,
            total: currentTotal,
        };
    }, [cart, selectedPromoId, promotions]);

    const TransferModal = ({ isOpen, onClose, qrCodeImage, total }) => {
        if (!isOpen) return null;

        return (
            // Overlay làm mờ màn hình
            <div className="modal-overlay" onClick={onClose}>
                {/* Modal box ở giữa màn hình, ngăn chặn đóng khi click vào nội dung */}
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                    <div className="qr-code-box">
                        {/* <h4>Scan QR để thanh toán</h4> */}
                        <img 
                            src={QR} 
                            alt="Mã QR Thanh toán" 
                            className="qr-code-image"
                        />
                        <p className="qr-info">
                            Ngân hàng: **Vietcombank**<br/>
                            STK: **0987654321**<br/>
                            **Số tiền cần chuyển: {total.toLocaleString()} ₫**<br/>
                            Nội dung: **THANHTOAN**
                        </p>
                    </div>
                    {/* Thêm nút để người dùng xác nhận đã chuyển khoản nếu cần */}
                    <button className="modal-confirm-btn" onClick={() => {
                        alert('Xác nhận đã chuyển khoản. Đợi xử lý...');
                        onClose();
                        // Thêm logic xác nhận đơn hàng/thanh toán ở đây
                    }}>
                       Xác nhận chuyển 
                    </button>
                </div>
            </div>
        );
    };
    return (
        <div className="order-page">
            <main className="order-main">
                {/* Cột bên trái: Giỏ hàng */}
                <section className="order-left">
                    <div>
                        <div className="input-group">
                            <label>Nhân viên (user_id)</label>
                            <select disabled value={users[0]?.user_id}>
                                {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Khách hàng (customer_id)</label>
                            <input type="text" placeholder="Nhập SĐT hoặc tên khách hàng" />
                        </div>

                        <div className="input-group">
                            <label>Mã Khuyến mãi (promo_id)</label>
                            <select 
                            value={selectedPromoId} onChange={(e)=> setSelectedPromoId(e.target.value)
                            }>
                            
                                <option value="">Không áp dụng</option>
                                {promotions.map(promo => (
                                    <option key={promo.promo_id} value={promo.promo_id}>
                                        {promo.promo_code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="product-list">
                        <div className="product-box">
                            <div className="cart-scroll-area"> 
                                {cart.length === 0 ? (
                                    <p className="empty-cart-message">Chưa có sản phẩm</p>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product_id} className="cart-item">
                                            <div className="cart-info">
                                                <strong>{item.product_name}</strong>
                                                <p>
                                                    {item.price.toLocaleString()} ₫ × {item.quantity} ={" "}
                                                    <span className="text-total">
                                                        {(item.price * item.quantity).toLocaleString()} ₫
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="cart-actions">
                                                <button onClick={() => updateQuantity(item.product_id, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product_id, +1)}>+</button>
                                                <button className="delete-btn" onClick={() => removeFromCart(item.product_id)}>X</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Thanh toán */}
                    <div className="payment-section">
                        <div className="payment-summary">
                            <div className="summary-row">
                                <span>Tổng phụ:</span>
                                <span>{subtotal.toLocaleString()} ₫</span>
                            </div>
                            <div className="summary-row discount-row">
                                <span>Giảm giá:</span>
                                <span>- {discountAmount.toLocaleString()} ₫</span>
                            </div>
                        </div>

                       <div className="input-group payment-method">
                            <label>Phương thức thanh toán</label>
                       
                            <select value={paymentMethod} onChange={handlePaymentMethodChange}> 
                                <option>Tiền mặt</option>
                                <option>Chuyển khoản</option>
                                <option>Thẻ</option>
                            </select>
                        </div>
                                                <div className="total-price">
                            <strong>Tổng thanh toán: </strong>
                            <span className="text-final-total">
                                {total.toLocaleString()} ₫
                            </span>
                        </div>

                        <button className="confirm-btn">Xác nhận đơn hàng</button>
                    </div>
                                <TransferModal 
                            isOpen={isTransferModalOpen} 
                            onClose={closeModal} 
                            qrCodeImage={QR} 
                            total={total}
                        />
                </section>

                {/* Cột bên phải: Danh sách sản phẩm */}
                <section className="order-right">
                    
                    {loading && (
                        <div className="product-loading-overlay">
                            <div className="ant-spin-dot">
                                <i className="ant-spin-dot-item"></i>
                                <i className="ant-spin-dot-item"></i>
                                <i className="ant-spin-dot-item"></i>
                                <i className="ant-spin-dot-item"></i>
                            </div>
                                
                        </div>
                    )}
                    <div className="product-header">
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm theo tên..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
            
                        <div className="type-product">
                            <label>Loại: </label>
                            <select className="choosetype" value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="all">Tất cả</option>
                                <option value="do-uong">Đồ uống</option>
                                <option value="thuc-pham">Thực phẩm</option>
                                <option value="gia-dung">Gia dụng</option>
                            </select>
                        </div>
                    </div>

                    <div className="product-grid">
                      {currentProducts.length > 0 ? (
                           currentProducts.map((p) => (
                            <div
                                key={p.product_id}
                                className="product-item"
                                onClick={() => handleAddToCart(p)}
                            >
                                <div className="product-image-container">
                                    <img 
                                        src={p.image_url} 
                                        alt={p.product_name} 
                                        className="product-thumbnail" 
                                    />
                                </div>
                                
                                {/* ✨ THÊM WRAPPER cho tên và giá ✨ */}
                                <div className="product-info-wrapper"> 
                                    <div className="product-name">{p.product_name}</div>
                                    <div className="product-price">
                                        {p.price.toLocaleString()} ₫ / {p.unit}
                                    </div>
                                </div>
                                {/* ✨ KẾT THÚC WRAPPER ✨ */}
                            </div>
                        ))
                        ) : (
                             <p className="no-result">Không tìm thấy sản phẩm nào.</p>
                        )}
                    </div>

                    
                    <div className="pagination-antd-wrapper">
                      <Pagination 
                            current={currentPage} // Trang hiện tại
                            pageSize={productsPerPage} // Số lượng sản phẩm trên mỗi trang (State mới)
                            total={filteredProducts.length} // Tổng số lượng sản phẩm sau khi lọc
                            onChange={handlePageChange} // Hàm xử lý thay đổi trang/pageSize
                            
                            showSizeChanger={true} // Bật tính năng thay đổi kích thước trang
                            pageSizeOptions={['8', '10', '16', '20']} // Tùy chọn kích thước trang
                            
                            
                          
                            
                        />
        </div>
                    
                    
                </section>
            </main>
        </div>
    );
}