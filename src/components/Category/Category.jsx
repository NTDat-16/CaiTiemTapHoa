import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./Category.css"

const { Option } = Select

export default function Category() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form] = Form.useForm()

  //Lấy danh sách danh mục từ database
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/Categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data?.items)) {
        setCategories(result.data.items);
      } else if (Array.isArray(result.data)) {
        setCategories(result.data);
      } else if (Array.isArray(result)) {
        setCategories(result);
      } else {
        throw new Error("Phản hồi từ server không hợp lệ");
      }

    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách danh mục");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Xóa danh mục nếu chưa là khóa ngoại
  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/Categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Xóa danh mục thất bại");
      }

      setCategories(categories.filter((p) => p.categoryId !== categoryId));
      message.success("Xóa danh mục thành công");
    } catch (error) {
      message.error(error.message || "Danh mục đang được sử dụng, không thể xóa");
    }
  };

  //Thêm danh mục
  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  //Sửa danh mục
  const handleEdit = (category) => {
    setEditingCategory(category)
    form.setFieldsValue(category)
    setIsModalOpen(true)
  }
  
  //Thêm hoặc cập nhật sản phẩm
  const handleSubmit = async (values) => {
    try {
      const { categoryName } = values;

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

      if (editingCategory) {
        // --- Sửa danh mục ---
        const response = await fetch(`http://localhost:5000/api/Categories/${editingCategory.categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ categoryName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Sửa danh mục thất bại");
        }

        setCategories(categories.map((c) =>
          c.categoryId === editingCategory.categoryId ? { ...c, categoryName: categoryName } : c
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
          body: JSON.stringify({ categoryName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Thêm danh mục thất bại");
        }

        const result = await response.json();
        const newCategory = result.data;
        setCategories([...categories, newCategory]);
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
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    // Search in all fields
    return (
      category.categoryName.toLowerCase().includes(searchLower)
    )
  })

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  //Danh sách các cột trong bảng
  const columns = [
    {title: "Mã danh mục",dataIndex: "categoryId",key: "categoryId",width: 150,align: "center",},
    {title: "Tên danh mục",dataIndex: "categoryName",key: "categoryName",width: 700,align: "center",},
    {title: "Thao tác",key: "action",width: 150,fixed: "right",align: "center",
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

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="category-manage-container">
      <div className="category-manage-header">
        <h2>Quản Lý Danh Mục</h2>
        <div className="header-actions">
          <Input.Search
            placeholder="Tìm kiếm theo tên danh mục"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="category-search-input"
          />
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
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục${searchTerm ? " (đã lọc)" : ""}`,
          }}
          scroll={{ y: 420, x: 1200 }}
        />
      </div>

      <Modal
        title={editingCategory ? "Sửa Thông Tin Danh Mục" : "Thêm Danh Mục Mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        closable={false}
        style={{ top: 100 }} 
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