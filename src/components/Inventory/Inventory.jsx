import { useState, useEffect } from "react";
import {
  Table,
  Alert,
  Select,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./Inventory.css";

const { Option } = Select;

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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    const fetchInventory = async (page = 1, pageSize = 10) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        const response = await axios.get(
          `http://localhost:5000/api/inventory?pageNumber=${page}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          const items = response.data.data.items.map((item) => ({
            product_id: item.product.productId,
            product_name: item.product.productName,
            quantity: item.quantity,
            unit: item.product.unit,
          }));
          setProducts(items);
          setLowStock(items.filter((item) => item.quantity <= 5));
          setUnitOptions(
            [...new Set(items.map((item) => item.unit))].map((unit) => ({
              label: unit,
              value: unit,
            }))
          );
          setPagination({
            current: response.data.data.pageNumber,
            pageSize: response.data.data.pageSize,
            total: response.data.data.totalCount,
          });
        } else {
          message.error("Không thể tải dữ liệu tồn kho.");
        }
      } catch (error) {
        message.error("Đã xảy ra lỗi khi gọi API.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

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
    const productToUpdate = products.find(
      (product) => product.product_id === values.product_id
    );

    if (productToUpdate) {
      const updatedProducts = products.map((product) =>
        product.product_id === values.product_id
          ? { ...product, quantity: product.quantity + values.quantity }
          : product
      );
      setProducts(updatedProducts);
      message.success("Nhập hàng thành công!");
    } else {
      message.error("Sản phẩm không tồn tại!");
    }

    setIsImportModalOpen(false);
    form.resetFields();
  };

  const handleAudit = (values) => {
    const productToAudit = products.find(
      (product) => product.product_id === values.product_id
    );

    if (productToAudit) {
      const updatedProducts = products.map((product) =>
        product.product_id === values.product_id
          ? { ...product, quantity: values.actual_quantity }
          : product
      );
      setProducts(updatedProducts);
      message.success("Kiểm kê thành công!");
    } else {
      message.error("Sản phẩm không tồn tại!");
    }

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
            className="edit-button"
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  return (
    <div className="inventory-manage-container">
      <div className="inventory-manage-header">
        <h2> Quản Lý Tồn Kho</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
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
          dataSource={filteredProducts}
          rowKey="product_id"
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total, range) => `Tổng ${total} sản phẩm`,
          }}
          onChange={handleTableChange}
          scroll={{ y: 400, x: 1200 }}
        />
      </div>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalOpen}
        onCancel={handleCancel}
        footer={null}
        closable={false}
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

          <Form.Item className="form-actions">
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
        title="Nhập Hàng"
        open={isImportModalOpen}
        onCancel={handleCancel}
        footer={null}
        closable={false}
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

          <Form.Item className="form-actions">
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
        title="Kiểm Kê"
        open={isAuditModalOpen}
        onCancel={handleCancel}
        footer={null}
        closable={false}
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

          <Form.Item className="form-actions">
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
