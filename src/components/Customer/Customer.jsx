import { useState, useEffect, useCallback } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tooltip } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./Customer.css"

const { Option } = Select

// Dữ liệu giả lập
const mockCustomersData = [
    { customer_id: 1, name: "Nguyễn Văn An", phone: "0901234567", email: "an.nguyen@example.com", address: "123 Nguyễn Trãi, Phường Đồng Xuân, Quận Hoàn Kiếm, Thành phố Hà Nội", created_at: "2025-10-01" },
    { customer_id: 2, name: "Trần Thị Bình", phone: "0901234568", email: "binh.tran@example.com", address: "456 Lê Lợi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh", created_at: "2025-10-01" },
]

// Hàm giả lập API (Đã sửa lại logic ID: dùng ID từ data truyền vào thay vì Date.now())
const fetchCustomersAPI = async () => new Promise(resolve => setTimeout(() => resolve(mockCustomersData), 500));
const createCustomerAPI = async (data) => new Promise(resolve => setTimeout(() => resolve({ ...data, created_at: new Date().toISOString() }), 300));
const updateCustomerAPI = async (id, data) => new Promise(resolve => setTimeout(() => resolve({ customer_id: id, ...data }), 300));
const deleteCustomerAPI = async (id) => new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));


export default function Customer() {
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [customers, setCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [form] = Form.useForm()

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

    // --- Fetch khách hàng ---
    const fetchCustomers = async () => {
        setLoading(true)
        try {
            const data = await fetchCustomersAPI()
            setCustomers(data)
        } catch (error) {
            message.error("Lỗi khi tải danh sách khách hàng")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
        fetchProvinces()
    }, [fetchProvinces])

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

        // Phân tích địa chỉ: "Số nhà/Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
        const parts = customer.address.split(",").map(p => p.trim())
        const house = parts[0] || ""
        const wardName = parts[1] || ""
        const districtName = parts[2] || ""
        const provinceName = parts[3] || ""
        
        // Dùng useEffect hoặc setTimeout để đảm bảo provinces đã load xong
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
                email: customer.email,
                house,
                province: provinceCode,
                district: districtCode,
                ward: wardCode,
            })
        }, 0)
    }

    const handleDelete = async (customerId) => {
        setLoading(true)
        try {
            await deleteCustomerAPI(customerId)
            setCustomers(prev => prev.filter(c => c.customer_id !== customerId))
            message.success("Xóa khách hàng thành công")
        } catch (error) {
            message.error("Lỗi khi xóa khách hàng")
        } finally {
            setLoading(false)
        }
    }

    // --- Sửa lỗi ID tự tăng ---
    const handleSubmit = async (values) => {
        try {
            const provinceName = provinces.find(p => p.code === values.province)?.name || ''
            const districtName = districts.find(d => d.code === values.district)?.name || ''
            const wardName = wards.find(w => w.code === values.ward)?.name || ''
            const fullAddress = `${values.house}, ${wardName}, ${districtName}, ${provinceName}`

            let customerData = {
                ...values,
                address: fullAddress,
                created_at: editingCustomer ? editingCustomer.created_at : new Date().toISOString()
            }

            if (editingCustomer) {
                // Cập nhật
                const updatedCustomer = await updateCustomerAPI(editingCustomer.customer_id, customerData)
                setCustomers(prev => prev.map(c => c.customer_id === editingCustomer.customer_id ? updatedCustomer : c))
                message.success("Cập nhật khách hàng thành công")
            } else {
                // Thêm mới
                // 1. Tính toán ID mới
                const maxId = customers.length > 0 ? Math.max(...customers.map(c => c.customer_id)) : 0
                const newId = maxId + 1

                // 2. Gán ID mới vào data trước khi gọi API giả lập
                customerData = { ...customerData, customer_id: newId } 
                
                // 3. Gọi API giả lập (đã sửa API giả lập để dùng ID này)
                const newCustomer = await createCustomerAPI(customerData) 
                
                setCustomers(prev => [...prev, newCustomer])
                message.success("Thêm khách hàng mới thành công")
            }

            form.resetFields()
            setEditingCustomer(null)
            setIsModalOpen(false)
        } catch (error) {
            message.error("Lỗi khi lưu khách hàng")
            console.error(error)
        }
    }


    const handleCancel = () => {
        form.resetFields()
        setEditingCustomer(null)
        setDistricts([])
        setWards([])
        setSelectedProvince(null)
        setSelectedDistrict(null)
        setIsModalOpen(false)
    }

    const handleSearch = (value) => {
        setSearchTerm(value)
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
        if (!searchTerm) return true
        const lower = searchTerm.toLowerCase()
        return c.name?.toLowerCase().includes(lower) || c.phone?.includes(lower) || c.email?.toLowerCase().includes(lower)
    })

    const columns = [
        { title: "ID", dataIndex: "customer_id", key: "customer_id", width: 60, align: "center" },
        { title: "Họ và tên", dataIndex: "name", key: "name", width: 150 },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: 120, align: "center" },
        { title: "Email", dataIndex: "email", key: "email", width: 180 },
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
        { title: "Ngày tạo", dataIndex: "created_at", key: "created_at", width: 120, align: "center", render: (text) => text ? new Date(text).toLocaleDateString("vi-VN") : "N/A" },
        {
            title: "Thao tác",
            key: "action",
            width: 160,
            fixed: "right",
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Xóa khách hàng?" onConfirm={() => handleDelete(record.customer_id)} okText="Xóa" cancelText="Hủy">
                        <Button type="primary" danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div className="customer-manage-container">
            <div className="customer-manage-header">
                <h2 className="customer-manage-title">Quản Lý Khách Hàng</h2>
                <div className="header-actions">
                    <Input.Search placeholder="Tìm kiếm theo tên, số điện thoại, email..." allowClear enterButton={<SearchOutlined />} size="large" onSearch={handleSearch} className="customer-search-input" />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" className="product-search-btn">Thêm khách hàng</Button>
                </div>
            </div>

            <div className="customer-manage-table">
                <Table columns={columns} dataSource={filteredCustomers} rowKey="customer_id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `Tổng ${total} khách hàng${searchTerm ? " (đã lọc)" : ""}` }} scroll={{ y:420, x: 1200 }} />
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

                        <Form.Item label="Số nhà/Đường" name="house" rules={[{ required: true, message: "Vui lòng nhập số nhà/đường" }, { max: 250, message: "Số nhà/đường không quá 250 ký tự" }]} style={{ marginBottom: 16, gridColumn: "span 2" }}>
                            <Input placeholder="Số nhà, tên đường/ấp/khu phố..." style={{ width: "100%", height: 36 }} />
                        </Form.Item>
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