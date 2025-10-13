import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./Category.css"

const { Option } = Select

// Mock data for categories
const mockCategories = [
  { category_id: 1, category_name: "Quần áo" },
  { category_id: 2, category_name: "Đồ ăn" },
  { category_id: 3, category_name: "Đồ uống" },
  { category_id: 4, category_name: "Phụ kiện" },
  { category_id: 1, category_name: "Quần áo" },
  { category_id: 2, category_name: "Đồ ăn" },
  { category_id: 3, category_name: "Đồ uống" },
  { category_id: 4, category_name: "Phụ kiện" },
  { category_id: 1, category_name: "Quần áo" },
  { category_id: 2, category_name: "Đồ ăn" },
  { category_id: 3, category_name: "Đồ uống" },
  { category_id: 4, category_name: "Phụ kiện" },
  { category_id: 1, category_name: "Quần áo" },
  { category_id: 2, category_name: "Đồ ăn" },
  { category_id: 3, category_name: "Đồ uống" },
  { category_id: 4, category_name: "Phụ kiện" },
]


export default function Category() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form] = Form.useForm()

  // Fetch products from API (currently using mock data)
  const fetchCategories = async () => {
    setLoading(true)
    try {
      // TODO: Uncomment when API is ready
      // const response = await fetch('/api/products');
      // const data = await response.json();
      // setCategories(data);

      // Using mock data for now
      setTimeout(() => {
        setCategories(mockCategories)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error("Lỗi khi tải danh sách danh mục")
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchCategories()
  }, [])

  // Table columns definition
  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "category_id",
      key: "category_id",
      width: 150,
      align: "center",
    },
    {
      title: "Tên danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: 700,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.category_id)}
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
  const handleDelete = async (categoryId) => {
    try {
      // TODO: Uncomment when API is ready
      // await fetch(`/api/products/${productId}`, { method: 'DELETE' });

      // Mock delete
      setCategories(categories.filter((p) => p.category_id !== categoryId))
      message.success("Xóa danh mục thành công")
    } catch (error) {
      message.error("Lỗi khi xóa danh mục")
    }
  }

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        // Update existing product
        // TODO: Uncomment when API is ready
        // await fetch(`/api/products/${editingProduct.product_id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(values),
        // });

        // Mock update
        setProducts(products.map((p) => (p.product_id === editingProduct.product_id ? { ...p, ...values } : p)))
        message.success("Cập nhật sản phẩm thành công")
      } else {
        // Add new product
        // TODO: Uncomment when API is ready
        // const response = await fetch('/api/products', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(values),
        // });
        // const newProduct = await response.json();

        // Mock add
        const newProduct = {
          product_id: products.length + 1,
          ...values,
          created_at: new Date().toISOString(),
        }
        setProducts([...products, newProduct])
        message.success("Thêm sản phẩm thành công")
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error("Lỗi khi lưu sản phẩm")
    }
  }

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingProduct(null)
  }

  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    // Search in all fields
    return (
      category.category_name.toLowerCase().includes(searchLower)
    )
  })

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  return (
    <div className="category-manage-container">
      <div className="category-manage-header">
        <h2 className="category-manage-title">Quản lý danh mục</h2>
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
          rowKey="category_id"
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
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        closable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Tên danh mục"
            name="category_name"
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