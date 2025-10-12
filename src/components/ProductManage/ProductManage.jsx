import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./ProductManage.css"

const { Option } = Select

// Mock data for categories
const mockCategories = [
  { category_id: 1, category_name: "Quần áo" },
  { category_id: 2, category_name: "Đồ ăn" },
  { category_id: 3, category_name: "Đồ uống" },
  { category_id: 4, category_name: "Phụ kiện" },
]

// Mock data for suppliers
const mockSuppliers = [
  { supplier_id: 1, name: "Nhà cung cấp A", phone: "0901234567", email: "nccA@example.com" },
  { supplier_id: 2, name: "Nhà cung cấp B", phone: "0907654321", email: "nccB@example.com" },
  { supplier_id: 3, name: "Nhà cung cấp C", phone: "0912345678", email: "nccC@example.com" },
]

// Mock data for products
const mockProducts = [
  {
    product_id: 1,
    product_name: "Áo thun nam",
    barcode: "PRD001",
    price: 150000,
    unit: "cái",
    category_id: 1,
    supplier_id: 1,
    created_at: "2025-01-15T10:30:00",
  },
  {
    product_id: 2,
    product_name: "Quần jean nữ",
    barcode: "PRD002",
    price: 350000,
    unit: "cái",
    category_id: 1,
    supplier_id: 1,
    created_at: "2025-01-16T14:20:00",
  },
  {
    product_id: 3,
    product_name: "Bánh mì thịt",
    barcode: "PRD003",
    price: 25000,
    unit: "cái",
    category_id: 2,
    supplier_id: 2,
    created_at: "2025-01-17T08:15:00",
  },
  {
    product_id: 4,
    product_name: "Cà phê sữa",
    barcode: "PRD004",
    price: 30000,
    unit: "ly",
    category_id: 3,
    supplier_id: 2,
    created_at: "2025-01-18T09:45:00",
  },
  {
    product_id: 5,
    product_name: "Túi xách da",
    barcode: "PRD005",
    price: 450000,
    unit: "cái",
    category_id: 4,
    supplier_id: 3,
    created_at: "2025-01-19T11:00:00",
  },
]

export default function ProductManage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form] = Form.useForm()

  // Fetch products from API (currently using mock data)
  const fetchProducts = async () => {
    setLoading(true)
    try {
      // TODO: Uncomment when API is ready
      // const response = await fetch('/api/products');
      // const data = await response.json();
      // setProducts(data);

      // Using mock data for now
      setTimeout(() => {
        setProducts(mockProducts)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm")
      setLoading(false)
    }
  }

  // Fetch categories from API (currently using mock data)
  const fetchCategories = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await fetch('/api/categories');
      // const data = await response.json();
      // setCategories(data);

      // Using mock data for now
      setCategories(mockCategories)
    } catch (error) {
      message.error("Lỗi khi tải danh mục")
    }
  }

  // Fetch suppliers from API (currently using mock data)
  const fetchSuppliers = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await fetch('/api/suppliers');
      // const data = await response.json();
      // setSuppliers(data);

      // Using mock data for now
      setSuppliers(mockSuppliers)
    } catch (error) {
      message.error("Lỗi khi tải nhà cung cấp")
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSuppliers()
  }, [])

  // Table columns definition
  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      width: 100,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      width: 200,
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      width: 150,
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => price.toLocaleString("vi-VN"),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      key: "category_id",
      width: 150,
      render: (category_id) => {
        const category = categories.find((c) => c.category_id === category_id)
        return category ? category.category_name : "-"
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_id",
      key: "supplier_id",
      width: 150,
      render: (supplier_id) => {
        const supplier = suppliers.find((s) => s.supplier_id === supplier_id)
        return supplier ? supplier.name : "-"
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.product_id)}
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
    setEditingProduct(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product)
    form.setFieldsValue(product)
    setIsModalOpen(true)
  }

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      // TODO: Uncomment when API is ready
      // await fetch(`/api/products/${productId}`, { method: 'DELETE' });

      // Mock delete
      setProducts(products.filter((p) => p.product_id !== productId))
      message.success("Xóa sản phẩm thành công")
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm")
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

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    // Get category name
    const category = categories.find((c) => c.category_id === product.category_id)
    const categoryName = category ? category.category_name.toLowerCase() : ""

    // Get supplier name
    const supplier = suppliers.find((s) => s.supplier_id === product.supplier_id)
    const supplierName = supplier ? supplier.name.toLowerCase() : ""

    // Search in all fields
    return (
      product.product_name.toLowerCase().includes(searchLower) ||
      product.barcode.toLowerCase().includes(searchLower) ||
      product.price.toString().includes(searchLower) ||
      product.unit.toLowerCase().includes(searchLower) ||
      categoryName.includes(searchLower) ||
      supplierName.includes(searchLower)
    )
  })

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  return (
    <div className="product-manage-container">
      <div className="product-manage-header">
        <h2 className="product-manage-title">Quản lý sản phẩm</h2>
        <div className="header-actions">
          <Input.Search
            placeholder="Tìm kiếm theo tên sản phẩm, barcode, giá, đơn vị, danh mục, nhà cung cấp..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="product-search-input"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="product-manage-table">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="product_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm${searchTerm ? " (đã lọc)" : ""}`,
          }}
          scroll={{ x: 1200 }}
        />
      </div>

      <Modal
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Tên sản phẩm"
            name="product_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              { max: 100, message: "Tên sản phẩm không quá 100 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            label="Barcode"
            name="barcode"
            rules={[
              { required: true, message: "Vui lòng nhập barcode" },
              { max: 50, message: "Barcode không quá 50 ký tự" },
            ]}
          >
            <Input placeholder="Nhập barcode" />
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              {
                type: "number",
                min: 0,
                message: "Giá phải lớn hơn hoặc bằng 0",
              },
            ]}
          >
            <Input type="number" placeholder="Nhập giá" />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit"
            initialValue="cái"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
          >
            <Input placeholder="Nhập đơn vị (cái, kg, ly...)" />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category_id"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nhà cung cấp"
            name="supplier_id"
            rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
          >
            <Select placeholder="Chọn nhà cung cấp">
              {suppliers.map((supplier) => (
                <Option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingProduct ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}