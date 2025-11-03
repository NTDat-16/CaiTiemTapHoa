import { useState, useEffect, useRef, useCallback } from "react"; // THAY ĐỔI 1: Import useRef, useCallback
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
  InputNumber,
  Popconfirm,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import "./Inventory.css";

const { Option } = Select;

export default function InventoryManage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const [filterUnit, setFilterUnit] = useState(null);
  const [unitOptions, setUnitOptions] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [importForm] = Form.useForm();
  const [allProducts, setAllProducts] = useState([]);
  const [importList, setImportList] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [productLoading, setProductLoading] = useState(false);

  // thay doi: Dùng useRef thay vì useState cho timer
  const searchTimeoutRef = useRef(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // (useEffect fetchInventory... không thay đổi)
  useEffect(() => {
    const fetchInventory = async (page = 1, pageSize = 10) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
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
            inventory_id: item.inventoryId,
            product_id: item.product.productId,
            product_name: item.product.productName,
            quantity: item.quantity,
            unit: item.product.unit,
          }));
          setProducts(items);

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
        message.error("Đã xảy ra lỗi khi gọi API tồn kho.");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize, refreshKey]);

  // (useEffect fetchLowStock... không thay đổi)
  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/inventory/low-stock`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          const lowStockItems = response.data.data.map((item) => ({
            inventory_id: item.inventoryId,
            product_id: item.product.productId,
            product_name: item.product.productName,
            quantity: item.quantity,
            unit: item.product.unit,
          }));
          setLowStock(lowStockItems);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm sắp hết hàng:", error);
      }
    };

    fetchLowStock();
  }, [refreshKey]);

  // THAY ĐỔI 3: Bọc hàm fetchProducts bằng useCallback
  const fetchProducts = useCallback(async (searchTerm = "") => {
    setProductLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/Products?searchTerm=${searchTerm}&PageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let productData = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        productData = response.data.data;
      } else if (
        response.data.success &&
        response.data.data &&
        Array.isArray(response.data.data.items)
      ) {
        productData = response.data.data.items;
      } else if (Array.isArray(response.data)) {
        productData = response.data;
      }
      const ActiveProduct = productData.filter(p => p.status === "Active" || p.status === "active");
      setAllProducts(ActiveProduct);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm.");
      setAllProducts([]);
    } finally {
      setProductLoading(false);
    }
  }, []); // Dependency array rỗng vì nó không phụ thuộc state/props nào

  useEffect(() => {
    if (isImportModalOpen) {
      fetchProducts("");
    }
  }, [isImportModalOpen, fetchProducts]); // Thêm fetchProducts vào dependency

  // (Các hàm handler khác... không thay đổi)
  const filteredProducts = products.filter((product) => {
    if (!filterUnit || filterUnit === null) {
      return true;
    }
    return product.unit === filterUnit;
  });

  const handleUnitFilterChange = (value) => {
    setFilterUnit(value);
  };

  const handleCancel = () => {
    setIsImportModalOpen(false);
    importForm.resetFields();
    setImportList([]);
  };

  const handleAddItemToImportList = (values) => {
    const { productId, quantity } = values;

    if (!productId) {
      message.error("ID sản phẩm không hợp lệ, không thể thêm!");
      return;
    }

    const productDetails = allProducts.find((p) => p.productId === productId);

    if (!productDetails) {
      message.error("Sản phẩm không hợp lệ!");
      return;
    }

    setImportList((prevList) => {
      const existingItem = prevList.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        return prevList.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevList,
          {
            productId: productDetails.productId,
            productName: productDetails.productName,
            unit: productDetails.unit,
            quantity: quantity,
          },
        ];
      }
    });

    importForm.resetFields(["productId", "quantity"]);
  };

  const handleRemoveFromImportList = (productId) => {
    setImportList((prevList) =>
      prevList.filter((item) => item.productId !== productId)
    );
  };

  const handleFinalizeImport = async () => {
    if (importList.length === 0) {
      message.error("Danh sách nhập hàng đang trống!");
      return;
    }

    const body = {
      items: importList.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/inventory`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        message.success("Nhập hàng thành công!");
        handleCancel();
        setRefreshKey((k) => k + 1);
      } else {
        message.error(response.data.message || "Nhập hàng thất bại.");
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi gọi API nhập hàng.");
    }
  };

  // THAY ĐỔI 4: Bọc hàm search bằng useCallback và dùng useRef
  const handleProductSearch = useCallback(
    (value) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        fetchProducts(value);
      }, 300);
    },
    [fetchProducts]
  ); // Phụ thuộc vào hàm fetchProducts đã bọc

  // (columns, importTableColumns, handleTableChange... không thay đổi)
  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Số lượng tồn",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => {
        const isLowStock = quantity < 10; // Ngưỡng cảnh báo
        return (
          <span style={{ 
            color: isLowStock ? 'red' : 'inherit',
            fontWeight: isLowStock ? 'bold' : 'normal'
          }}>
            {quantity}
          </span>
        );
      }
    },
    { title: "Đơn vị", dataIndex: "unit", key: "unit" },
  ];

  const importTableColumns = [
    {
      title: "STT",
      key: "index",
      align: "center",
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: "45%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "20%",
      align: "center",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: "20%",
      align: "center",
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xoá?"
          onConfirm={() => handleRemoveFromImportList(record.productId)}
          okText="Xoá"
          cancelText="Huỷ"
          getPopupContainer={(trigger) => trigger.parentNode}
        >
          <Button type="primary" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // (JSX return... không thay đổi)
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
          </Space>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Alert
          message={`Có ${lowStock.length} sản phẩm sắp hết hàng!`}
          description={
            <ul style={{ 
              margin: 0, 
              paddingLeft: 20,
              maxHeight: '70px',
              overflowY: 'auto',
            }}>
              {lowStock.map((item) => (
                <li key={item.inventory_id}>
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
          rowKey="inventory_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) => (
              <span>
                Tổng {""}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {total}
                </span>{" "}
                sản phẩm
              </span>
            ),
          }}
          onChange={handleTableChange}
          scroll={{ y: lowStock.length > 0 ? 260 : 400, x: 1200 }}
        />
      </div>

      <Modal
        title="Nhập Hàng"
        open={isImportModalOpen}
        onCancel={handleCancel}
        width={800}
        footer={null}
        destroyOnClose
        style={{ top: 20 }}
        closable={false}
      >
        <Form
          form={importForm}
          onFinish={handleAddItemToImportList}
          autoComplete="off"
        >
          <Space align="start" wrap style={{ width: "100%", marginBottom: 16 }}>
            <Form.Item
              name="productId"
              rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
              style={{ flexGrow: 1, minWidth: 400, marginBottom: 0 }}
            >
              <Select
                size="large"
                placeholder="Tìm sản phẩm theo tên..."
                showSearch
                onSearch={handleProductSearch}
                loading={productLoading}
                filterOption={false}
                notFoundContent={
                  productLoading ? (
                    <Spin size="small" />
                  ) : (
                    "Không tìm thấy sản phẩm"
                  )
                }
                getPopupContainer={(trigger) => trigger.parentNode}
                style={{ width: "100%" }}
              >
                {allProducts.map((product) => (
                  <Option key={product.productId} value={product.productId}>
                    {product.productName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              rules={[
                { required: true, message: "Nhập số lượng" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                size="large"
                placeholder="Số lượng"
                min={1}
                style={{ width: 150 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large">
                Thêm vào danh sách
              </Button>
            </Form.Item>
          </Space>
        </Form>

        <Table
          className="import-list-table"
          columns={importTableColumns}
          dataSource={importList}
          rowKey="productId"
          pagination={false}
          bordered
          scroll={{ y: 300 }}
          title={() => (
            <b>Danh sách nhập hàng ({importList.length} sản phẩm)</b>
          )}
          locale={{ emptyText: "Chưa có sản phẩm nào trong danh sách" }}
        />

        <div
          style={{
            textAlign: "right",
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Space>
            <Button size="large" onClick={handleCancel}>
              Huỷ
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleFinalizeImport}
              disabled={importList.length === 0}
            >
              Xác nhận nhập hàng
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
}
