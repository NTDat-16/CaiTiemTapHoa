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
  Dropdown,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import "./ProductManage.css";

const { Option } = Select;

export default function ProductManage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterId, setFilterId] = useState(null);
  const [form] = Form.useForm();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [previewImage, setPreviewImage] = useState("img/Default_Product.png");
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE = "http://localhost:5000/api";
  const API_IMAGE = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/Categories`, { headers: authHeader });
      const result = await res.json();
      const categoriesArray = Array.isArray(result?.data?.items)
        ? result.data.items
        : [];
      setCategories(categoriesArray);
    } catch (error) {
      message.error("Lỗi khi tải danh mục");
    }
  };

  // ✅ Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE}/Suppliers`, {
        headers: authHeader,
      });
      const result = await response.json();
      const suppliersArray = Array.isArray(result?.data?.items)
        ? result.data.items
        : [];
      setSuppliers(suppliersArray);
    } catch (error) {
      message.error("Lỗi khi tải nhà cung cấp");
    }
  };

  // ✅ Fetch Products (with pagination)
  const fetchProducts = async (page = pageNumber, size = pageSize) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/Products?PageNumber=${page}&PageSize=${size}`,
        { headers: authHeader }
      );
      const result = await response.json();

      const productsArray = Array.isArray(result?.data?.items)
        ? result.data.items
        : [];

      setProducts(productsArray);
      setTotalItems(result?.data?.totalCount || 0);
      setPageNumber(page);
      setPageSize(size);
    } catch (error) {
      console.error("Fetch products error:", error);
      message.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load dữ liệu khi mở modal sửa
  useEffect(() => {
    fetchProducts(pageNumber, pageSize);
    fetchCategories();
    fetchSuppliers();

    if (editingProduct) {
      form.setFieldsValue({
        productName: editingProduct.productName,
        barcode: editingProduct.barcode,
        price: editingProduct.price,
        unit: editingProduct.unit,
        categoryId: editingProduct.categoryId,
        supplierId: editingProduct.supplierId,
      });

      setPreviewImage(
        editingProduct.imagePath
          ? editingProduct.imagePath.startsWith("http")
            ? editingProduct.imagePath
            : `${API_IMAGE}${editingProduct.imagePath}`
          : "img/Default_Product.png"
      );
    } else {
      form.resetFields();
      setPreviewImage("img/Default_Product.png");
    }
  }, [editingProduct, pageNumber, pageSize]);

  // ✅ Columns cho bảng
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "imagePath",
      key: "imagePath",
      width: 100,
      render: (imagePath) => {
        const imageUrl = imagePath
          ? imagePath.startsWith("http")
            ? imagePath
            : `${API_IMAGE}${imagePath}`
          : "/img/Default_Product.png";
        return (
          <img
            src={imageUrl}
            alt="Product"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #eee",
            }}
            onError={(e) => (e.target.src = "/img/Default_Product.png")}
          />
        );
      },
    },
    {
      title: "Mã SP",
      dataIndex: "productId",
      key: "productId",
      width: 100,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
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
      render: (price) => `${price?.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 150,
      render: (id) =>
        categories.find((c) => c.categoryId === id)?.categoryName || "-",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierId",
      key: "supplierId",
      width: 150,
      render: (id) =>
        suppliers.find((s) => s.supplierId === id)?.name || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
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
            title="Xóa sản phẩm"
            onConfirm={() => handleDelete(record.productId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ✅ Các hàm xử lý
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/Products/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (!response.ok) throw new Error("Delete failed");
      message.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("ProductName", values.productName);
      formData.append("CategoryId", values.categoryId);
      formData.append("SupplierId", values.supplierId);
      formData.append("Barcode", values.barcode);
      formData.append("Price", values.price);
      formData.append("Unit", values.unit);
      if (selectedFile) formData.append("Image", selectedFile);

      const url = editingProduct
        ? `${API_BASE}/Products/${editingProduct.productId}`
        : `${API_BASE}/Products`;
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Accept: "application/json", ...authHeader },
        body: formData,
      });

      if (!response.ok) throw new Error("Lưu sản phẩm thất bại");

      message.success(
        editingProduct ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công"
      );

      setIsModalOpen(false);
      form.resetFields();
      setSelectedFile(null);
      fetchProducts();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase());
  };

  const handleFilterByCategory = (id) => {
    setFilterType("category");
    setFilterId(id);
    message.success("Đang lọc theo danh mục");
  };

  const handleFilterBySupplier = (id) => {
    setFilterType("supplier");
    setFilterId(id);
    message.success("Đang lọc theo nhà cung cấp");
  };

  const handleClearFilter = () => {
    setFilterType(null);
    setFilterId(null);
    message.info("Đã xóa bộ lọc");
  };

  const filteredProducts = products.filter((p) => {
    let matches = true;
    if (filterType === "category" && filterId)
      matches = p.categoryId === filterId;
    if (filterType === "supplier" && filterId)
      matches = p.supplierId === filterId;
    if (searchTerm)
      matches =
        p.productName?.toLowerCase().includes(searchTerm) ||
        p.barcode?.toLowerCase().includes(searchTerm);
    return matches;
  });

  const filterMenuItems = [
    {
      key: "category",
      label: "Lọc theo Danh mục",
      children: categories.map((cat) => ({
        key: `category-${cat.categoryId}`,
        label: cat.categoryName,
        onClick: () => handleFilterByCategory(cat.categoryId),
      })),
    },
    {
      key: "supplier",
      label: "Lọc theo Nhà cung cấp",
      children: suppliers.map((sup) => ({
        key: `supplier-${sup.supplierId}`,
        label: sup.name,
        onClick: () => handleFilterBySupplier(sup.supplierId),
      })),
    },
    { type: "divider" },
    {
      key: "clear",
      label: "Xóa bộ lọc",
      onClick: handleClearFilter,
      disabled: !filterType,
    },
  ];

  const getFilterDisplayName = () => {
    if (!filterType || !filterId) return "Lọc";
    if (filterType === "category") {
      const category = categories.find((c) => c.categoryId === filterId);
      return category ? `Lọc: ${category.categoryName}` : "Lọc";
    }
    if (filterType === "supplier") {
      const supplier = suppliers.find((s) => s.supplierId === filterId);
      return supplier ? `Lọc: ${supplier.name}` : "Lọc";
    }
    return "Lọc";
  };

  // ✅ JSX
  return (
    <div className="product-manage-container">
      <div className="product-manage-header">
        <h2>Quản lý sản phẩm</h2>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <Dropdown menu={{ items: filterMenuItems }} trigger={["click"]}>
              <Button
                icon={<FilterOutlined />}
                size="large"
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
          >
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="product-manage-table">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="productId"
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (t) => (
              <span>
                Tổng <b style={{ color: "red" }}>{t}</b> sản phẩm
              </span>
            ),
            onChange: (page, size) => fetchProducts(page, size),
          }}
          scroll={{ y: 420, x: 1200 }}
        />
      </div>

      <Modal
        title={editingProduct ? "Sửa Thông Tin Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
        style={{ top: 70 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item label="Hình ảnh" style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                Chọn hình
              </div>
            </div>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="productName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                  { max: 100, message: "Tên không quá 100 ký tự" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Đơn vị"
                name="unit"
                rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
              >
                <Input placeholder="Nhập đơn vị (cái, kg...)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Barcode"
                name="barcode"
                rules={[{ required: true, message: "Vui lòng nhập barcode" }]}
              >
                <Input placeholder="Nhập barcode" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Nhập giá" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((c) => (
                    <Option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplierId"
                rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  {suppliers.map((s) => (
                    <Option key={s.supplierId} value={s.supplierId}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
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
  );
}
