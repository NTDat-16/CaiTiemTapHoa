import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm,DatePicker, Tooltip, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./Promotion.css"
import dayjs from "dayjs";

const { Option } = Select

const mockPromotions = [
    { promo_id: 1, promo_code: 'SALE10', description: 'Giảm 10% cho mọi đơn hàng', discount_type: 'percent', discount_value: 10000, start_date: '2025-10-01', end_date: '2025-10-31', min_order_amount: 100000, usage_limit: 50, used_count: 5, status: 'active' },
    { promo_id: 2, promo_code: 'FREE30K', description: 'Giảm 30.000 VNĐ', discount_type: 'amount', discount_value: 30000, start_date: '2025-11-01', end_date: '2025-11-15', min_order_amount: 200000, usage_limit: 20, used_count: 12, status: 'expired' },
    { promo_id: 3, promo_code: 'NEWUSER50', description: 'Giảm 50% cho khách hàng mới', discount_type: 'percent', discount_value: 5000, start_date: '2025-09-01', end_date: '2025-12-31', min_order_amount: 50000, usage_limit: 100, used_count: 55, status: 'active' },
    { promo_id: 4, promo_code: 'BLACKFRIDAY', description: 'Giảm cố định 50K', discount_type: 'amount', discount_value: 50000, start_date: '2025-11-25', end_date: '2025-11-28', min_order_amount: 300000, usage_limit: 10, used_count: 10, status: 'expired' },
    { promo_id: 5, promo_code: 'TET2026', description: 'Khuyến mãi Tết Nguyên Đán', discount_type: 'percent', discount_value: 1500, start_date: '2026-01-01', end_date: '2026-02-10', min_order_amount: 150000, usage_limit: 75, used_count: 0, status: 'active' },
];



