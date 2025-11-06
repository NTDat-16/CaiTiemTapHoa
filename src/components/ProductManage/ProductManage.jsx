import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Dropdown, InputNumber,Upload, Row,Col } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons"
import "./ProductManage.css"
const { Option } = Select

export default function ProductManage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState(null)
  const [filterId, setFilterId] = useState(null)
  const [form] = Form.useForm()
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE = "http://localhost:5000/api";
  const API_IMAGE = "http://localhost:5000";
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  //Danh sách sản phẩm
  const fetchProducts = async (page = pageNumber, size = pageSize) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/Products?PageNumber=${page}&PageSize=${size}`, {
        headers: { ...authHeader },
      });
      const result = await response.json();

      const productsArray = Array.isArray(result?.data?.items) ? result.data.items : [];
      setProducts(productsArray);
      if (result?.data?.totalCount) {
        setTotalItems(result.data.totalCount);
      }

      setPageNumber(page);
      setPageSize(size);
    } catch (error) {
      console.error("Fetch products error:", error);
      message.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  //Danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    try {
      // TODO: Uncomment when API is ready
      const response = await fetch(`${API_BASE}/Suppliers?PageNumber=1&PageSize=100`, {
        headers: { ...authHeader },
      });
      const result = await response.json();
      const suppliersArray = Array.isArray(result?.data?.items) ? result.data.items : [];
      const supplierStatus = suppliersArray.filter(sup => sup.status?.toLowerCase() === "active");
      setSuppliers(supplierStatus);
    } catch (error) {
      message.error("Lỗi khi tải nhà cung cấp")
    }
  }

  //Danh sách danh mục
  const fetchCategories = async () => {
    try {
      // TODO: Uncomment when API is ready
      const response = await fetch(`${API_BASE}/Categories?PageNumber=1&PageSize=100`, {
        headers: { ...authHeader },
      });
      const result = await response.json();
      const categoriesArray = Array.isArray(result?.data?.items) ? result.data.items : [];
      const categoriesStatus = categoriesArray.filter(cat => cat.status?.toLowerCase() === "active")
      setCategories(categoriesStatus);
    } catch (error) {
      message.error("Lỗi khi tải danh mục")
    }
  }

  useEffect(() => {
    fetchProducts(pageNumber, pageSize)
    fetchCategories()
    fetchSuppliers()
    if (editingProduct) {
      form.setFieldsValue({
        productName: editingProduct.productName,
        barcode: editingProduct.barcode,
        price: editingProduct.price,
        unit: editingProduct.unit,
        categoryId: editingProduct.categoryId,
        supplierId: editingProduct.supplierId,
        imagePath: editingProduct.imagePath,
      });
      setPreviewImage(
        editingProduct.imagePath && editingProduct.imagePath.trim() !== ""
          ? editingProduct.imagePath.startsWith("http")
            ? editingProduct.imagePath
            : `${API_IMAGE}${editingProduct.imagePath}`
          : "/img/Default_Product.png"
      );
    } else {
      form.resetFields();
      setPreviewImage("img/Default_Product.png");
    }
  }, [editingProduct, form, pageNumber, pageSize]);

  // Table columns definition
  const columns = [
    {title: "Mã",dataIndex: "productId",key: "productId",width: 70,},
    {title: "Hình ảnh",
      dataIndex: "imagePath",
      key: "imagePath",
      width: 90,
      render: (imagePath) => {
        const imageUrl = imagePath ? imagePath.startsWith("http")
        ? imagePath
        : `${API_IMAGE}${imagePath}`
        : "/img/Default_Product.png"; // fallback mặc định trong public
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
    
    {title: "Tên sản phẩm",dataIndex: "productName",key: "productName",width: 150,},
    {title: "Barcode",dataIndex: "barcode",key: "barcode",width: 150,},
    {title: "Giá (VNĐ)",dataIndex: "price",key: "price",width: 150,
      render: (price) => `${price.toLocaleString("vi-VN")} ₫`,
    },
    {title: "Đơn vị",dataIndex: "unit",key: "unit",width: 100,},
    {title: "Danh mục",dataIndex: "categoryId",key: "categoryId",width: 100,
      render: (categoryId) => {
        const category = categories.find((c) => c.categoryId === categoryId);
        return category ? category.categoryName : "-";
      },
    },
    {title: "Nhà cung cấp",dataIndex: "supplierId",key: "supplierId",width: 150,
      render: (supplierId) => {
        const supplier = suppliers.find((s) => s.supplierId === supplierId);
        return supplier ? supplier.name : "-";
       },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status === 'Active' ? 'CÒN KINH DOANH' : 'NGỪNG KINH DOANH'}
        </Tag>
      ),
    },
    {title: "Thao tác",key: "action",width: 150,fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            className="btn-edit"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.productId)} // ✅ sửa lại
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

  // DELETE product
  // const handleDelete = async (productId) => {
  //   try {
  //     const response = await fetch(`${API_BASE}/Products/${productId}`, {
  //       method: "DELETE",
  //       headers: { ...authHeader },
  //     });

  //     if (!response.ok) throw new Error("Delete failed");
  //     message.success("Xóa sản phẩm thành công");
  //     fetchProducts();
  //   } catch (error) {
  //     message.error("Lỗi khi xóa sản phẩm");
  //   }
  // };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/Products/${supplierId}`,
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
        throw new Error(data.message || "Xóa sản phẩm thất bại");
      }

      setProducts((prev) => prev.filter((p) => p.supplierId !== supplierId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total > 0 ? prev.total - 1 : 0,
      }));
      message.success("Xóa sản phẩm thành công");
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result); // hiển thị ảnh ngay
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Chuẩn bị FormData
      const formData = new FormData();
      formData.append("ProductName", values.productName);
      formData.append("CategoryId", values.categoryId);
      formData.append("SupplierId", values.supplierId);
      formData.append("Barcode", values.barcode);
      formData.append("Price", values.price);
      formData.append("Unit", values.unit);
      formData.append("Status", editingProduct ? values.status : "active");
      if (selectedFile) {
        formData.append("Image", selectedFile);
      }
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      let response;
      const url = editingProduct
        ? `${API_BASE}/Products/${editingProduct.productId}`
        : `${API_BASE}/Products`;
      const method = editingProduct ? "PUT" : "POST";

      response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          ...authHeader,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      message.success(editingProduct ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công");
        setIsModalOpen(false);
        form.resetFields();
        setPreviewImage(null);
        setSelectedFile(null);
        setTimeout(() => fetchProducts(pageNumber, pageSize), 500);
    } catch (error) {
      console.error("❌ Submit error:", error);
      message.error(`Lỗi khi lưu sản phẩm: ${error.message}`);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingProduct(null)
  }

  const filteredProducts = products.filter((product) => {
    if (filterType === "category" && filterId !== null) {
      return product.categoryId === filterId;
    }
    if (filterType === "supplier" && filterId !== null) {
      return product.supplierId === filterId;
    }
    if (filterType === "status" && filterId !== null) {
      return product.status?.toLowerCase() === filterId.toLowerCase();
    }
    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      return (
        product.productName?.toLowerCase().includes(keyword) ||
        product.barcode?.toLowerCase().includes(keyword) ||
        product.unit?.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  // Lọc theo nhà cung cấp
  const handleFilterBySupplier = (supplierId) => {
    setFilterType("supplier")
    setFilterId(supplierId)
    const supplier = suppliers.find((s) => s.supplierId === supplierId)
    message.success(`Đang lọc theo nhà cung cấp: ${supplier?.name}`)
  }

  //Lọc theo danh mục
  const handleFilterByCategory  = (categoryId) => {
    setFilterType("category")
    setFilterId(categoryId)
    const categories = categories.find((s) => s.categoryId === categoryId)
    message.success(`Đang lọc theo nhà cung cấp: ${categoryId?.name}`)
  }

  //Lọc theo danh mục
  const handleFilterByStatus = (status) => {
    setFilterType("status");
    setFilterId(status);

    message.success(`Đang lọc theo trạng thái: ${status}`);
  };


  //Xóa toàn bộ lọc
  const handleClearFilter = () => {
    setFilterType(null)
    setFilterId(null)
    message.info("Đã xóa bộ lọc")
  }

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
    {
      key: "status",
      label: "Lọc theo Trạng thái",
      children: [
        { key: "active", label: "Còn kinh doanh", onClick: () => handleFilterByStatus("active") },
        { key: "inactive", label: "Ngừng kinh doanh", onClick: () => handleFilterByStatus("inactive") },
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
  ]

  const getFilterDisplayName = () => {
    if (!filterType || filterId === null) return "Lọc"
    if (filterType === "category") {
      const category = categories.find((c) => c.categoryId === filterId)
      return category ? `Lọc: ${category.categoryName}` : "Lọc"
    }

    if (filterType === "supplier") {
      const supplier = suppliers.find((s) => s.supplierId === filterId)
      return supplier ? `Lọc: ${supplier.name}` : "Lọc"
    }
    if (filterType === "status") {
      return filterId === "active" ? "Lọc: Còn kinh doanh" : "Lọc: Ngừng kinh doanh"
    }
    return "Lọc"
  }
  
  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  const handleStatusChange = async (value) => {
    form.setFieldValue("status", value);
  };

  return (
    <div className="product-manage-container">
      <div className="product-manage-header">
          <h2>Quản lý sản phẩm</h2>
          <div className="header-actions">
            {/* Nhóm bên trái: Search + Dropdown */}
            <div className="search-filter-group">
              <Input.Search
                placeholder="Tìm kiếm theo tên sản phẩm, barcode, giá, đơn vị, danh mục, nhà cung cấp..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="product-search-input"
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

            {/* Nút bên phải */}
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
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              showTotal: (total) => (
              <span>
                Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> sản phẩm
              </span>
            ),
              onChange: (page, size) => {
                fetchProducts(page, size);
              },
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
        closable={false}
        style={{ top: 50 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
        {/* Hình ảnh sản phẩm */}
        <Form.Item style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={previewImage || editingProduct?.imagePath || "/img/Default_Product.png"}
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
                  borderRadius: "8px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  pointerEvents: "none",
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
                  { max: 100, message: "Tên sản phẩm không quá 100 ký tự" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Đơn vị"
                name="unit"
                initialValue="cái"
                rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
              >
                <Input placeholder="Nhập đơn vị (cái, kg, ly...)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Barcode và Giá cùng hàng */}
          <Row gutter={16}>
            <Col span={12}>
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
            </Col>

            <Col span={12}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  { type: "number", min: 0, message: "Giá phải >= 0" },
                ]}
              >
                <InputNumber placeholder="Nhập giá" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Danh mục và nhà cung cấp */}
          <Row gutter={16}>
            <Col span={editingProduct ? 8 : 12}>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {categories.map((category) => (
                    <Option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={editingProduct ? 8 : 12}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplierId"
                rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {suppliers.map((supplier) => (
                    <Option key={supplier.supplierId} value={supplier.supplierId}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {editingProduct && (
              <Col span={8}>
                <Form.Item label="Trạng thái" name="status">
                  <Select
                    placeholder="Trạng thái"
                    onChange={handleStatusChange}
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    <Option value="Inactive">Ngừng Kinh Doanh</Option>
                    <Option value="Active">Còn Kinh Doanh</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>
          {/* Nút hành động */}
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
  )
}