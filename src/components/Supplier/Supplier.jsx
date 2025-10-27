import { useState, useEffect, useCallback } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Dropdown } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined} from "@ant-design/icons"
import "./Supplier.css"

const { Option } = Select

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingsupplier, setEditingsupplier] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [provinces, setProvinces] = useState([]);
  const [filterType, setFilterType] = useState(null)
  const [filterId, setFilterId] = useState(null)

  //Lấy danh sách các nhà cung cấp
  const fetchSuppliers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/Suppliers?pageNumber=${page}&pageSize=${pageSize}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

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

            const sorted = items.sort((a, b) => a.supplierId - b.supplierId);

            setSuppliers(sorted);

            setPagination({
              current: data.data?.pageNumber || page,
              pageSize: data.data?.pageSize || pageSize,
              total: data.data?.totalCount || items.length,
            });
        } catch (error) {
            message.error("Lỗi khi tải danh sách nhân viên: " + error.message);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
  };

  //Lấy danh sách tỉnh thành
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

  // Xóa danh mục nếu chưa là khóa ngoại
  const handleDelete = async (supplierId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/Suppliers/${supplierId}`,
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
        throw new Error(data.message || "Xóa nhà cung cấp thất bại");
      }

      setSuppliers((prev) => prev.filter((p) => p.supplierId !== supplierId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total > 0 ? prev.total - 1 : 0,
      }));
      message.success("Xóa nhà cung cấp thành công");
    } catch (error) {
      message.error("Lỗi khi xóa nhà cung cấp");
    }
  };

  //Xử lý sự kiện thêm nhà cung cấp
  const handleAdd = () => {
    setEditingsupplier(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  //Xử lý sự kiện sửa nhà cung cấp
  const handleEdit = (supplier) => {
    setEditingsupplier(supplier);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      status : supplier.status,
    });
  };

  //Thêm hoặc cập nhật nhà cung cấp
  const handleSubmit = async (values) => {
    try {
      const { name, phone, email, address, status } = values;

      // Kiểm tra trùng tên
      const isDuplicate = suppliers.some(
        (c) =>
          c.name.toLowerCase().trim() === name.toLowerCase().trim() &&
          (!editingsupplier || c.supplierId !== editingsupplier.supplierId)
      );

      if (isDuplicate) {
        form.setFields([
          { name: "name", errors: ["Tên nhà cung cấp đã tồn tại. Vui lòng nhập tên khác!"] }
        ]);
        return;
      }

      if (editingsupplier) {
        // Sửa
        const response = await fetch(`http://localhost:5000/api/Suppliers/${editingsupplier.supplierId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name, phone, email, address, status }), // gửi đúng format API
        });

        if (!response.ok) throw new Error("Sửa nhà cung cấp thất bại");

        setSuppliers(suppliers.map(c =>
          c.supplierId === editingsupplier.supplierId ? { ...c, name, phone, email, address, status } : c
        ));
        message.success("Cập nhật nhà cung cấp thành công");
      } else {
        // Thêm mới
        const response = await fetch("http://localhost:5000/api/Suppliers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name, phone, email, address, status: 'Active' }), // mặc định thêm mới là Active
        });

        if (!response.ok) throw new Error("Thêm nhà cung cấp thất bại");

        const result = await response.json();
        const newSupplier = result.data || result;
        setSuppliers([...suppliers, newSupplier]);
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
        message.success("Thêm nhà cung cấp thành công");
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message);
    }
  };

  ////Xử lý sự kiện nhấn nút hủy
  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingsupplier(null)
  }

  //Tìm kiếm các danh mục theo tên
  const filteredSuppliers = suppliers.filter((supplier) => {
    // Lọc theo trạng thái nếu có
    if (filterType === "status" && filterId !== null) {
      if (supplier.status !== filterId) return false;
    }

    // Lọc theo searchTerm nếu có
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    return (
      supplier.name?.toLowerCase().includes(searchLower) ||
      supplier.phone?.toLowerCase().includes(searchLower) ||
      supplier.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleFilterByStatus = (status) => {
    setFilterType("status");
    setFilterId(status);
    message.success(`Đang lọc theo trạng thái: ${status === "Active" ? "CÒN mua hàng" : "NGỪNG mua hàng"}`);
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
          label: "Còn nhập hàng",
          onClick: () => handleFilterByStatus("Active"),
        },
        {
          key: "status-inactive",
          label: "Ngừng nhập hàng",
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
      return filterId === "Active" ? "Lọc: Còn nhập hàng" : "Lọc: Ngừng nhập hàng";
    }

    return "Lọc";
  };

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  const handleStatusChange = async (value) => {
    form.setFieldValue("status", value);
  };

  //Danh sách các cột trong bảng
  const columns = [
    { title: "Mã NCC", dataIndex: "supplierId", key: "supplierId", width: 120, align: "center" },
    { title: "Tên NCC", dataIndex: "name", key: "name", width: 200, align: "left" },
    { title: "SĐT", dataIndex: "phone", key: "phone", width: 150, align: "center" },
    { title: "Email", dataIndex: "email", key: "email", width: 200, align: "left" },
    { title: "Địa chỉ", dataIndex: "address", key: "address", width: 250, align: "left" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status === 'Active' ? 'CÒN NHẬP HÀNG' : 'NGƯNG NHẬP HÀNG'}
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
          <Button
            className="btn-edit"
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa nhà cung cấp"
            description="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDelete(record.supplierId)}
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

  useEffect(() => {
    fetchSuppliers()
    fetchProvinces()
  }, [])

  const handleTableChange = (pag) => {
    fetchSuppliers(pag.current, pag.pageSize);
  };
  
  return (
    <div className="supplier-manage-container">
      <div className="supplier-manage-header">
        <h2>Quản Lý Nhà Cung Cấp</h2>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input.Search
              placeholder="Tìm kiếm theo tên nhà cung cấp, email, sđt."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="supplier-search-input"
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" className="supplier-search-btn">
            Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      <div className="supplier-manage-table">
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="supplierId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => (
              <span>
                Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> nhà cung cấp
              </span>
            ),
          }}
          scroll={{ y: 420, x: 1200 }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title={editingsupplier ? 'Sửa Thông Tin Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        closable={false}
        style={{ top: 100 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={editingsupplier || {}}
        >
          <Form.Item
            label="Tên nhà cung cấp"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
              { max: 100, message: 'Tên nhà cung cấp không quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành' }]}
          >
            <Select placeholder="Chọn tỉnh/thành">
              {provinces.map((province) => (
                <Select.Option key={province.code} value={province.name}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {editingsupplier && 
          <Form.Item
            label="Trạng thái"
            name="status"
          >
            <Select
              placeholder="Trạng thái"
              onChange={handleStatusChange}
            >
              <Option value="Inactive">Ngừng Nhập Hàng</Option>
              <Option value="Active">Còn Nhập Hàng</Option>
            </Select>
          </Form.Item>}
          <Form.Item className="form-actions">
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingsupplier ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    
    </div>
  )
}