import { useState, useEffect } from "react";
import { Table, Alert, Select, Space, Button, Modal, Form, Input } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import "./Inventory.css";

const { Option } = Select;

const mockProducts = [
  { product_id: 1, product_name: "Áo thun nam", quantity: 12, unit: "cái" },
  { product_id: 2, product_name: "Quần jean nữ", quantity: 3, unit: "cái" },
  { product_id: 3, product_name: "Bánh mì thịt", quantity: 0, unit: "cái" },
  { product_id: 4, product_name: "Cà phê sữa", quantity: 7, unit: "ly" },
  { product_id: 5, product_name: "Túi xách da", quantity: 25, unit: "cái" },
];

export default function InventoryManage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const [filterUnit, setFilterUnit] = useState(null);
  const [unitOptions, setUnitOptions] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLowStock(mockProducts.filter((item) => item.quantity <= 5));
      setUnitOptions(
        [...new Set(mockProducts.map((item) => item.unit))].map((unit) => ({
          label: unit,
          value: unit,
        }))
      );
      setLoading(false);
    }, 300);
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!filterUnit || filterUnit === null) {
      return true;
    }
    return product.unit === filterUnit;
  });

  const handleUnitFilterChange = (value) => {
    setFilterUnit(value);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsEditModalOpen(true);
  };

  const handleCancel = () => {
    setIsEditModalOpen(false);
    setIsImportModalOpen(false);
    setIsAuditModalOpen(false);
    form.resetFields();
    setEditingProduct(null);
  };

  const handleSubmit = (values) => {
    const updatedProducts = products.map((p) =>
      p.product_id === editingProduct.product_id ? { ...p, ...values } : p
    );
    setProducts(updatedProducts);
    setIsEditModalOpen(false);
    form.resetFields();
    setEditingProduct(null);
  };

  const handleImport = (values) => {
    console.log("Nhập hàng:", values);
    setIsImportModalOpen(false);
    form.resetFields();
  };

  const handleAudit = (values) => {
    console.log("Kiểm kê:", values);
    setIsAuditModalOpen(false);
    form.resetFields();
  };

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
      title: "Số lượng tồn",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
    },
    { title: "Đơn vị", dataIndex: "unit", key: "unit", width: 100 },
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
        </Space>
      ),
    },
  ];

  return (
    <div className="inventory-manage-container">
      <div className="inventory-manage-header">
        <h2> Quản lý tồn kho</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <label>Bộ lọc:</label>
            <Select
              allowClear
              placeholder="Chọn đơn vị"
              style={{ width: 150 }}
              onChange={handleUnitFilterChange}
              options={[{ label: "Tất cả", value: "" }, ...unitOptions]}
            />
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsImportModalOpen(true)}
            >
              Nhập hàng
            </Button>
            <Button
              type="default"
              icon={<FileSearchOutlined />}
              size="large"
              onClick={() => setIsAuditModalOpen(true)}
            >
              Kiểm kê
            </Button>
          </Space>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Alert
          message={`Có ${lowStock.length} sản phẩm sắp hết hàng!`}
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {lowStock.map((item) => (
                <li key={item.product_id}>
                  <b>{item.product_name}</b> (Còn lại:{" "}
                  <span style={{ color: "red" }}>{item.quantity}</span>)
                </li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div className="inventory-manage-table">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="product_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm tồn kho`,
          }}
          scroll={{ y: 280, x: 1200 }}
        />
      </div>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
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
            label="Số lượng tồn"
            name="quantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn" },
              {
                type: "number",
                min: 0,
                message: "Số lượng tồn phải là một số không âm",
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số lượng tồn" />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
          >
            <Input placeholder="Nhập đơn vị" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal nhập hàng */}
      <Modal
        title="Nhập hàng"
        open={isImportModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleImport}
          autoComplete="off"
        >
          <Form.Item
            label="Chọn sản phẩm"
            name="product_id"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select placeholder="Chọn sản phẩm">
              {products.map((product) => (
                <Option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số lượng nhập"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng nhập" }]}
          >
            <Input type="number" placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>Đóng</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal kiểm kê */}
      <Modal
        title="Kiểm kê"
        open={isAuditModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAudit}
          autoComplete="off"
        >
          <Form.Item
            label="Chọn sản phẩm"
            name="product_id"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select placeholder="Chọn sản phẩm">
              {products.map((product) => (
                <Option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số lượng thực tế"
            name="actual_quantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng thực tế" },
            ]}
          >
            <Input type="number" placeholder="Nhập số lượng thực tế" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>Đóng</Button>
              <Button type="primary" htmlType="submit">
                Kiểm kê
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
