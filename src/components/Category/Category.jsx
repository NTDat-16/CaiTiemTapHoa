import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Dropdown} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons"
import "./Category.css"

const { Option } = Select

export default function Category() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filterType, setFilterType] = useState(null)
  const [filterId, setFilterId] = useState(null)

  //Lấy danh sách danh mục
  const fetchCategories = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/Categories?pageNumber=${page}&pageSize=${pageSize}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

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

      const sorted = items.sort((a, b) => a.categoryId- b.categoryId);
      setCategories(sorted);
      setPagination({
        current: data.data?.pageNumber || page,
        pageSize: data.data?.pageSize || pageSize,
        total: data.data?.totalCount || items.length,
      });
    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách danh mục");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchCategories()
  }, [])

  // Xóa danh mục
  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/Categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Xóa danh mục thất bại");
      }

      setCategories((prev) => prev.filter((p) => p.categoryId !== categoryId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total > 0 ? prev.total - 1 : 0,
      }));
      message.success("Xóa danh mục thành công");
    } catch (error) {
       message.error("Lỗi khi xóa danh mục");
    }
  };

  //Sự kiện xử lý khi nhấn thêm danh mục
  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  //Sự kiện xử lý khi nhấn sửa danh mục
  const handleEdit = (category) => {
    setEditingCategory(category)
    form.setFieldsValue(category)
    setIsModalOpen(true)
  }
  
  //Thêm hoặc cập nhật sản phẩm
  const handleSubmit = async (values) => {
    try {
      const { categoryName, status } = values;

      // Kiểm tra trùng tên (không phân biệt hoa thường)
      const isDuplicate = categories.some(
        (c) =>
          c.categoryName.toLowerCase().trim() === categoryName.toLowerCase().trim() &&
          (!editingCategory || c.categoryId !== editingCategory.categoryId)
      );

      if (isDuplicate) {
        // Đặt lỗi ngay dưới Form.Item
        form.setFields([
          {
            name: "categoryName",
            errors: ["Tên danh mục đã tồn tại. Vui lòng nhập tên khác!"],
          },
        ]);
        return;
      }
      // Sửa danh mục
      if (editingCategory) {
        
        const response = await fetch(`http://localhost:5000/api/Categories/${editingCategory.categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ categoryName, status}),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Sửa danh mục thất bại");
        }

        setCategories(categories.map((c) =>
          c.categoryId === editingCategory.categoryId ? { ...c, categoryName: categoryName, status: status } : c
        ));
        message.success("Cập nhật danh mục thành công");
      } else {
        // --- Thêm danh mục ---
        const response = await fetch("http://localhost:5000/api/Categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ categoryName, status: "Active" }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Thêm danh mục thất bại");
        }

        const result = await response.json();
        const newCategory = result.data;
        // Tính page cuối
        const newTotal = pagination.total + 1;
        const lastPage = Math.ceil(newTotal / pagination.pageSize);
        setCategories([...categories, newCategory]);
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
          current: lastPage,
        }));
        fetchCategories(lastPage, pagination.pageSize);
        message.success("Thêm danh mục thành công");
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Lỗi khi lưu danh mục");
    }
  };

  //Nhấn cancel trong form
  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingCategory(null)
  }

  //Tìm kiếm các danh mục theo tên
  const filteredCategories = categories.filter((category) => {
    // Lọc theo trạng thái nếu có
    if (filterType === "status" && filterId !== null) {
      if (category.status !== filterId) return false;
    }

    // Lọc theo searchTerm nếu có
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    return (
      category.categoryName?.toLowerCase().includes(searchLower)
    );
  });


  const handleFilterByStatus = (status) => {
    setFilterType("status");
    setFilterId(status);
    message.success(`Đang lọc theo trạng thái: ${status === "Active" ? "Còn sử dụng" : "Ngừng sử dụng"}`);
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
          label: "Còn sử dụng",
          onClick: () => handleFilterByStatus("Active"),
        },
        {
          key: "status-inactive",
          label: "Hết sử dụng",
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
      return filterId === "Active" ? "Lọc: Còn sử dụng" : "Lọc: Hết sử dụng";
    }

    return "Lọc";
  };

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  //Danh sách các cột trong bảng
  const columns = [
    {title: "Mã danh mục",dataIndex: "categoryId",key: "categoryId",width: 180,align: "center",},
    {title: "Tên danh mục",dataIndex: "categoryName",key: "categoryName",width: 600,align: "center",},
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status === 'Active' ? 'CÒN SỬ DỤNG' : 'HẾT SỬ DỤNG'}
        </Tag>
      ),
    },
    {title: "Thao tác",key: "action",width: 180,fixed: "right",align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button className="btn-edit" type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.categoryId)}
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

  //Xử lý thay đổi trạng thái trong form sửa
  const handleStatusChange = async (value) => {
    form.setFieldValue("status", value);
  };

  return (
    <div className="category-manage-container">
      <div className="category-manage-header">
        <h2>Quản Lý Danh Mục</h2>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input.Search
              placeholder="Tìm kiếm theo tên danh mục"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="category-search-input"
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" className="category-search-btn">
            Thêm danh mục
          </Button>
        </div>
      </div>

      <div className="category-manage-table">
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="categoryId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => (
              <span>
                Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> danh mục
              </span>
            ),
          }}
          scroll={{ y: 420, x: 1200 }}
          onChange={(pagination) => {
            fetchCategories(pagination.current, pagination.pageSize);
          }}
        />
      </div>

      <Modal
        title={editingCategory ? "Sửa Thông Tin Danh Mục" : "Thêm Danh Mục Mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        closable={false}
        style={{ top: 150 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { max: 100, message: "Tên danh mục không quá 100 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          {editingCategory && 
            <Form.Item
              label="Trạng thái"
              name="status"
            >
              <Select
                placeholder="Trạng thái"
                onChange={handleStatusChange}
              >
                <Option value="Inactive">Hết Sử Dụng</Option>
                <Option value="Active">Còn Sử Dụng</Option>
              </Select>
            </Form.Item>
          }
          <Form.Item className="form-actions">
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="category-search-btn">
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}