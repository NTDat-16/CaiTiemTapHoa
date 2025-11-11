import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, InputNumber, Spin } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "./Adjustment.css";

const { Option } = Select;
const { TextArea } = Input;

export default function Adjustment() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchProductId, setSearchProductId] = useState(null);
  const [searchReason, setSearchReason] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const API_BASE = "http://localhost:5000/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchAdjustments = async (page = pageNumber, size = pageSize, productId = searchProductId, reason = searchReason) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/inventory/adjustments?pageNumber=${page}&pageSize=${size}`;
      if (productId) url += `&productId=${productId}`;
      if (reason) url += `&reason=${encodeURIComponent(reason)}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setAdjustments(result.data.items || []);
        setTotalItems(result.data.totalCount || 0);
        setPageNumber(result.data.pageNumber || page);
        setPageSize(result.data.pageSize || size);
      } else {
        message.error(result.message || "Lỗi khi tải danh sách điều chỉnh");
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách điều chỉnh");
    } finally {
      setLoading(false);
    }
  };

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
      
      if (result.success) {
        const productsData = result.data?.items || result.data || [];
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
    fetchAdjustments();
    fetchProducts(""); // Load sản phẩm ngay khi component mount
  }, []);

  const handleCreateNew = () => {
    form.resetFields();
    setIsModalOpen(true);
    // Load lại sản phẩm khi mở modal
    if (products.length === 0) {
      fetchProducts("");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        productId: values.productId,
        quantity: values.actionType === "decrease" ? -values.quantity : values.quantity,
        reason: values.reason,
        notes: values.notes || ""
      };

      const response = await fetch(`${API_BASE}/inventory/adjustments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        message.success("Tạo phiếu điều chỉnh thành công");
        setIsModalOpen(false);
        form.resetFields();
        fetchAdjustments();
      } else {
        message.error(result.message || "Lỗi khi tạo phiếu điều chỉnh");
      }
    } catch (error) {
      console.error("Error creating adjustment:", error);
      message.error("Lỗi khi tạo phiếu điều chỉnh");
    }
  };

  const handleProductSearch = useCallback((value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(value);
    }, 300);
  }, [fetchProducts]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSearch = () => {
    fetchAdjustments(1, pageSize, searchProductId, searchReason);
  };

  const columns = [
    {
      title: "Ngày giờ",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 250,
      align: "center",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 250,
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "center",
      render: (quantity) => (
        <span style={{ 
          color: quantity < 0 ? "#dc2626" : "#059669",
          fontWeight: "bold",
          fontSize: "14px"
        }}>
          {quantity > 0 ? `+${quantity}` : quantity}
        </span>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      align: "center",
    },
    {
      title: "Người thực hiện",
      dataIndex: "staffName",
      key: "staffName",
      width: 200,
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      align: "center",
      render: (notes) => notes || "-",
    },
  ];

  return (
    <div className="adjustment-manage-container">
      {/* Card Header */}
      <div className="adjustment-header-card">
        <div className="adjustment-manage-header">
          <h2>Lịch sử Điều chỉnh Tồn kho</h2>
          <div className="header-actions">
            <div className="search-filter-group">
              <Select
                placeholder="Lọc theo sản phẩm"
                allowClear
                showSearch
                size="large"
                value={searchProductId || undefined}
                onChange={(value) => setSearchProductId(value || null)}
                onSearch={handleProductSearch}
                filterOption={false}
                loading={productLoading}
                notFoundContent={productLoading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
                style={{ width: 250 }}
              >
                {products.map((product) => (
                  <Option key={product.productId} value={product.productId}>
                    {product.productName}
                  </Option>
                ))}
              </Select>

              <Input
                placeholder="Lọc theo lý do..."
                allowClear
                size="large"
                value={searchReason}
                onChange={(e) => setSearchReason(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 200 }}
              />

              <Button
                type="default"
                icon={<SearchOutlined />}
                size="large"
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              size="large"
            >
              Tạo phiếu điều chỉnh
            </Button>
          </div>
        </div>
      </div>

      <div className="adjustment-manage-table">
        <Table
          columns={columns}
          dataSource={adjustments}
          rowKey="adjustmentId"
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) => (
              <span>
                Tổng <span style={{ color: 'red', fontWeight: 'bold' }}>{total}</span> điều chỉnh
              </span>
            ),
            onChange: (page, size) => {
              fetchAdjustments(page, size, searchProductId, searchReason);
            },
          }}
          scroll={{ y: 420, x: 1200 }}
        />
      </div>

      <Modal
        title="Tạo phiếu điều chỉnh kho"
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={600}
        footer={null}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" autoComplete="off">
          <Form.Item
            label="Sản phẩm"
            name="productId"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select
              placeholder="Tìm kiếm sản phẩm..."
              showSearch
              onSearch={handleProductSearch}
              filterOption={false}
              loading={productLoading}
              notFoundContent={productLoading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
              getPopupContainer={(trigger) => trigger.parentNode}
            >
              {products.map((product) => (
                <Option key={product.productId} value={product.productId}>
                  {product.productName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <Form.Item
              label="Hành động"
              name="actionType"
              rules={[{ required: true, message: "Chọn hành động" }]}
            >
              <Select 
                placeholder="Chọn hành động..."
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Option value="increase">
                  <span style={{ color: "#059669", fontWeight: "600" }}>⬆ Tăng</span>
                </Option>
                <Option value="decrease">
                  <span style={{ color: "#dc2626", fontWeight: "600" }}>⬇ Giảm</span>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[
                { required: true, message: "Nhập số lượng" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" }
              ]}
            >
              <InputNumber
                placeholder="Nhập số lượng..."
                min={1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input placeholder="VD: Hàng hỏng vỡ, Kiểm kho chênh lệch, Khách trả hàng..." />
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <TextArea
              placeholder="Nhập ghi chú (không bắt buộc)..."
              rows={4}
              style={{ resize: "none" }}
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Xác nhận điều chỉnh
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
