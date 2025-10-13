import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import "./Category.css"

const mockCategories = [
  { category_id: 1, category_name: "Quần áo" },
  { category_id: 2, category_name: "Đồ ăn" },
  { category_id: 3, category_name: "Đồ uống" },
  { category_id: 4, category_name: "Phụ kiện" },
]

export default function CategoryManage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [form] = Form.useForm()

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setCategories(mockCategories)
            setLoading(false)
        }, 800) // giả lập 0.8 giây load dữ liệu
    }, [])


  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingCategory(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (categoryId) => {
    setCategories(categories.filter((c) => c.category_id !== categoryId))
    message.success("Xóa danh mục thành công")
  }

  const handleSubmit = (values) => {
    if (editingCategory) {
      setCategories(categories.map((c) =>
        c.category_id === editingCategory.category_id ? { ...c, ...values } : c
      ))
      message.success("Cập nhật danh mục thành công")
    } else {
      const newCategory = {
        category_id: categories.length + 1,
        ...values,
      }
      setCategories([...categories, newCategory])
      message.success("Thêm danh mục thành công")
    }
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const filteredCategory = categories.filter((c) =>
    c.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      align: "center",width: 700,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",width: 300,
      render: (_, record) => (
        <Space size="small">
          <Button className="btnEdit" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.category_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button className="btnDelete" size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
            onSearch={(val) => setSearchTerm(val)}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="category-search-input"
          />
          <Button
            icon={<PlusOutlined />}
            size="large"
            className="btnAddCategory"
            onClick={handleAdd}
          >
            Thêm danh mục
          </Button>
        </div>
      </div>

      <div className="category-manage-table">
        <Table
          columns={columns}
          dataSource={filteredCategory}
          rowKey="category_id"
          loading={loading}
          pagination={{
            pageSize: 6,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
        />
      </div>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        closable={false}
        bodyStyle={{ padding: 0 }}
        modalRender={(modal) => <div className="custom-modal">{modal}</div>}
      >
        <div className="custom-modal-header">
          {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        </div>

        <div className="custom-modal-body">
          <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
            <Form.Item
              label="Tên danh mục"
              name="category_name"
              rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>
          </Form>
        </div>

        <div className="custom-modal-footer">
          <Button className="btnCancel" onClick={handleCancel}>
            Hủy
          </Button>
          <Button className="btnModel" onClick={() => form.submit()}>
            {editingCategory ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
