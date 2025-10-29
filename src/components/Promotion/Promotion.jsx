import { useState, useEffect } from "react";
import { Dropdown, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, DatePicker, Tooltip, Tag } from "antd";
import { FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import "./Promotion.css";
import dayjs from "dayjs";
import axios from "axios"; 
const { Option } = Select;


export default function App() {
    // URL API (Giả định là endpoint Promotions)
    const PROMOTION_API_URL = "http://localhost:5000/api/Promotion";
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        promo_code: '', description: '', discount_type: 'percentage', // Đổi 'percent' thành 'percentage' cho phù hợp với Select.Option
        discount_value: '', start_date: '', end_date: '',
        min_order_amount: '', usage_limit: '', used_count: '0', status: 'active'

    });

    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    
    // THÊM: State và hook cần thiết cho Form của Ant Design
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [currentDiscountType, setCurrentDiscountType] = useState('percentage');
    const [filterType, setFilterType] = useState(null)
    const [filterId, setFilterId] = useState(null)

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
    // Biến tính toán dựa trên state
    const editingPromotion = editingId !== null;
    const searchTerm = search; // Dùng cho pagination message

    // Hàm Lấy Token Xác thực từ LocalStorage (Giữ nguyên)
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };
    const token = getAuthToken();

    const fetchPromotions = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await fetch(`${PROMOTION_API_URL}?pageNumber=${page}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                setErrorMessage("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
                throw new Error("Unauthorized");
            }

        if (!response.ok) {
                const errorDetail = await response.text();
                throw new Error(`Lỗi HTTP! Status: ${response.status}. Chi tiết: ${errorDetail}`);
            }

            const apiResult = await response.json();

            // SỬA LỖI QUAN TRỌNG: Kiểm tra và truy cập vào apiResult.data.items
            if (apiResult.data && Array.isArray(apiResult.data.items)) {
                const mappedPromotions = apiResult.data.items.map(item => ({
                    promo_id: item.promoId,
                    promo_code: item.promoCode,
                    description: item.description,
                    discount_type: item.discountType,
                    discount_value: item.discountValue,
                    start_date: item.startDate,
                    end_date: item.endDate,
                    min_order_amount: item.minOrderAmount,
                    usage_limit: item.usageLimit,
                    used_count: item.usedCount || 0,
                    status: item.status,
                }));
                
                setPromotions(mappedPromotions);
                setPagination({
                    current: apiResult.data.pageNumber || page,
                    pageSize: apiResult.data.pageSize || pageSize,
                    total: apiResult.data.totalCount || apiResult.data.items.length,
                });
            } else {
                console.error("Dữ liệu API trả về không hợp lệ (Thiếu data.items hoặc không phải mảng):", apiResult);
                throw new Error("Dữ liệu nhận được không hợp lệ (Không tìm thấy data.items).");
            }
        } catch (error)  {
            console.error("Lỗi khi tải dữ liệu khuyến mãi:", error);
            setErrorMessage(error.message.includes("Unauthorized") ? errorMessage : "Lỗi khi tải dữ liệu. Hãy kiểm tra console.");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchPromotions();
    }, []);

    // Lọc dữ liệu dựa trên search và filter
    const filteredPromotions = promotions.filter((promo) => {
    // Lọc theo trạng thái nếu có
        if (filterType === "status" && filterId !== null) {
            if (
                (filterId === "Active" && promo.status !== "active") ||
                (filterId === "Inactive" && promo.status !== "inactive")
            ) return false;
        }

        // Lọc theo searchTerm nếu có
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();

        return (
            promo.promo_code?.toLowerCase().includes(searchLower) ||
            promo.description?.toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);


    // Hàm đặt lại form, mở/đóng Modal
    const resetForm = () => {
        setFormData({
            promo_code: '', description: '', discount_type: 'percentage',
            discount_value: '', start_date: '', end_date: '',
            min_order_amount: '', usage_limit: '', used_count: '0', status: 'active'
        });
        setEditingId(null);
        setErrorMessage('');
        form.resetFields(); // Đặt lại form Antd
        setCurrentDiscountType('percentage');
    };

    const handleSearch = (value) => {
        setSearch(value || "");
    }

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // THÊM: Hàm đóng modal và reset form (được gọi bởi onCancel và nút Hủy)
    const handleCancel = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleCloseModal = () => { // Giữ lại hàm này cho tương thích nếu có nơi nào gọi
        handleCancel();
    };

    const onDiscountTypeChange = (value) => {
        setCurrentDiscountType(value);
    };

    /// Hàm gọi API THÊM MỚI hoặc CẬP NHẬT
    // Hàm gọi API THÊM MỚI hoặc CẬP NHẬT
    const handleSubmit = async (values) => {
        setSubmitting(true);
        setErrorMessage('');

        // Khắc phục ReferenceError
        let url = PROMOTION_API_URL;
        let method = 'POST'; 

        if (editingId) {
            url = `${PROMOTION_API_URL}/${editingId}`;
            method = 'PUT';
        }

        // 🌟 ÁNH XẠ DỮ LIỆU ĐÚNG CHUẨN BACKEND (camelCase + Enum Integer)
        const finalData = {
            promoCode: values.promo_code,
            description: values.description,
            discountType: values.discount_type === 'percent' ? "Percent" : "Fixed", 
            startDate: dayjs().startOf('day').add(7, 'hour').toISOString(), // bù +7h cho giờ VN
            endDate: values.end_date ? values.end_date.toISOString() : '', 
            discountValue: Number(values.discount_value),
            minOrderAmount: Number(values.min_order_amount),
            usageLimit: Number(values.usage_limit),
            usedCount: Number(values.used_count || 0), 
            status: values.status,
        };
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(finalData),
            });
            
            // Xử lý lỗi 400 chi tiết
            if (response.status === 400) {
                const errorText = await response.text();
                let errorDetail = {};
                try {
                    errorDetail = JSON.parse(errorText);
                } catch {
                    throw new Error(`Lỗi ${method} API: 400. Chi tiết: ${errorText || response.statusText}`);
                }

                let clientErrorMessage = `Lỗi nhập liệu. Vui lòng kiểm tra lại.`;
                if (errorDetail.errors) {
                    clientErrorMessage += ` Chi tiết: ${Object.values(errorDetail.errors).flat().join('; ')}`;
                }
                throw new Error(`Lỗi ${method} API: 400. ${clientErrorMessage}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi ${method} API: ${response.status}. Chi tiết: ${errorText || response.statusText}`);
            }

            await fetchPromotions();
            handleCloseModal();
            message.success(`Đã ${editingId ? "cập nhật" : "thêm mới"} mã khuyến mãi thành công!`);

        } catch (error) {
            console.error("Lỗi khi gửi form:", error);
            
            const errorMessageToDisplay = error.message.includes("Chi tiết: ") 
                ? error.message.split("Chi tiết: ")[1] 
                : error.message;

            setErrorMessage(error.message);
            message.error(errorMessageToDisplay); 
        } finally {
            setSubmitting(false);
        }
    };

    // Mở Modal và điền dữ liệu cho việc chỉnh sửa
    const handleEdit = (promo) => {
        const initialValues = {
            ...promo,
            start_date: promo.start_date ? dayjs(promo.start_date) : null, 
            end_date: promo.end_date ? dayjs(promo.end_date) : null,
            discountValue: Number(promo.discount_value),
            minOrderAmount: Number(promo.min_order_amount),
            usageLimit: Number(promo.usage_limit),
            usedCount: Number(promo.used_count || 0),
        };
        form.setFieldsValue(initialValues);
        setCurrentDiscountType(promo.discount_type);
        setEditingId(promo.promo_id);
        setIsModalOpen(true);
    };

    // Hàm gọi API XÓA(Chưa dùng)
    const handleDelete = async (id) => {
        setLoading(true);
        setErrorMessage('');
        const token = getAuthToken();

        if (!token) {
            setErrorMessage("Vui lòng Đăng nhập để thực hiện thao tác này.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${PROMOTION_API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lỗi DELETE API: ${response.status}. Chi tiết: ${errorText || response.statusText}`);
            }
            
            await fetchPromotions();
            message.success("Đã xóa mã khuyến mãi thành công!");
            
        } catch (error) {
            console.error("Lỗi khi xóa khuyến mãi:", error);
            setErrorMessage(error.message);
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    //Danh sách các cột của bảng
    const columns = [
        {
            title: 'Mã KM',
            dataIndex: 'promo_code',
            key: 'promo_code',
            sorter: (a, b) => a.promo_code.localeCompare(b.promo_code),
            width: 120,
            fixed: 'left',
        },
        {
            title: 'Giá trị giảm',
            dataIndex: 'discount_value',
            key: 'discount_value',
            width: 150,
            render: (value, record) => {
                const type = record.discount_type;
                if (type === 'percent') {
                    return `${value}%`;
                } else if (type === 'fixed') {
                    return `${value.toLocaleString('vi-VN')} VNĐ`;
                }
                return value;
            },
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 250,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>,
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'min_order_amount',
            key: 'min_order_amount',
            width: 150,
            render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'start_date',
            key: 'start_date',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'end_date',
            key: 'end_date',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Giới hạn',
            dataIndex: 'usage_limit',
            key: 'usage_limit',
            width: 100,
            render: (limit, record) => `${record.used_count}/${limit}`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            fixed: 'right',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'CÒN HẠN' : 'HẾT HẠN'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button
                            className="btn-edit"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        >
                            Sửa
                        </Button>
                    </Tooltip>
                    {/* <Popconfirm
                        title="Bạn có chắc chắn?"
                        description={`Bạn muốn xóa mã ${record.promo_code}?`}
                        onConfirm={() => handleDelete(record.promo_id)}
                        okText="Có"
                        cancelText="Không"
                    >
                       <Tooltip title="Xóa">
                            <Button
                                className="btnDelete"
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            >
                                Xóa
                            </Button>
                        </Tooltip>
                    </Popconfirm> */}
                </Space>
            ),
        },
    ];

    const handleFilterByStatus = (status) => {
        setFilterType("status");
        setFilterId(status);
        message.success(`Đang lọc theo trạng thái: ${status === "Active" ? "Còn hạn" : "Hết hạn"}`);
    };

    const handleClearFilter = () => {
        setFilterType(null)
        setFilterId(null)
        message.info("Đã xóa bộ lọc")
    };

    const filterMenuItems = [
        {
            key: "status",
            label: "Lọc theo trạng thái",
            children: [
                {
                key: "status-active",
                label: "Còn hạn",
                onClick: () => handleFilterByStatus("Active"),
                },
                {
                key: "status-inactive",
                label: "Hết hạn",
                onClick: () => handleFilterByStatus("Inactive"),
                },
            ],
        },
        {
            type: "divider",
        },
        {
            key: "clear",
            label: "Xóa bộ lọc",
            onClick: handleClearFilter,
            disabled: filterType === null,
        },
    ];

    const getFilterDisplayName = () => {
        if (!filterType || filterId === null) return "Lọc";

        if (filterType === "status") {
        return filterId === "Active" ? "Lọc: Còn hạn" : "Lọc: Hết hạn";
        }

        return "Lọc";
    };
    return (
        <div className="promotion-manage-container">
            {/* Thanh tìm kiếm và nút thêm mới */}
            <div className="promotion-manage-header">
                <h2 className="promotion-manage-title">Quản Lý Mã Khuyến Mãi</h2>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input.Search
                            placeholder="Tìm kiếm theo mã, loại, trạng thái, mô tả..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            onChange={(e) => setSearch(e.target.value)}
                            className="promotion-search-input"
                        />
                        <Dropdown
                            menu={{ items: filterMenuItems }}
                            trigger={["click"]}
                            placement="bottomLeft"
                        >
                            <Button
                                icon={<FilterOutlined />}
                                size="large"
                                className="filter-button"
                                type={filterType ? "primary" : "default"}
                            >
                                {getFilterDisplayName()}
                            </Button>
                        </Dropdown>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal} size="large" className="product-search-btn">
                        Thêm mã giảm giá
                    </Button>
                </div>
            </div>

            {/* Bảng hiển thị danh sách khuyến mãi */}
            <div className="promotion-manage-table">
                <Table
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="promo_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => (
                        <span>
                            Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> mã khuyến mãi
                        </span>
                        ),
                    }}
                    scroll={{ y: 400, x: 1200 }}
                    onChange={(pagination) => {
                        fetchPromotions(pagination.current, pagination.pageSize);
                    }}
                />
            </div>

            {/* Modal Thêm/Sửa khuyến mãi */}
            {/* SỬA: form={form} và onFinish={handleSubmit} được truyền đúng cách */}
            <Modal
                title={editingPromotion ? "Sửa Chương Trình Khuyến Mãi" : "Thêm Chương Trình Khuyến Mãi Mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={700}
                closable={false} 
                maskClosable={!submitting} 
                style={{ top: 70 }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off"
                    initialValues={{ discount_type: 'percent', status: 'active', used_count: '0' }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                        }}
                    >
                        {/* Các trường nhập liệu */}
                        <Form.Item
                            label="Mã KM"
                            name="promo_code"
                            rules={[
                                { required: true, message: "Vui lòng nhập mã khuyến mãi" },
                                { 
                                    pattern: /^[A-Z0-9_-]+$/, 
                                    message: "Chỉ được chứa chữ in hoa, số, gạch dưới (_) và gạch ngang (-)" 
                                },
                                { max: 50, message: "Mã không quá 50 ký tự" },
                            ]}
                            style={{ marginBottom: 0}}
                        >
                            <Input 
                                placeholder="Nhập mã khuyến mãi" 
                                style={{ height: 36 }}
                                onChange={(e) => {
                                    form.setFieldsValue({
                                        promo_code: e.target.value.toUpperCase()
                                    });
                                }}  
                            />
                        </Form.Item>

                        <Form.Item
                            label="Loại giảm giá"
                            name="discount_type"
                            rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select 
                                placeholder="Chọn loại" 
                                style={{ height: 36 }}
                                onChange={onDiscountTypeChange} // THÊM: Hàm này để cập nhật `currentDiscountType`
                                getPopupContainer={(trigger) => trigger.parentNode}
                            >
                                <Option value="percent">Phần trăm (%)</Option>
                                <Option value="fixed">Giá cố định (VNĐ)</Option>
                            </Select>
                        </Form.Item>

                        {/* Sử dụng `currentDiscountType` để hiển thị `addonAfter` chính xác */}
                        <Form.Item
                            label="Giá trị"
                            name="discount_value"
                            rules={[
                                { required: true, message: "Vui lòng nhập giá trị giảm" },
                                {
                                    validator: (_, value) => {
                                        if (!value || isNaN(Number(value))) return Promise.resolve();
                                        const numValue = Number(value);
                                        const type = form.getFieldValue('discount_type'); 

                                        // Yêu cầu chung: Phải lớn hơn 0 (theo lỗi API)
                                        if (numValue <= 0) {
                                            return Promise.reject(new Error("Giá trị giảm giá phải lớn hơn 0"));
                                        }

                                        if (type === 'percentage') {
                                            if (numValue >= 1 && numValue <= 100 && Number.isInteger(numValue)) return Promise.resolve();
                                                return Promise.reject(new Error("Phần trăm phải là số nguyên từ 1 đến 100"));
                                        } else if (type === 'fixed') {
                                            // Đã được bao gồm trong điều kiện numValue > 0
                                            if (Number.isInteger(numValue)) return Promise.resolve();
                                                return Promise.reject(new Error("Giá trị cố định phải là số nguyên"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            {/* SỬA: Sử dụng state `currentDiscountType` */}
                            <Input 
                                type="number" 
                                placeholder="Nhập giá trị giảm" 
                                style={{ height: 36 }} 
                                addonAfter={currentDiscountType === 'percentage' ? '%' : (currentDiscountType === 'fixed' ? 'VNĐ' : '')}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Đơn tối thiểu (VNĐ)"
                            name="min_order_amount"
                            rules={[
                                { required: true, message: "Vui lòng nhập đơn tối thiểu" },
                                {
                                    validator: (_, value) =>
                                        !value || (Number(value) >= 0 && Number.isInteger(Number(value)))
                                            ? Promise.resolve()
                                            : Promise.reject(new Error("Giá trị phải là số nguyên ≥ 1")),
                                },
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input type="number" placeholder="Nhập đơn tối thiểu" style={{ height: 36 }} addonAfter="VNĐ"/>
                        </Form.Item>

                        <Form.Item
                            label="Giới hạn số lượng"
                            name="usage_limit"
                            rules={[
                                { required: true, message: "Vui lòng nhập giới hạn số lượng" },
                                {
                                    validator: (_, value) =>
                                        !value || (Number(value) >= 1 && Number.isInteger(Number(value)))
                                            ? Promise.resolve()
                                            : Promise.reject(new Error("Giá trị phải là số nguyên ≥ 1")),
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
                            <Select placeholder="Chọn trạng thái" style={{ height: 36 }} getPopupContainer={(trigger) => trigger.parentNode}>
                                <Option value="active">Còn Hạn</Option>
                                <Option value="inactive">Hết Hạn</Option>
                            </Select>
                        </Form.Item>

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

                        <Form.Item
                            label="Ngày bắt đầu"
                            name="start_date"
                            style={{ marginBottom: 0 }}
                            initialValue={dayjs()}
                        >
                            <DatePicker
                                getPopupContainer={(trigger) => trigger.parentNode}
                                style={{ width: "100%", height: 36 }}
                                format="DD/MM/YYYY"
                                disabled
                            />
                        </Form.Item>


                        <Form.Item
                            label="Ngày kết thúc"
                            name="end_date"
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày kết thúc" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startDate = getFieldValue('start_date');
                                        if (!value || !startDate) {
                                            return Promise.resolve();
                                        }
                                        if (value.isSame(startDate, 'day') || value.isAfter(startDate, 'day')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày kết thúc phải sau hoặc cùng ngày bắt đầu!'));
                                    },
                                }),
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            <DatePicker getPopupContainer={(trigger) => trigger.parentNode} style={{ width: "100%", height: 36 }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>

                    {/* Nút Hủy / Lưu */}
                    <Form.Item style={{ marginTop: 20, textAlign: "right" }}>
                        <Space size={6}>
                            <Button onClick={handleCancel} disabled={submitting}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingPromotion ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}