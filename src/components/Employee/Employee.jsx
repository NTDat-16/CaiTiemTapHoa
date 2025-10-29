import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    message,
    Popconfirm,
    Typography,
    Tooltip,
    Tag,
    Dropdown
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined
} from "@ant-design/icons";
import "./Employee.css";

const { Option } = Select;
const { Text } = Typography;

export default function Employee() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filterType, setFilterType] = useState(null)
    const [filterId, setFilterId] = useState(null)

    // Load dữ liệu nhân viên
    const fetchEmployees = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/Users?pageNumber=${page}&pageSize=${pageSize}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            let items = [];
            if (Array.isArray(data)) {
                items = data;
            } else if (Array.isArray(data?.data)) {
                items = data.data;
            } else if (Array.isArray(data?.data?.items)) {
                items = data.data.items;
            } else {
                throw new Error("Phản hồi từ server không hợp lệ");
            }

            const mapped = items
                //.filter((u) => u.status?.toLowerCase() === "Deleted")
                .map((u) => ({
                    ...u,
                    userId: Number(u.userId),
                }));

            setEmployees(mapped);

            setPagination({
                current: data.data?.pageNumber || page,
                pageSize: data.data?.pageSize || pageSize,
                total: data.data?.totalCount || mapped.length,
            });
        } catch (error) {
            message.error("Lỗi khi tải danh sách nhân viên: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (pag) => {
        fetchEmployees(pag.current, pag.pageSize);
    };

    // Danh sách các cột
    const columns = [
        {title: "Mã NV",dataIndex: "userId",key: "userId",width: 80,align: "center",},
        {title: "Họ và Tên",dataIndex: "fullName",key: "fullName",width: 300,align: "center",},
        {title: "Tên đăng nhập",dataIndex: "username",key: "username",width: 180,align: "center",},
        {title: "Chức vụ",dataIndex: "role",key: "role",width: 150,align: "center",
            render: (role) => (
                <span
                    style={{
                        color: role === "Admin" ? "#d93025" : "#00796b",
                        fontWeight: 600,
                    }}
                >
                    {role === "Admin" ? "Quản trị viên" : "Nhân viên"}
                </span>
            ),
        },
        {title: "Ngày vào làm",dataIndex: "createdAt",key: "createdAt",width: 170,align: "center",
            render: (date) => {
                if (!date) return "-";
                const d = new Date(date);
                const day = d.getDate().toString().padStart(2, "0");
                const month = (d.getMonth() + 1).toString().padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            },
        },
        {title: "Trạng thái",dataIndex: "status",key: "status",width: 150,align: "center",
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {status === 'Active' ? 'ĐANG LÀM VIỆC' : 'TẠM NGHỈ'}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right",
            align: "center",
            render: (_, record) => {
                const isAdmin = record.username === "admin";

                return (
                <Space size="small">
                    <Tooltip
                    title={
                        isAdmin
                        ? "Tài khoản admin bị khóa, không thể sửa"
                        : "Sửa thông tin"
                    }
                    >
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                        className="btn-edit"
                        disabled={isAdmin}
                    >
                        Sửa
                    </Button>
                    </Tooltip>

                    <Tooltip
                    title={
                        isAdmin
                        ? "Tài khoản admin bị khóa, không thể xóa"
                        : "Xóa nhân viên"
                    }
                    >
                    <Popconfirm
                        title="Xóa nhân viên"
                        description="Bạn có chắc chắn muốn xóa nhân viên này?"
                        onConfirm={() => handleDelete(record.userId)}
                        okText="Xóa"
                        cancelText="Hủy"
                        disabled={isAdmin}
                    >
                        <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        disabled={isAdmin}
                        >
                        Xóa
                        </Button>
                    </Popconfirm>
                    </Tooltip>
                </Space>
                );
            },
        }

    ];

    // Sự kiện thêm nhân viên
    const handleAdd = () => {
        setEditingEmployee(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // Sự kiện sửa nhân viên
    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        form.setFieldsValue(employee);
        setIsModalOpen(true);
    };

    // Xóa nhân viên
    const handleDelete = async (employeeId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/Users/${employeeId}`,
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
                throw new Error(data.message || "Xóa nhân viên thất bại");
            }

            setEmployees((prev) => prev.filter((p) => p.userId !== employeeId));
            setPagination((prev) => ({
              ...prev,
              total: prev.total > 0 ? prev.total - 1 : 0,
            }));
            message.success("Xóa nhân viên thành công");
        } catch (error) {
            message.error("Lỗi khi xóa nhân viên");
        }
    };

    // Thêm hoặc sửa nhân viên
    const handleSubmit = async (values) => {
        try {
            const { fullName, role, status } = values;

            if (editingEmployee) {

                const dataUpdate = {
                    fullName,
                    role,
                    status: status || editingEmployee.status,
                };

                const response = await fetch(
                    `http://localhost:5000/api/Users/${editingEmployee.userId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify(dataUpdate),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Cập nhật nhân viên thất bại");
                }

                const updated = employees.map((e) =>
                    e.userId === editingEmployee.userId
                        ? { ...e, fullName, role, status }
                        : e
                );
                setEmployees(updated);
                message.success("Cập nhật nhân viên thành công");
            } else {
                const previewUsername = await generateUsername();
                const employeeToAdd = {
                    fullName,
                    userName: previewUsername,
                    password: "123456",
                    role,
                    status: "Active",
                };

                const response = await fetch("http://localhost:5000/api/Users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(employeeToAdd),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Thêm nhân viên thất bại");
                }

                const result = await response.json();
                const addedEmployee = result.data || result;
                // Tính page cuối
                const newTotal = pagination.total + 1;
                const lastPage = Math.ceil(newTotal / pagination.pageSize);
                setEmployees([...employees, addedEmployee]);
                setPagination((prev) => ({
                    ...prev,
                    total: prev.total + 1,
                    current: lastPage,
                }));
                fetchEmployees(lastPage, pagination.pageSize);
                message.success("Thêm nhân viên thành công");
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingEmployee(null);
        } catch (error) {
            message.error(error.message || "Lỗi khi lưu nhân viên");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingEmployee(null);
    };

    // Tìm kiếm nhân viên
    const filteredUsers = employees.filter((user) => {
        // Lọc theo trạng thái
        if (filterType === "status" && filterId !== null) {
            if (user.status !== filterId) return false;
        }

        // Tìm kiếm theo tên hoặc username
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            if (
                !user.fullName?.toLowerCase().includes(searchLower) &&
                !user.username?.toLowerCase().includes(searchLower)
            ) {
                return false;
            }
        }

        return true;
    });

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    // Tạo tên đăng nhập tự động
    const generateUsername = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/Users/count-by-role",
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            const totalCount = result?.data?.totalCount || 0;
            const nextIndex = totalCount + 1;
            const prefix = "staff";
            return `${prefix}${nextIndex.toString().padStart(2, "0")}`;
        } catch (error) {
            console.error("Lỗi khi lấy số lượng nhân viên:", error);
            return "";
        }
    };

    const handleRoleChange = async (value) => {
        form.setFieldValue("role", value);
    };
    
    const handleStatusChange = async (value) => {
        form.setFieldValue("status", value);
    };

    const handleFilterByStatus = (status) => {
        setFilterType("status");
        setFilterId(status);
        message.success(`Đang lọc theo trạng thái: ${status === "Active" ? "Đang làm việc" : "Tạm nghỉ"}`);
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
                    label: "Đang làm việc",
                    onClick: () => handleFilterByStatus("Active"),
                },
                {
                    key: "status-inactive",
                    label: "Tạm nghỉ",
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
            return filterId === "Active" ? "Lọc: Đang làm việc" : "Lọc: Tạm nghỉ";
        }

        return "Lọc";
    };

    return (
        <div className="employee-manage-container">
            <div className="employee-manage-header">
                <h2 className="employee-manage-title">Quản Lý Nhân Viên</h2>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input.Search
                            placeholder="Tìm kiếm theo tên, tên đăng nhập, chức vụ"
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="employee-search-input"
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
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                        className="category-search-btn"
                    >
                        Thêm nhân viên
                    </Button>
                </div>
            </div>

            <div className="employee-manage-table">
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="userId"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => (
                            <span>
                                Tổng{" "}
                                <span
                                    style={{ color: "red", fontWeight: "bold" }}
                                >
                                    {total}
                                </span>{" "}
                                nhân viên
                            </span>
                        ),
                    }}
                    onChange={handleTableChange}
                    scroll={{ y: 420, x: 1200 }}
                />
            </div>

            <Modal
                title={
                    editingEmployee
                        ? "Sửa Thông Tin Nhân Viên"
                        : "Thêm Nhân Viên Mới"
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={500}
                closable={false}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Họ và Tên"
                        name="fullName"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên nhân viên",
                            },
                            {
                                max: 100,
                                message: "Tên nhân viên không quá 100 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên nhân viên" />
                    </Form.Item>

                    <Form.Item
                        label="Chức vụ"
                        name="role"
                        rules={[
                            { required: true, message: "Vui lòng chọn chức vụ" },
                        ]}
                    >
                        <Select
                            placeholder="Chọn chức vụ"
                            onChange={handleRoleChange}
                            getPopupContainer={(trigger) => trigger.parentNode}
                        >
                            <Option value="Admin">Quản Trị Viên</Option>
                            <Option value="Staff">Nhân Viên</Option>
                        </Select>
                    </Form.Item>
                    {editingEmployee && <Form.Item
                        label="Trạng thái"
                        name="status"
                    >
                        <Select
                            placeholder="Trạng thái"
                            onChange={handleStatusChange}
                            getPopupContainer={(trigger) => trigger.parentNode}
                        >
                            <Option value="Inactive">Tạm Nghỉ</Option>
                            <Option value="Active">Đang Làm Việc</Option>
                        </Select>
                    </Form.Item>}
                    <Form.Item className="form-actions">
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="employee-search-btn"
                            >
                                {editingEmployee ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}