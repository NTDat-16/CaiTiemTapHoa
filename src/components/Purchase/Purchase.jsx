import { useState, useEffect, useRef, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag, InputNumber, Popconfirm, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "./Purchase.css";
const { Option } = Select;

export default function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form] = Form.useForm();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productLoading, setProductLoading] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);

  const searchTimeoutRef = useRef(null);

  const API_BASE = "http://localhost:5000/api";

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Updated fetchPurchases function to handle the new API response structure
  const fetchPurchases = async (page = pageNumber, size = pageSize, search = searchTerm, status = statusFilter) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/purchases?pageNumber=${page}&pageSize=${size}`;
      if (search) url += `&searchTerm=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setPurchases(result.data.items || []);
        setTotalItems(result.data.totalCount || 0);
        setPageNumber(result.data.pageNumber || page);
        setPageSize(result.data.pageSize || size);
      } else {
        message.error(result.message || "Lỗi khi tải danh sách đơn nhập hàng");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn nhập hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = useCallback(async (searchTerm = "") => {
    setSupplierLoading(true);
    try {
      let url = `${API_BASE}/suppliers?pageSize=100`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      console.log("Suppliers API response:", result);
      
      if (result.success) {
        const suppliersData = result.data?.items || result.data || [];
        console.log("Suppliers data:", suppliersData);
        if (suppliersData.length > 0) {
          console.log("First supplier object:", suppliersData[0]);
          console.log("Supplier field names:", Object.keys(suppliersData[0]));
        }
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      setSuppliers([]);
      console.error("Lỗi khi tải danh sách nhà cung cấp:", error);
    } finally {
      setSupplierLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (searchTerm = "") => {
    setProductLoading(true);
    try {
      let url = `${API_BASE}/products?pageSize=100`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      console.log("Products API response:", result);
      
      if (result.success) {
        const productsData = result.data?.items || result.data || [];
        console.log("Products data:", productsData);
        if (productsData.length > 0) {
          console.log("First product object:", productsData[0]);
          console.log("Product field names:", Object.keys(productsData[0]));
        }
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setProductLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers("");
    fetchProducts("");
  }, []);

  useEffect(() => {
    if (isDetailModalOpen) {
      fetchSuppliers("");
      fetchProducts("");
    }
  }, [isDetailModalOpen]);

  // Create new purchase
  const handleCreateNew = () => {
    setCurrentPurchase(null);
    setPurchaseItems([]);
    form.resetFields();
    setIsDetailModalOpen(true);
    // Load suppliers and products when opening modal
    fetchSuppliers();
    fetchProducts();
  };

  // View purchase detail
  const handleViewDetail = async (purchase) => {
    setCurrentPurchase(purchase);
    setPurchaseItems(purchase.purchaseItems || []);
    form.setFieldsValue({
      supplierId: purchase.supplierId,
      notes: purchase.notes,
    });
    setIsDetailModalOpen(true);
    // Load suppliers and products when opening modal
    fetchSuppliers();
    fetchProducts();
  };

  // Save draft (Pending status)
  const handleSaveDraft = async (values) => {
    try {
      if (purchaseItems.length === 0) {
        message.error("Vui lòng thêm ít nhất một sản phẩm");
        return;
      }

      const payload = {
        supplierId: values.supplierId,
        notes: values.notes || "",
        items: purchaseItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
        })),
      };

      console.log("Payload gửi lên API:", payload);

      const response = await fetch(`${API_BASE}/purchases`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        message.success("Lưu đơn nháp thành công");
        setIsDetailModalOpen(false);
        setPurchaseItems([]);
        setSelectedProductId(null);
        setProductQuantity(1);
        form.resetFields();
        fetchPurchases();
      } else {
        message.error(result.message || "Lỗi khi lưu đơn nhập hàng");
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      message.error("Lỗi khi lưu đơn nhập hàng");
    }
  };

  // Confirm purchase
  const handleConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE}/purchases/${currentPurchase.purchaseId}/confirm`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (result.success) {
        message.success("Xác nhận nhập kho thành công");
        setIsDetailModalOpen(false);
        fetchPurchases();
      } else {
        message.error(result.message || "Lỗi khi xác nhận đơn nhập hàng");
      }
    } catch (error) {
      message.error("Lỗi khi xác nhận đơn nhập hàng");
    }
  };

  // Cancel purchase
  const handleCancel = async () => {
    try {
      const response = await fetch(`${API_BASE}/purchases/${currentPurchase.purchaseId}/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (result.success) {
        message.success("Hủy đơn nhập hàng thành công");
        setIsDetailModalOpen(false);
        fetchPurchases();
      } else {
        message.error(result.message || "Lỗi khi hủy đơn nhập hàng");
      }
    } catch (error) {
      message.error("Lỗi khi hủy đơn nhập hàng");
    }
  };

  // Add product to purchase items
  const handleAddProduct = (productId) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    const existingItem = purchaseItems.find(item => item.productId === productId);
    if (existingItem) {
      message.warning("Sản phẩm đã có trong đơn nhập hàng");
      return;
    }

    const newItem = {
      productId: product.productId,
      productName: product.productName,
      quantity: productQuantity || 1,
      purchasePrice: 0,
      subtotal: 0,
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSelectedProductId(null);
    setProductQuantity(1);
    message.success(`Đã thêm ${product.productName}`);
  };

  // Handle add product button click
  const handleAddProductClick = () => {
    if (!selectedProductId) {
      message.warning("Vui lòng chọn sản phẩm");
      return;
    }
    handleAddProduct(selectedProductId);
  };

  // Update purchase item
  const handleUpdateItem = (productId, field, value) => {
    const updatedItems = purchaseItems.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, [field]: value };
        updated.subtotal = updated.quantity * updated.purchasePrice;
        return updated;
      }
      return item;
    });
    setPurchaseItems(updatedItems);
  };

  // Remove product from purchase items
  const handleRemoveItem = (productId) => {
    setPurchaseItems(purchaseItems.filter(item => item.productId !== productId));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  // Handle supplier search
  const handleSupplierSearch = useCallback((value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuppliers(value);
    }, 300);
  }, [fetchSuppliers]);

  // Handle product search
  const handleProductSearch = useCallback((value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(value);
    }, 300);
  }, [fetchProducts]);

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setCurrentPurchase(null);
    setPurchaseItems([]);
    setSelectedProductId(null);
    setProductQuantity(1);
    form.resetFields();
  };

  // Updated columns to match the API response structure
  const columns = [
    { 
      title: "Mã đơn nhập", 
      dataIndex: "purchaseId", 
      key: "purchaseId", 
      width: 120,
      render: (id) => id
    },
    { title: "Nhà cung cấp", dataIndex: "supplierName", key: "supplierName", width: 180 },
    { title: "Người tạo", dataIndex: "userName", key: "userName", width: 150 },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status", 
      width: 150,
      render: (status) => {
        let color = "orange";
        if (status === "Confirmed") color = "green";
        if (status === "Canceled") color = "red";
        return <Tag color={color}>{status === "Pending" ? "Chờ xác nhận" : status === "Confirmed" ? "Đã xác nhận" : "Đã hủy"}</Tag>;
      },
    },
    { 
      title: "Tổng tiền", 
      dataIndex: "totalAmount", 
      key: "totalAmount", 
      width: 150,
      render: (amount) => amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0 ₫",
    },
    { 
      title: "Ngày tạo", 
      dataIndex: "createdAt", 
      key: "createdAt", 
      width: 150,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Get status tag color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "orange";
      case "Confirmed": return "green";
      case "Canceled": return "red";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Pending": return "Chờ xác nhận";
      case "Confirmed": return "Đã xác nhận";
      case "Canceled": return "Đã hủy";
      default: return status;
    }
  };

  // Is editable
  const isEditable = () => {
    return !currentPurchase || currentPurchase.status === "Pending";
  };

  // Purchase items table columns
  const itemColumns = [
    {
      title: "STT",
      key: "index",
      align: "center",
      width: 60,
      render: (text, record, index) => index + 1,
    },
    { 
      title: "Tên sản phẩm", 
      dataIndex: "productName", 
      key: "productName", 
      width: "30%"
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "20%",
      align: "center",
      render: (value, record) => (
        isEditable() ? (
          <InputNumber
            min={1}
            value={value}
            onChange={(val) => handleUpdateItem(record.productId, "quantity", val)}
            style={{ width: "100%" }}
          />
        ) : value
      ),
    },
    {
      title: "Giá nhập",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      width: "20%",
      align: "center",
      render: (value, record) => (
        isEditable() ? (
          <InputNumber
            min={0}
            value={value}
            onChange={(val) => handleUpdateItem(record.productId, "purchasePrice", val)}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            style={{ width: "100%" }}
          />
        ) : (
          value?.toLocaleString("vi-VN") + " ₫"
        )
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "subtotal",
      key: "subtotal",
      width: "20%",
      align: "center",
      render: (value) => value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0 ₫",
    },
    {
      title: "Thao tác",
      key: "action",
      width: "10%",
      align: "center",
      render: (_, record) => (
        isEditable() && (
          <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleRemoveItem(record.productId)}
            okText="Xóa"
            cancelText="Hủy"
            getPopupContainer={(trigger) => trigger.parentNode}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div className="purchase-manage-container">
      <div className="purchase-manage-header">
        <h2>Quản lý Nhập hàng</h2>
        <div className="header-actions">
          {/* Bộ lọc & Tìm kiếm */}
          <div className="search-filter-group">
            <Input
              placeholder="Tìm theo NCC, ghi chú, người tạo..."
              prefix={<SearchOutlined />}
              allowClear
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={() => fetchPurchases(1, pageSize, searchTerm, statusFilter)}
              style={{ width: 300 }}
            />

            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              size="large"
              value={statusFilter || undefined}
              onChange={(value) => {
                setStatusFilter(value || "");
                fetchPurchases(1, pageSize, searchTerm, value || "");
              }}
              style={{ width: 200 }}
            >
              <Option value="">Tất cả</Option>
              <Option value="Pending">Chờ xác nhận</Option>
              <Option value="Confirmed">Đã xác nhận</Option>
              <Option value="Canceled">Đã hủy</Option>
            </Select>

            <Button
              type="default"
              icon={<SearchOutlined />}
              size="large"
              onClick={() => fetchPurchases(1, pageSize, searchTerm, statusFilter)}
            >
              Tìm kiếm
            </Button>
          </div>

          {/* Nút tạo mới */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
            size="large"
          >
            Tạo đơn nhập hàng
          </Button>
        </div>
      </div>

      <div className="purchase-manage-table">
        <Table
          columns={columns}
          dataSource={purchases}
          rowKey="purchaseId"
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) => (
              <span>
                Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> đơn nhập hàng
              </span>
            ),
            onChange: (page, size) => {
              fetchPurchases(page, size, searchTerm, statusFilter);
            },
          }}
          scroll={{ y: 420, x: 1200 }}
        />
      </div>

      {/* Modal Chi tiết / Tạo mới */}
      <Modal
        title={currentPurchase ? `Chi tiết đơn nhập - PURCHASE-${String(currentPurchase.purchaseId).padStart(3, '0')}` : "Tạo đơn nhập hàng"}
        open={isDetailModalOpen}
        onCancel={handleCloseModal}
        width={900}
        footer={null}
        destroyOnClose
        style={{ top: 20 }}
        closable={false}
      >
        <Form form={form} onFinish={handleSaveDraft} layout="vertical" autoComplete="off">
          {/* Thông tin đơn hàng nếu đã tồn tại */}
          {currentPurchase && (
            <div style={{ marginBottom: 16, padding: 10, background: "#f0f0f0", borderRadius: 4 }}>
              <Space size="large" wrap>
                <span>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={getStatusColor(currentPurchase.status)}>
                    {getStatusText(currentPurchase.status)}
                  </Tag>
                </span>
                <span><strong>Người tạo:</strong> {currentPurchase.userName}</span>
                <span><strong>Ngày tạo:</strong> {new Date(currentPurchase.createdAt).toLocaleString("vi-VN")}</span>
              </Space>
            </div>
          )}

          {/* Form nhập thông tin - Hàng 1: Nhà cung cấp + Tìm sản phẩm + Button thêm */}
          {isEditable() && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 12, marginBottom: 16 }}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplierId"
                rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp" }]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Chọn nhà cung cấp..."
                  showSearch
                  onSearch={handleSupplierSearch}
                  filterOption={false}
                  loading={supplierLoading}
                  notFoundContent={supplierLoading ? <Spin size="small" /> : "Không tìm thấy nhà cung cấp"}
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {suppliers.map((supplier) => (
                    <Option key={supplier.supplierId} value={supplier.supplierId}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Tìm kiếm sản phẩm" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="Nhập tên sản phẩm..."
                  showSearch
                  value={selectedProductId}
                  onSearch={handleProductSearch}
                  onChange={(value) => setSelectedProductId(value)}
                  filterOption={false}
                  loading={productLoading}
                  notFoundContent={productLoading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
                  allowClear
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {products.map((product) => (
                    <Option key={product.productId} value={product.productId}>
                      {product.productName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label=" " style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  onClick={handleAddProductClick}
                  disabled={!selectedProductId}
                  style={{ width: "100%" }}
                  icon={<PlusOutlined />}
                >
                  Thêm
                </Button>
              </Form.Item>
            </div>
          )}

          {/* Hiển thị nhà cung cấp khi không editable */}
          {!isEditable() && currentPurchase && (
            <Form.Item
              label="Nhà cung cấp"
              name="supplierId"
              style={{ marginBottom: 16 }}
            >
              <Select disabled>
                {suppliers.map((supplier) => (
                  <Option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Bảng danh sách sản phẩm */}
          <Table
            columns={itemColumns}
            dataSource={purchaseItems}
            rowKey="productId"
            pagination={false}
            bordered
            scroll={{ y: 200 }}
            size="small"
            title={() => <b>Danh sách sản phẩm ({purchaseItems.length})</b>}
            locale={{ emptyText: "Chưa có sản phẩm nào" }}
            style={{ marginBottom: -80 }}
          />

          {/* Ghi chú dưới bảng */}
          <Form.Item 
            label="Ghi chú" 
            name="notes"
            style={{ marginBottom: 12 }}
          >
            <Input.TextArea
              placeholder="Nhập ghi chú cho đơn nhập hàng..."
              disabled={!isEditable()}
              rows={4}
              style={{ resize: "none", fontSize: "14px" }}
            />
          </Form.Item>

          {/* Tổng tiền và nút */}
          <div style={{ paddingTop: 12, borderTop: "1px solid #e8e8e8" }}>
            <div style={{ textAlign: "right", marginBottom: 12 }}>
              <Space direction="vertical" size={0} align="end">
                <span style={{ fontSize: 13, color: "#888" }}>Tổng tiền:</span>
                <h3 style={{ margin: 0, color: "#52c41a", fontSize: 22 }}>
                  {calculateTotal().toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </h3>
              </Space>
            </div>

            <div style={{ textAlign: "right" }}>
              <Space>
                <Button onClick={handleCloseModal}>Đóng</Button>

                {!currentPurchase && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    disabled={purchaseItems.length === 0}
                  >
                    Lưu đơn nháp
                  </Button>
                )}

                {currentPurchase?.status === "Pending" && (
                  <>
                    <Button danger icon={<CloseCircleOutlined />} onClick={handleCancel}>
                      Hủy đơn
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleConfirm}
                      style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    >
                      Xác nhận nhập kho
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}