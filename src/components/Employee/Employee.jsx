import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Typography } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./Employee.css"

const { Option } = Select
const { Text } = Typography

// Mock data for categories
const mockCategories = [
    { user_id: 1, username: "admin01", full_name: "Nguyễn Văn A", role: "admin", created_at: "2025-10-01" },
    { user_id: 2, username: "admin02", full_name: "Nguyễn Văn A", role: "admin", created_at: "2025-10-01" },
    { user_id: 3, username: "staff01", full_name: "Trần Thị B", role: "staff", created_at: "2025-10-02" },
    { user_id: 4, username: "staff02", full_name: "Lê Văn C", role: "staff", created_at: "2025-10-03" },
    { user_id: 5, username: "admin03", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 6, username: "admin04", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 7, username: "admin05", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 8, username: "admin06", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 9, username: "admin07", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 10, username: "admin08", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 11, username: "admin09", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
    { user_id: 12, username: "admin010", full_name: "Phạm Văn D", role: "admin", created_at: "2025-10-04" },
]


export default function Employee() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [form] = Form.useForm()
    const [previewUsername, setPreviewUsername] = useState("")

    // Fetch products from API (currently using mock data)
    const fetchEmployees = async () => {
        setLoading(true)
        try {
            // TODO: Uncomment when API is ready
            // const response = await fetch('/api/products');
            // const data = await response.json();
            // setCategories(data);

            // Using mock data for now
            setTimeout(() => {
                setEmployees(mockCategories)
                setLoading(false)
            }, 500)
        } catch (error) {
            message.error("Lỗi khi tải danh sách nhân viên")
            setLoading(false)
        }
    }


  useEffect(() => {
    fetchEmployees();
  }, [])

    // Table columns definition
    const columns = [
        {
            title: "Mã nhân viên",
            dataIndex: "user_id",
            key: "user_id",
            width: 120,
            align: "center",
        },
        {
            title: "Họ và Tên",
            dataIndex: "full_name",
            key: "full_name",
            width: 250,
            align: "center",
        },
        {
            title: "Tên đăng nhập",
            dataIndex: "username",
            key: "username",
            width: 220,
            align: "center",
        },
        {
            title: "Chức vụ",
            dataIndex: "role",
            key: "role",
            width: 150,
            align: "center",
            render: (role) => (
            <span
                style={{
                color: role === "admin" ? "#d93025" : "#00796b",
                fontWeight: 600,
                }}
            >
                {role}
            </span>
            ),
        },
        {
            title: "Ngày vào làm",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right",
            align: "center",
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
                title="Xóa nhân viên"
                description="Bạn có chắc chắn muốn xóa nhân viên này?"
                onConfirm={() => handleDelete(record.user_id)}
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
    ]


    // Handle add new product
    const handleAdd = () => {
        setEditingCategory(null)
        form.resetFields()
        setIsModalOpen(true)
    }

    // Handle edit product
    const handleEdit = (product) => {
        setEditingCategory(product)
        form.setFieldsValue(product)
        setIsModalOpen(true)
    }

    // Handle delete product
    const handleDelete = async (employeeId) => {
        try {
            // TODO: Uncomment when API is ready
            // await fetch(`/api/products/${productId}`, { method: 'DELETE' });

            // Mock delete
            setEmployees(employees.filter((p) => p.user_id !== employeeId))
            message.success("Xóa nhân viên thành công")
        } catch (error) {
            message.error("Lỗi khi xóa nhân viên")
        }
    }

    const handleSubmit = async (values) => {
        try {
            if (editingCategory) {
                // Nếu đổi chức vụ → cập nhật lại username
                let newUsername = editingCategory.username;

                if (values.role !== editingCategory.role) {
                    // Đếm số lượng hiện có theo chức vụ mới (bỏ qua chính user đang sửa)
                    const sameRoleUsers = employees.filter(
                    (e) => e.role === values.role && e.user_id !== editingCategory.user_id
                    );

                    const nextIndex = sameRoleUsers.length + 1;
                    const prefix = values.role === "admin" ? "admin" : "staff";
                    newUsername = `${prefix}${nextIndex.toString().padStart(2, "0")}`;
                }

                const updatedEmployees = employees.map((e) =>
                    e.user_id === editingCategory.user_id
                    ? { ...e, ...values, username: newUsername }
                    : e
                );

                setEmployees(updatedEmployees);
                message.success("Cập nhật nhân viên thành công");
            } else {
                // Thêm mới nhân viên
                const newEmployee = {
                    user_id: employees.length + 1,
                    full_name: values.full_name,
                    role: values.role,
                    username: previewUsername,
                    created_at: new Date().toISOString().split("T")[0],
                };
                setEmployees([...employees, newEmployee]);
                message.success("Thêm nhân viên thành công");
            }

            setIsModalOpen(false);
            form.resetFields();
            setPreviewUsername("");
        } catch (error) {
            message.error("Lỗi khi lưu nhân viên");
        }
    };

    // Handle modal cancel
    const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields()
        setEditingEmployee(null)
        setPreviewUsername("")
    }

    const filteredUsers = employees.filter((user) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();

        return (
            user.full_name.toLowerCase().includes(searchLower) ||
            user.username.toLowerCase().includes(searchLower) ||
            user.role.toLowerCase().includes(searchLower)
        );
    });


    const handleSearch = (value) => {
        setSearchTerm(value)
    }

    const generateUsername = (role) => {
        const sameRoleUsers = employees.filter((e) => e.role === role)
        const nextIndex = sameRoleUsers.length + 1
        const prefix = role === "admin" ? "admin" : "staff"
        return `${prefix}${nextIndex.toString().padStart(2, "0")}`
    }

    const handleRoleChange = (value) => {
        const preview = generateUsername(value)
        setPreviewUsername(preview)
        form.setFieldsValue({ role: value })
    }
    return (
        <div className="employee-manage-container">
            <div className="employee-manage-header">
                <h2 className="employee-manage-title">Quản Lý Nhân Viên</h2>
                <div className="header-actions">
                    <Input.Search
                        placeholder="Tìm kiếm theo tên, tên đăng nhập, chức vụ"
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="employee-search-input"
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" className="category-search-btn">
                        Thêm nhân viên
                    </Button>
                </div>
            </div>

            <div className="employee-manage-table">
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="user_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nhân viên${searchTerm ? " (đã lọc)" : ""}`,
                    }}
                scroll={{ y: 420, x: 1200 }}
                />
            </div>

            <Modal
                title={editingCategory ? "Sửa Thông Tin Nhân Viên" : "Thêm Nhân Viên Mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
                closable={false}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                    <Form.Item
                        label="Họ và Tên"
                        name="full_name"
                        rules={[
                        { required: true, message: "Vui lòng nhập tên nhân viên" },
                        { max: 100, message: "Tên nhân viên không quá 100 ký tự" },
                        ]}
                    >
                        <Input placeholder="Nhập tên nhân viên" />
                    </Form.Item>

                    <Form.Item
                        label="Chức vụ"
                        name="role"
                        rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
                    >
                        <Select placeholder="Chọn chức vụ" onChange={handleRoleChange}>
                            <Option value="admin">Quản trị viên</Option>
                            <Option value="staff">Nhân viên</Option>
                        </Select>
                    </Form.Item>

                    {previewUsername && (
                        <div style={{ marginBottom: 12 }}>
                        <Text type="secondary">Tên đăng nhập dự kiến: </Text>
                        <Text strong>{previewUsername}</Text>
                        </div>
                    )}
                    <Form.Item className="form-actions">
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit" className="employee-search-btn">
                                {editingCategory ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}