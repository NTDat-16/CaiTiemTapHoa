import { useState, useEffect, useMemo } from "react";
import {
  Form, Table, Row, Col, Input, Select, Button, Card, Modal, message, Space, Tag, Pagination, Spin,Divider, InputNumber 
} from "antd";
import { SearchOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import "./Order.css";
import aquavoiem from "../../assets/aquavoiem.png";
import QR from "../../assets/QR.png";

const { Option } = Select;

const mockProducts = [
  { product_id: 1, product_name: "Nước suối Aquafina 500ml", barcode: "8938505970025", price: 5000, unit: "chai", type: "do-uong", image_url: aquavoiem },
  { product_id: 2, product_name: "Bánh mì sandwich", barcode: "8934567823912", price: 15000, unit: "ổ", type: "thuc-pham", image_url: aquavoiem },
  { product_id: 3, product_name: "Coca-Cola lon 330ml", barcode: "8934823912345", price: 10000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 4, product_name: "Kẹo cao su Doublemint", barcode: "8935049510011", price: 3000, unit: "gói", type: "gia-dung", image_url: aquavoiem },
  { product_id: 6, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 7, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 8, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 9, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 10, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 11, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 12, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 13, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 14, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 15, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 16, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 17, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 18, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
  { product_id: 19, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
];

const mockPromotions = [
  { promo_id: 1, promo_code: "KM10", discount_type: "percent", discount_value: 10, name: "Giảm 10%" },
  { promo_id: 2, promo_code: "FREESHIP", discount_type: "amount", discount_value: 20000, name: "Giảm 20K" },
];


const typeColors = {
  "do-uong": "blue",
  "thuc-pham": "orange",
  "gia-dung": "green",
  "bánh-kẹo": "purple",
  "trai-cay": "red",
  // ... bạn có thể thêm bất cứ loại nào ở đây
};


export default function Order() {
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(25);
  const [customerPaid, setCustomerPaid] = useState(0);
  const [chosenIds, setChosenIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm()
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loadingCustomer, setLoadingCustomer] = useState(false);


  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setPromotions(mockPromotions);
      setLoading(false);
    }, 600);
  }, []);

  const handleAdd = () => {
    setIsModalOpen(true)
    form.resetFields();
  }

  const filteredProducts = products.filter((p) => {
    const matchCategory = category === "all" || p.type === category;
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleAddToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product_id === product.product_id);
      if (exists) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      message.success(`${product.product_name} đã thêm vào giỏ hàng`);
      return [...prev, { ...product, quantity: 1 }];
    });

    setChosenIds(prev => prev.includes(product.product_id)
      ? prev
      : [...prev, product.product_id]
    );
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) => {
      const newCart = prev
        .map((item) =>
          item.product_id === id
          ? { ...item, quantity: Math.max(item.quantity + delta, 0) }
          : item
      )
      .filter((item) => item.quantity > 0);

      setChosenIds((prevIds) =>
        prevIds.filter((pid) => newCart.some((item) => item.product_id === pid))
      );
      return newCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const newCart = prev.filter((i) => i.product_id !== id);

      setChosenIds((prevIds) => prevIds.filter((pid) => pid !== id));
      return newCart;
    });
  };

  const { subtotal, discountAmount, total } = useMemo(() => {
    const currentSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const selectedPromo = promotions.find((p) => p.promo_id === Number(selectedPromoId));
    let currentDiscount = 0;
    if (selectedPromo) {
      if (selectedPromo.discount_type === "percent") {
        currentDiscount = (currentSubtotal * selectedPromo.discount_value) / 100;
      } else if (selectedPromo.discount_type === "amount") {
        currentDiscount = selectedPromo.discount_value;
      }
    }
    const currentTotal = Math.max(0, currentSubtotal - currentDiscount);
    return { subtotal: currentSubtotal, discountAmount: currentDiscount, total: currentTotal };
  }, [cart, selectedPromoId, promotions]);

  const handlePaymentChange = (value) => {
    setPaymentMethod(value);
  };

  const columns = [
    {title: "SP",dataIndex: "product_name",key: "product_name",render: (text) => <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{text}</div>,},
    { title: "SL", dataIndex: "quantity", key: "quantity", render: (qty, record) => (
      <Space>
        <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(record.product_id, -1)} />
        <span>{qty}</span>
        <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(record.product_id, 1)} />
      </Space>
    ),},
    { title: "ĐG", dataIndex: "price", key: "price", render: (p) => p.toLocaleString() + " ₫" },
    { title: "TT", key: "total", render: (_, r) => (r.price * r.quantity).toLocaleString() + " ₫" },
    { title: "Xóa", key: "action", render: (_, r) => (
        <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => removeFromCart(r.product_id)} />
    ),
    },
  ];

  //Tìm kiếm tên khách hàng theo số điện thoại
  let typingTimer;

  const handlePhoneChange = (e) => {
    const value = e.target.value.trim();
    setPhone(value);
    setCustomerName("");

    clearTimeout(typingTimer);
    if (/^\d{9,10}$/.test(value)) {
      typingTimer = setTimeout(() => {
        fetchCustomerByPhone(value);
      }, 500);
    }
  };

  const fetchCustomerByPhone = async (phone) => {
    try {
      setLoadingCustomer(true);

      const response = await fetch(`http://localhost:5000/api/Customer/by-phone/${phone}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (response.ok && result?.data) {
        setCustomerName(result.data.name || ""); // lấy tên từ dữ liệu trả về
      } else {
        setCustomerName("");
        message.warning("Không tìm thấy khách hàng này");
      }
    } catch (error) {
      console.error("Lỗi khi tìm khách hàng:", error);
      message.error("Không thể kết nối đến server");
    } finally {
      setLoadingCustomer(false);
    }
  };

  //Thêm khách hàng mới
  const AddNewCustomer = async (values) => {
    try {
      const { name, phone } = values;

      const response = await fetch("http://localhost:5000/api/Customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Nếu server trả lỗi trùng số
        if (data.message?.includes("Phone number already exists")) {
          form.setFields([{ name: "phone", errors: ["Số điện thoại đã tồn tại!"] }]);
          return;
        }
        throw new Error(data.message || "Thêm khách hàng thất bại");
      }

      message.success("Thêm khách hàng thành công");
      form.resetFields();
      setIsModalOpen(false);
      setPhone(phone);
      setCustomerName(name);

    } catch (error) {
      // Lỗi khác
      message.error(error.message || "Lỗi khi thêm khách hàng");
      console.error(error);
    }
  };

  //Tính tiền thừa cho khách
  function tienthua(tiendua, tongmua) {
    const change = tiendua - tongmua;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(change);
  }


  return (
    <div className="order-container">
      <Row gutter={16}>
        {/* Cột bên trái */}
        <Col span={16}>
          <Card
            title={null}
            style={{height: "calc(100vh - 80px)",display: "flex",flexDirection: "column",borderRadius: 12,boxShadow: "0 4px 12px rgba(0,0,0,0.08)",overflow: "hidden",}}
            bodyStyle={{display: "flex",flexDirection: "column",height: "100%",padding: 0,}}
          >
            {/* Header */}
            <div
              style={{padding: "10px 20px",borderBottom: "1px solid #f0f0f0",background: "#fff",position: "sticky",top: 0,zIndex: 2,}}
            >
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Select
                  value={category}
                  onChange={setCategory}
                  style={{width: 160,height: 50,borderRadius: 6,}}
                  bordered={true}
                  size="middle"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="do-uong">Đồ uống</Option>
                  <Option value="thuc-pham">Thực phẩm</Option>
                  <Option value="gia-dung">Gia dụng</Option>
                </Select>

                <Input
                  prefix={<SearchOutlined style={{ color: "#999" }} />}
                  placeholder="Tìm sản phẩm..."
                  allowClear
                  onChange={(e) => setSearch(e.target.value)}
                  style={{width: 240,height: 36,borderRadius: 6,}}
                  size="middle"
                />
              </Space>
            </div>

            {/* Danh sách sản phẩm*/}
            <div
              style={{flex: 1,overflowY: "auto",padding: "16px 20px",background: "#fafafa",}}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" />
                </div>
              ) : (
                <div
                  className="product-grid"
                  style={{display: "grid",gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",gap: 12,justifyItems: "center",alignItems: "start",}}
                >
                  {currentProducts.map((p) => (
                    <Card
                      hoverable
                      key={p.product_id}
                        cover={
                          <div style={{ position: "relative", height: 140, overflow: "hidden", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <img
                              alt={p.product_name}
                              src={p.image_url}
                              style={{width: "100%",height: "100%",objectFit: "cover",}}
                            />
                            {chosenIds.includes(p.product_id) && (
                              <div
                                style={{position: "absolute",top: 8,right: 8,width: 24,height: 24,backgroundColor: "#008f5a",borderRadius: "50%",display: "flex",alignItems: "center",justifyContent: "center",color: "#fff",fontSize: 16,fontWeight: "bold",}}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                        }
                        onClick={() => handleAddToCart(p)}
                        style={{width: 160,borderRadius: 10,boxShadow: "0 4px 12px rgba(0,0,0,0.08)",transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",background: "#fff",}}
                        bodyStyle={{ padding: 10 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                        }}
                    >
                      <Card.Meta
                        title={
                          <span
                            style={{fontWeight: 600,fontSize: 13,display: "block",height: 34,overflow: "hidden",textOverflow: "ellipsis",}}
                          >
                            {p.product_name}
                          </span>
                        }
                        description={
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <Tag
                              color={typeColors[p.type] || "default"}
                              style={{fontSize: 11,padding: "2px 6px",borderRadius: 4,alignSelf: "flex-start",}}
                            >
                              {p.type.replace("-", " ")}
                            </Tag>
                            {/* Số lượng tồn */}
                            <span style={{ 
                                color: "red", 
                                fontSize: 12 
                            }}>
                                Số lượng: {10000}
                            </span>
                            <span style={{ color: "#555", fontSize: 12 }}>
                              {p.price.toLocaleString()} ₫ / {p.unit}
                            </span>
                          </div>
                        }
                      />
                    </Card>
                  ))}
                </div>
              )}
            </div>
            {/* Footer */}
            <div
              style={{padding: "10px 24px",borderTop: "1px solid #f0f0f0",background: "#fff",
                position: "sticky",bottom: 0,zIndex: 2,display: "flex",justifyContent: "flex-end",
              }}
            >
              <Pagination
                style={{ transform: "translateY(-10px)" }}
                current={currentPage}
                pageSize={productsPerPage}
                total={filteredProducts.length}
                showSizeChanger
                pageSizeOptions={["5", "10", "15", "20", "25"]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setProductsPerPage(size);               
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Cột bên phải*/}
        <Col span={8}>
          <Card
            bordered
            style={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", padding: 0 }}
            bodyStyle={{ padding: 0 }}
          >
            {/* Danh sách sản phẩm */}
            <div style={{ flex: 1, overflowY: "auto", background: "#fafafa", padding: 0}}>
              <Table
                columns={columns}
                dataSource={cart}
                rowKey="product_id"
                pagination={false}
                size="small"
                locale={{ emptyText: "Chưa có sản phẩm" }}
                bordered
                scroll={cart.length > 5 ? { y: 350 } : undefined}
                style={{ tableLayout: "fixed", width: "100%" }}
                components={{
                  header: {
                    cell: ({ children, ...restProps }) => (
                      <th
                        {...restProps}
                        style={{backgroundColor: "#008f5a",color: "#fff",fontWeight: 600,textAlign: "center",}}
                      >
                        {children}
                      </th>
                    ),
                  },
                }}
              />
            </div>

            {/* 2. Thông tin khách + thanh toán */}
              <div style={{ display: "flex", padding: 16, gap: 16, flex: 1, overflowY: "auto", background: "#fff" }}>
                {/* Cột trái */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

                  <Input
                    placeholder="Nhập SĐT khách hàng"
                    value={phone}
                    addonAfter={
                      <Button onClick={handleAdd} type="primary" style={{ padding: "0 12px", height: 28 }}>
                        + Thêm
                      </Button>
                    }
                    suffix={loadingCustomer ? <Spin size="small" /> : null}
                    style={{ height: 36, borderRadius: 6 }}
                    onChange={handlePhoneChange}
                  />
                  
                  <Input
                    placeholder="Tên khách hàng"
                    value={customerName}
                    readOnly
                    style={{ height: 36, borderRadius: 6, marginTop: 8 }}
                  />
                  
                  <Select
                    value={selectedPromoId}
                    onChange={(v) => setSelectedPromoId(v)}
                    placeholder="Chọn mã khuyến mãi"
                    style={{ width: "100%", height: 36, borderRadius: 6 }}
                  >
                  <Option value="">Không áp dụng</Option>
                    {promotions.map((promo) => (
                      <Option key={promo.promo_id} value={promo.promo_id}>{promo.name}</Option>
                    ))}
                  </Select>
                  <Input.TextArea placeholder="Ghi chú cho đơn" rows={2} style={{ borderRadius: 6 }} />
                  <Select
                    value={paymentMethod}
                    onChange={handlePaymentChange}
                    style={{ width: "100%", height: 36, borderRadius: 6 }}
                  >
                    <Option value="Tiền mặt">Tiền mặt</Option>
                    <Option value="Chuyển khoản">Chuyển khoản</Option>
                    <Option value="Thẻ">Thẻ</Option>
                  </Select>
                </div>

                {/* Cột phải */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                    <span>Tổng phụ:</span>
                    <span>{subtotal.toLocaleString()} ₫</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                    <span>Giảm giá:</span>
                    <span>- {discountAmount.toLocaleString()} ₫</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}>
                    <span>Tổng cộng:</span>
                    <span>{total.toLocaleString()} ₫</span>
                    
                  </div>
                  {paymentMethod === "Tiền mặt" && 
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span>Khách đưa:</span>
                          <InputNumber
                            min={0}
                            value={customerPaid}
                            formatter={(value) => `${value?.toLocaleString()} ₫`}
                            parser={(value) => value.replace(/\D/g, "")}
                            onChange={(value) => setCustomerPaid(value)}
                            style={{ width: 120 }}
                          />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "green" }}>
                        <span>Tiền thừa:</span>
                        <span>
                          {customerPaid != null && tienthua(customerPaid, total)}
                        </span>
                      </div>

                    </>
                  }
                  {paymentMethod === "Chuyển khoản" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: "5px" }}>
                      <img src={QR} alt="QR Payment" style={{ width: 100, height: 100, objectFit: "contain" }} />
                      <div style={{ textAlign: "center", fontSize: 14, fontWeight: 500 }}>
                        Tên tài khoản: CaiTiemTapHoa <br />
                        STK: 1010101010
                      </div>
                    </div>
                  )}
                </div>
              </div>

            {/* 3. Footer: nút luôn sát đáy */}
            <div style={{display: "flex",gap: 8,borderTop: "1px solid #f0f0f0",padding: 12,flexShrink: 0}}>                      
              <Button type="default" style={{ flex: 1 }} onClick={() => {setCart([]);setChosenIds([]);}}>Hủy</Button>
              <Button type="primary" style={{ flex: 1 }}>Thanh toán</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/*Model thêm khách hàng mới*/}
      <Modal
        title={"Thêm Khách Hàng Mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={400}
        style={{ top: 100 }}
        closeIcon={false}
      >
        <Form form={form} layout="vertical" autoComplete="off" onFinish={AddNewCustomer}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { max: 250, message: "Họ và tên không quá 250 ký tự" }
              ]}
            >
              <Input placeholder="Nguyễn Văn An" style={{ width: "100%", height: 36 }} />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              validateTrigger="onSubmit"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ (10 số)" }
              ]}
            >
              <Input placeholder="090xxxxxxx" style={{ width: "100%", height: 36 }} maxLength={10} />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: 24, textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Thêm mới</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}