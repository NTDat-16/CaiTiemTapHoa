import { useState, useEffect, useCallback } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tooltip,Tag, Dropdown } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,FilterOutlined  } from "@ant-design/icons"
import "./Customer.css"

const { Option } = Select

export default function Customer() {
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [customers, setCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [form] = Form.useForm()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filterType, setFilterType] = useState(null)
    const [filterId, setFilterId] = useState(null)

    // --- Địa chỉ Việt Nam API ---
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [selectedProvince, setSelectedProvince] = useState(null)
    const [selectedDistrict, setSelectedDistrict] = useState(null)

    const fetchProvinces = useCallback(async () => {
        try {
            const res = await fetch("https://provinces.open-api.vn/api/p/")
            const data = await res.json()
            setProvinces(data)
        } catch (error) {
            message.error("Lỗi khi tải tỉnh/thành phố")
            console.error(error)
        }
    }, [])

    const fetchDistricts = async (provinceCode) => {
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            const data = await res.json()
            setDistricts(data.districts || [])
            return data.districts || []
        } catch (error) {
            message.error("Lỗi khi tải quận/huyện")
            console.error(error)
            return []
        }
    }

    const fetchWards = async (districtCode) => {
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            const data = await res.json()
            setWards(data.wards || [])
            return data.wards || []
        } catch (error) {
            message.error("Lỗi khi tải phường/xã")
            console.error(error)
            return []
        }
    }

    // --- Fetch khách hàng từ API thực tế ---
    const fetchCustomers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/Customer?pageNumber=${page}&pageSize=${pageSize}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            const data = await res.json();
            if (!data || !data.data) throw new Error("Phản hồi từ API không hợp lệ");

            const items = (data.data.items || []).map(c => ({
                ...c,
                customerId: Number(c.customerId)
            }));

            setCustomers(items);
            setPagination({
                current: data.data.pageNumber || page,
                pageSize: data.data.pageSize || pageSize,
                total: data.data.totalCount || items.length
            });
        } catch (error) {
            message.error("Lỗi khi tải danh sách khách hàng: " + error.message);
            console.error(error);
        } finally {
            setTimeout(() => {
            setLoading(false);
            }, 1000);
        }
    };

    useEffect(() => {
        fetchCustomers(pagination.current, pagination.pageSize);
    }, []);

    useEffect(() => {
        fetchProvinces()
    }, [fetchProvinces])

    const handleTableChange = (pag) => {
        fetchCustomers(pag.current, pag.pageSize);
    };

    // --- Handlers ---
    const handleAdd = () => {
        setEditingCustomer(null)
        form.resetFields()
        setDistricts([])
        setWards([])
        setSelectedProvince(null)
        setSelectedDistrict(null)
        setIsModalOpen(true)
    }

    const handleEdit = (customer) => {
        setEditingCustomer(customer)
        setIsModalOpen(true)

        const addressStr = customer.address || "";
        const parts = addressStr.split(",").map(p => p.trim());
        const house = parts[0] || "";
        const wardName = parts[1] || "";
        const districtName = parts[2] || "";
        const provinceName = parts[3] || "";
        
        setTimeout(async () => {
            const provinceObj = provinces.find(p => p.name === provinceName)
            const provinceCode = provinceObj?.code
            setSelectedProvince(provinceCode)
            
            let districtCode, wardCode

            if (provinceCode) {
                const fetchedDistricts = await fetchDistricts(provinceCode)
                const districtObj = fetchedDistricts.find(d => d.name === districtName)
                districtCode = districtObj?.code
                setSelectedDistrict(districtCode)
            }

            if (districtCode) {
                const fetchedWards = await fetchWards(districtCode)
                const wardObj = fetchedWards.find(w => w.name === wardName)
                wardCode = wardObj?.code
            }

            form.setFieldsValue({
                name: customer.name,
                phone: customer.phone,
                email: customer.email || "",
                house ,
                province: provinceCode || "",
                district: districtCode || "",
                ward: wardCode || "",
                status: customer.status,
            })
        }, 0)
    }

    const handleDelete = async (customerId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/Customer/${customerId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            // Kiểm tra phản hồi
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Xóa khách hàng thất bại");
            }

            setCustomers((prev) => prev.filter((p) => p.customerId !== customerId));
            setPagination((prev) => ({
              ...prev,
              total: prev.total > 0 ? prev.total - 1 : 0,
            }));
            message.success("Xóa khách hàng thành công");
        } catch (error) {
            message.error("Lỗi khi xóa khách hàng");
        }
    };

    const handleSubmit = async (values) => {
        try {
            const { name, email, phone, house, ward, district, province, status } = values;

            const isDuplicateName = customers.some(
                c => c.name.toLowerCase().trim() === name.toLowerCase().trim() &&
                    (!editingCustomer || c.customerId !== editingCustomer.customerId)
            );

            if (isDuplicateName) {
                form.setFields([
                    {
                        name: "name",
                        errors: ["Tên khách hàng đã tồn tại! Vui lòng nhập tên khác!"]
                    }
                ]);
                return;
            }

            const provinceName = provinces.find(p => p.code === province)?.name || '';
            const districtName = districts.find(d => d.code === district)?.name || '';
            const wardName = wards.find(w => w.code === ward)?.name || '';
            const fullAddress = `${house}, ${wardName}, ${districtName}, ${provinceName}`;

            if (!editingCustomer || (editingCustomer && email !== editingCustomer.email)) {
                const emailRes = await fetch(`http://localhost:5000/api/Customer/check-email/${email}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                const emailData = await emailRes.json();
                if (!emailRes.ok || emailData.exists) {
                    form.setFields([{ name: "email", errors: ["Email đã tồn tại!"] }]);
                    return;
                }
            }

            if (!editingCustomer || (editingCustomer && phone !== editingCustomer.phone)) {
                const phoneRes = await fetch(`http://localhost:5000/api/Customer/check-phone/${phone}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                const phoneData = await phoneRes.json();
                if (!phoneRes.ok || phoneData.exists) {
                    form.setFields([{ name: "phone", errors: ["Số điện thoại đã tồn tại!"] }]);
                    return;
                }
            }

            let customerData = {
                ...values,
                address: fullAddress,
                status: editingCustomer ? values.status : "Active",
                created_at: editingCustomer ? editingCustomer.created_at : new Date().toISOString()
            };

            if (editingCustomer) {
                const response = await fetch(`http://localhost:5000/api/Customer/${editingCustomer.customerId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(customerData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Cập nhật khách hàng thất bại");
                }

                const updatedCustomer = await response.json();
                setCustomers(prev =>
                    prev.map(c => c.customerId === editingCustomer.customerId ? updatedCustomer.data || updatedCustomer : c)
                );
                message.success("Cập nhật khách hàng thành công");
            } else {
                const response = await fetch("http://localhost:5000/api/Customer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(customerData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Thêm khách hàng thất bại");
                }

                const result = await response.json();
                const newCustomer = result.data || result;
                const newTotal = pagination.total + 1;
                const lastPage = Math.ceil(newTotal / pagination.pageSize);
                setCustomers(prev => [...prev, newCustomer]);
                setPagination((prev) => ({
                    ...prev,
                    total: prev.total + 1,
                    current: lastPage,
                }));
                fetchCustomers(lastPage, pagination.pageSize);
                message.success("Thêm khách hàng thành công");
            }

            form.resetFields();
            setEditingCustomer(null);
            setIsModalOpen(false);

        } catch (error) {
            message.error(error.message || "Lỗi khi lưu khách hàng");
            console.error(error);
        }
    };

    const handleCancel = () => {
        form.resetFields()
        setEditingCustomer(null)
        setDistricts([])
        setWards([])
        setSelectedProvince(null)
        setSelectedDistrict(null)
        setIsModalOpen(false)
    }

    const handleProvinceChange = (value) => {
        setSelectedProvince(value)
        form.setFieldsValue({ district: undefined, ward: undefined })
        setDistricts([])
        setWards([])
        setSelectedDistrict(null)
        if (value) fetchDistricts(value)
    }

    const handleDistrictChange = (value) => {
        setSelectedDistrict(value)
        form.setFieldsValue({ ward: undefined })
        setWards([])
        if (value) fetchWards(value)
    }

    const filteredCustomers = customers.filter(c => {
        // Lọc theo trạng thái
        if (filterType === "status" && filterId !== null) {
            if (c.status !== filterId) return false;
        }

        // Tìm kiếm theo tên, username, email hoặc số điện thoại
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            if (
            !c.fullName?.toLowerCase().includes(lower) &&
            !c.username?.toLowerCase().includes(lower) &&
            !c.name?.toLowerCase().includes(lower) &&
            !c.phone?.includes(lower) &&
            !c.email?.toLowerCase().includes(lower)
            ) {
            return false;
            }
        }

        return true; // Nếu không bị lọc bỏ thì giữ lại
    });

    
    const handleSearch = (value) => {
        setSearchTerm(value)
    }

    const columns = [
        { title: "ID", dataIndex: "customerId", key: "customerId", width: 60, align: "center" },
        { title: "Họ và tên", dataIndex: "name", key: "name", width: 150 },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: 120, align: "center" },
        { title: "Email", dataIndex: "email", key: "email", width: 150 },
        {
            title: "Địa chỉ",
            key: "address",
            width: 250,
            dataIndex: "address",
            render: (text) => (
                <Tooltip title={text}>
                    {text && text.length > 30 ? `${text.substring(0, 30)}...` : text}
                </Tooltip>
            )
        },
        
        { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", width: 120, align: "center", render: (text) => text ? new Date(text).toLocaleDateString("vi-VN") : "N/A" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            align: "center",
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status === 'Active' ? 'CÒN MUA HÀNG' : 'NGỪNG MUA HÀNG'}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 160,
            fixed: "right",
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Button className="btn-edit" type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Xóa khách hàng?" onConfirm={() => handleDelete(record.customerId)} okText="Xóa" cancelText="Hủy">
                        <Button type="primary" danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    const handleStatusChange = async (value) => {
        form.setFieldValue("status", value);
    };

    const handleFilterByStatus = (status) => {
        setFilterType("status");
        setFilterId(status);
        message.success(`Đang lọc theo trạng thái: ${status === "Active" ? "Còn mua hàng" : "Ngừng mua hàng"}`);
    };

    const handleClearFilter = () => {
        setFilterType(null)
        setFilterId(null)
        message.info("Đã xóa bộ lọc")
    }

    const filterMenuItems = [
        {
            key: "status",
            label: "Lọc theo trạng thái",
            children: [
                {
                    key: "status-active",
                    label: "Còn mua hàng",
                    onClick: () => handleFilterByStatus("Active"),
                },
                {
                    key: "status-inactive",
                    label: "Ngừng mua hàng",
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
            return filterId === "Active" ? "Lọc: Còn mua hàng" : "Lọc: Ngừng mua hàng";
        }

        return "Lọc";
    };

    return (
        <div className="customer-manage-container">
            <div className="customer-manage-header">
                <h2 className="customer-manage-title">Quản Lý Khách Hàng</h2>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input.Search 
                            placeholder="Tìm kiếm theo tên, số điện thoại, email..." 
                            allowClear 
                            enterButton={<SearchOutlined />} 
                            size="large" 
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="customer-search-input" 
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" className="product-search-btn">Thêm khách hàng</Button>
                </div>
            </div>

            <div className="customer-manage-table">
                <Table
                    columns={columns}
                    dataSource={filteredCustomers}
                    rowKey="customerId"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => (
                            <span>
                                Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> khách hàng
                            </span>
                        ),
                    }}
                    scroll={{ y:420, x: 1200 }}
                    onChange={handleTableChange}
                />
            </div>

            <Modal title={editingCustomer ? "Sửa Thông Tin Khách Hàng" : "Thêm Khách Hàng Mới"} open={isModalOpen} onCancel={handleCancel} footer={null} width={720} closable={false} style={{ top: 100 }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }, { max: 250, message: "Họ và tên không quá 250 ký tự" }]} style={{ marginBottom: 16 }}>
                            <Input placeholder="Nguyễn Văn An" style={{ width: "100%", height: 36 }} />
                        </Form.Item>

                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }, { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ (10 số)" }]} style={{ marginBottom: 16 }}>
                            <Input placeholder="090xxxxxxx" style={{ width: "100%", height: 36 }} maxLength={10} />
                        </Form.Item>

                        <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email không hợp lệ" }, { max: 250, message: "Email không quá 250 ký tự" }]} style={{ marginBottom: 16 }}>
                            <Input placeholder="email@example.com" style={{ width: "100%", height: 36 }} />
                        </Form.Item>

                        <Form.Item label="Tỉnh/Thành phố" name="province" rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]} style={{ marginBottom: 16 }}>
                            <Select placeholder="Chọn tỉnh/thành phố" style={{ width: "100%", height: 36 }} value={selectedProvince} onChange={handleProvinceChange}>
                                {provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Quận/Huyện" name="district" rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]} style={{ marginBottom: 16 }}>
                            <Select placeholder="Chọn quận/huyện" style={{ width: "100%", height: 36 }} value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince}>
                                {districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]} style={{ marginBottom: 16 }}>
                            <Select placeholder="Chọn phường/xã" style={{ width: "100%", height: 36 }} disabled={!selectedDistrict}>
                                {wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Số nhà/Đường" name="house" rules={[{ required: true, message: "Vui lòng nhập số nhà/đường" }, { max: 250, message: "Số nhà/đường không quá 250 ký tự" }]} style={{ marginBottom: 16, gridColumn: editingCustomer ? "span 1" : "span 2" }}>
                            <Input placeholder="Số nhà, tên đường/ấp/khu phố..." style={{ width: "100%", height: 36 }} />
                        </Form.Item>
                        {editingCustomer && 
                        <Form.Item
                            label="Trạng thái"
                            name="status"
                        >
                            <Select
                                placeholder="Trạng thái"
                                onChange={handleStatusChange}
                            >
                                <Option value="Inactive">Ngừng Mua Hàng</Option>
                                <Option value="Active">Còn Mua Hàng</Option>
                            </Select>
                        </Form.Item>}
                    </div>

                    <Form.Item style={{ marginTop: 24, textAlign: "right", marginBottom: 0 }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">{editingCustomer ? "Cập nhật" : "Thêm mới"}</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}