export default function Sale() {
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPromotion, setEditingPromotion] = useState(null)
    const [promotion, setPromotion] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [form] = Form.useForm()


    // Fetch categories from API (currently using mock data)
    const fetchPromotions = async () => {
        setLoading(true)
        try {
          // TODO: Uncomment when API is ready
          // const response = await fetch('/api/products');
          // const data = await response.json();
          // setProducts(data);
    
          // Using mock data for now
          setTimeout(() => {
            setPromotion(mockPromotions)
            setLoading(false)
          }, 500)
        } catch (error) {
          message.error("Lỗi khi tải danh sách sản phẩm")
          setLoading(false)
        }
    }

    useEffect(() => {
        fetchPromotions()
    }, [])

    const columns = [
        {
            title: "ID",
            dataIndex: "promo_id",
            key: "promo_id",
            width: 60,       // hơi rộng hơn một chút cho dễ nhìn
            align: "center",
        },
        {
            title: "Mã KM",
            dataIndex: "promo_code",
            key: "promo_code",
            width: 120,      // mã thường ngắn
            align: "center",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: 220,      // đủ rộng để đọc, vẫn có tooltip
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>,
        },
        {
            title: "Loại",
            dataIndex: "discount_type",
            key: "discount_type",
            width: 120,
            align: "center",
        },
        {
            title: "Giá trị",
            dataIndex: "discount_value",
            key: "discount_value",
            width: 100,
            align: "right",
            render: (discount_value) => discount_value.toLocaleString("vi-VN"),
        },
        {
            title: "Bắt đầu",
            dataIndex: "start_date",
            key: "start_date",
            width: 100,
            align: "center",
        },
        {
            title: "Kết thúc",
            dataIndex: "end_date",
            key: "end_date",
            width: 100,
            align: "center",
        },
        {
            title: "Đơn tối thiểu",
            dataIndex: "min_order_amount",
            key: "min_order_amount",
            width: 120,
            align: "right",
            render: (amount) => amount.toLocaleString("vi-VN"),
        },
        {
            title: "Giới hạn SL",
            dataIndex: "usage_limit",
            key: "usage_limit",
            width: 100,
            align: "center",
        },
        {
            title: "Đã dùng",
            dataIndex: "used_count",
            key: "used_count",
            width: 100,
            align: "center",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 110,
            align: "center",
            render: (status) => (
            <Tag color={status === "active" ? "green" : "red"}>
                {status === "active" ? "Hoạt động" : "Đã khóa"}
            </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 160,
            fixed: "right",
            render: (_, record) => (
            <Space size="small">
                <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
                >
                Sửa
                </Button>
                <Popconfirm
                title="Xóa chương trình"
                description="Bạn có chắc chắn muốn xóa chương trình này?"
                onConfirm={() => handleDelete(record.promo_id)}
                okText="Xóa"
                cancelText="Hủy"
                >
                <Button type="primary" danger icon={<DeleteOutlined />} size="small">
                    Xóa
                </Button>
                </Popconfirm>
            </Space>
            ),
        },
    ];



    // Handle add new product
    const handleAdd = () => {
        setEditingPromotion(null)
        form.resetFields()
        setIsModalOpen(true)
    }

    // Handle edit product
    const handleEdit = (promo) => {
        setEditingPromotion(promo)
        form.setFieldsValue({
            ...promo,
            start_date: promo.start_date ? dayjs(promo.start_date) : null,
            end_date: promo.end_date ? dayjs(promo.end_date) : null,
        })
        setIsModalOpen(true)
    }


    // Handle delete product
    const handleDelete = async (promotionId) => {
        try {
            // TODO: Uncomment when API is ready
            // await fetch(`/api/products/${productId}`, { method: 'DELETE' });

            // Mock delete
            setPromotion(promotion.filter((p) => p.promo_id !== promotionId))
            message.success("Xóa khuyến mãi thành công")
        } catch (error) {
            message.error("Lỗi khi xóa khuyến mãi")
        }
    }

    const handleSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
                end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
            }

            if (editingPromotion) {
                setPromotion(prev =>
                    prev.map(p =>
                        p.promo_id === editingPromotion.promo_id ? { ...p, ...formattedValues } : p
                    )
                );
                message.success("Cập nhật chương trình khuyến mãi thành công");
            } else {
                const newPromo = {
                    promo_id: promotion.length + 1,
                    ...formattedValues,
                    created_at: new Date().toISOString(),
                }
                setPromotion(prev => [...prev, newPromo]);
                message.success("Thêm chương trình khuyến mãi thành công");
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingPromotion(null);
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi lưu chương trình khuyến mãi");
        }
    };


    // Handle modal cancel
    const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields()
        setEditingPromotion(null)
    }

    // filteredPromotions dựa trên searchTerm
    const filteredPromotions = promotion.filter((promo) => {
        if (!searchTerm) return true; // nếu search rỗng, giữ tất cả

        const searchLower = searchTerm.toLowerCase();

        // Lấy các trường cần tìm
        const promoCode = promo.promo_code?.toLowerCase() || "";
        const discountType = promo.discount_type?.toLowerCase() || "";
        const status = promo.status?.toLowerCase() || "";
        const description = promo.description?.toLowerCase() || "";

        // Kiểm tra có khớp với searchTerm không
        return (
            promoCode.includes(searchLower) ||
            discountType.includes(searchLower) ||
            status.includes(searchLower) ||
            description.includes(searchLower)
        );
    });


    const handleSearch = (value) => {
        setSearchTerm(value)
    }

    return (
        <div className="promotion-manage-container">
            <div className="promotion-manage-header">
                <h2 className="promotion-manage-title">Quản lý mã giảm giá</h2>
                <div className="header-actions">
                <Input.Search
                    placeholder="Tìm kiếm theo tên sản phẩm, barcode, giá, đơn vị, danh mục, nhà cung cấp..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="promotion-search-input"
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" className="product-search-btn">
                    Thêm mã giảm giá
                </Button>
                </div>
            </div>

            <div className="promotion-manage-table">
                <Table
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="promo_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} mã giảm giá${searchTerm ? " (đã lọc)" : ""}`,
                    }}
                    scroll={{ y:400, x: 1200 }}
                />
            </div>

            <Modal
                title={editingPromotion ? "Sửa chương trình khuyến mãi" : "Thêm chương trình khuyến mãi mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={700}
                closable={false}
                style={{ top: 70 }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                    <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px", // khoảng cách gọn hơn
                    }}
                    >
                    {/* Cột trái */}
                    <Form.Item
                        label="Mã KM"
                        name="promo_code"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã khuyến mãi" },
                            { max: 50, message: "Mã không quá 50 ký tự" },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input placeholder="Nhập mã khuyến mãi" style={{ height: 36 }} />
                    </Form.Item>

                    <Form.Item
                        label="Loại giảm giá"
                        name="discount_type"
                        rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Select placeholder="Chọn loại" style={{ height: 36 }}>
                        <Select.Option value="percentage">Phần trăm (%)</Select.Option>
                        <Select.Option value="fixed">Giá cố định (VNĐ)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Giá trị"
                        name="discount_value"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá trị giảm" },
                            {
                                validator: (_, value) =>
                                    !value || Number(value) >= 1
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Giá trị phải ≥ 1")),
                            },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input type="number" placeholder="Nhập giá trị giảm" style={{ height: 36 }} />
                    </Form.Item>

                    <Form.Item
                        label="Đơn tối thiểu (VNĐ)"
                        name="min_order_amount"
                        rules={[
                            { required: true, message: "Vui lòng nhập đơn tối thiểu" },
                            {
                                validator: (_, value) =>
                                    !value || Number(value) >= 1
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Giá trị phải ≥ 1")),
                            },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input type="number" placeholder="Nhập đơn tối thiểu" style={{ height: 36 }} />
                    </Form.Item>

                    <Form.Item
                        label="Giới hạn số lượng"
                        name="usage_limit"
                        rules={[
                            { required: true, message: "Vui lòng nhập giới hạn số lượng" },
                            {
                            validator: (_, value) =>
                                !value || Number(value) >= 1
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Giá trị phải ≥ 1")),
                            },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input type="number" placeholder="Nhập giới hạn số lượng" style={{ height: 36 }} />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Select placeholder="Chọn trạng thái" style={{ height: 36 }}>
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Đã khóa</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Mô tả chiếm full 2 cột */}
                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[
                        { required: true, message: "Vui lòng nhập mô tả" },
                        { max: 200, message: "Mô tả không quá 200 ký tự" },
                        ]}
                        style={{ gridColumn: "span 2", marginBottom: 0 }}
                    >
                        <Input.TextArea placeholder="Nhập mô tả chương trình" rows={4} />
                    </Form.Item>

                    {/* Ngày bắt đầu - kết thúc cùng hàng */}
                    <Form.Item
                        label="Ngày bắt đầu"
                        name="start_date"
                        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                        style={{ marginBottom: 0 }}
                        initialValue={dayjs()}
                    >
                        <DatePicker style={{ width: "100%", height: 36 }} format="DD/MM/YYYY" /> 
                    </Form.Item>

                    <Form.Item
                        label="Ngày kết thúc"
                        name="end_date"
                        rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
                        style={{ marginBottom: 0 }}
                    >
                        <DatePicker style={{ width: "100%", height: 36 }} format="DD/MM/YYYY" />
                    </Form.Item>
                    </div>

                    {/* Nút Hủy / Lưu */}
                    <Form.Item style={{ marginTop: 6, textAlign: "right" }}>
                    <Space size={6}>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                        {editingPromotion ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}