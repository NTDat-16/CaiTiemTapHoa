import { useState, useEffect } from "react";
import "./Order.css";

// Dữ liệu giả lập sản phẩm
const mockProducts = [
    { product_id: 1, product_name: "Nước suối Aquafina 500ml", barcode: "8938505970025", price: 5000, unit: "chai", type: "do-uong" },
    { product_id: 2, product_name: "Bánh mì sandwich", barcode: "8934567823912", price: 15000, unit: "ổ", type: "thuc-pham" },
    { product_id: 3, product_name: "Coca-Cola lon 330ml", barcode: "8934823912345", price: 10000, unit: "lon", type: "do-uong" },
    { product_id: 4, product_name: "Kẹo cao su Doublemint", barcode: "8935049510011", price: 3000, unit: "gói", type: "thuc-pham" },
    { product_id: 5, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong" },
    { product_id: 6, product_name: "Mì gói Hảo Hảo", barcode: "8935049510033", price: 4000, unit: "gói", type: "thuc-pham" },
    { product_id: 7, product_name: "Sữa tươi Vinamilk", barcode: "8935049510044", price: 7000, unit: "hộp", type: "do-uong" },
    { product_id: 8, product_name: "Khoai tây chiên", barcode: "8935049510055", price: 20000, unit: "túi", type: "thuc-pham" },
    { product_id: 9, product_name: "Nước tăng lực Redbull", barcode: "8935049510066", price: 12000, unit: "lon", type: "do-uong" },
    { product_id: 10, product_name: "Bánh bông lan", barcode: "8935049510077", price: 25000, unit: "cái", type: "thuc-pham" },
    { product_id: 11, product_name: "Gia vị", barcode: "8935049510088", price: 15000, unit: "hộp", type: "gia-dung" },
    { product_id: 12, product_name: "Khăn giấy", barcode: "8935049510099", price: 10000, unit: "gói", type: "gia-dung" },
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
    const [loading, setLoading] = useState(true); // Thêm state loading

    // States cho dữ liệu từ API giả lập
    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);

    // States cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8; // Số sản phẩm trên mỗi trang

    // ✅ Hàm giả lập gọi API để tải tất cả dữ liệu cần thiết
    const fetchData = async () => {
        setLoading(true);
        console.log("Đang giả lập gọi API...");
        // Mô phỏng độ trễ
        await new Promise(resolve => setTimeout(resolve, 800));

        // ⛔️ CHỖ NÀY SẼ ĐƯỢC THAY THẾ BẰNG LỆNH GỌI API THẬT
        setProducts(mockProducts);
        setPromotions(mockPromotions);
        setUsers(mockUsers);
        setCustomers(mockCustomers);
        // -----------------------------------------------------

        setLoading(false);
        console.log("Hoàn thành giả lập gọi API.");
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

    // 2. Logic Phân trang
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Xử lý khi bộ lọc thay đổi, reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [category, search]);


    // ✅ Các hàm quản lý giỏ hàng (giữ nguyên)
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

    // ✅ Tính toán tổng tiền (giả định chưa áp dụng KM)
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = 0; // Tạm thời để 0
    const total = subtotal - discountAmount;

    // Hiển thị màn hình loading
    if (loading) {
        return <div className="loading-screen">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="order-page">
            <header className="order-header">
                <h1>Đặt hàng tại quầy</h1>
                <input
                    type="text"
                    placeholder="Tìm sản phẩm theo tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </header>

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
                            <select>
                                <option value="">Không áp dụng</option>
                                {promotions.map(promo => (
                                    <option key={promo.promo_id} value={promo.promo_id}>
                                        {promo.promo_code}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="product-list">
                            <h2>🛒 Giỏ hàng ({cart.length} món)</h2>
                            <div className="product-box">
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
                            <select>
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
                </section>

                {/* Cột bên phải: Danh sách sản phẩm */}
                <section className="order-right">
                    <div className="product-header">
                        <h2>Danh sách sản phẩm</h2>
                        <div className="type-product">
                            <label>Loại: </label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
                                    <div className="product-name">{p.product_name}</div>
                                    <div className="product-price">
                                        {p.price.toLocaleString()} ₫ / {p.unit}
                                    </div>
                                </div>
                            ))
                        ) : (
                             <p className="no-result">Không tìm thấy sản phẩm nào.</p>
                        )}
                    </div>

                    <div className="pagination">
                        <button 
                            onClick={() => paginate(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            <span role="img" aria-label="previous">◀️</span> Trước
                        </button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <button 
                            onClick={() => paginate(currentPage + 1)} 
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Sau <span role="img" aria-label="next">▶️</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}