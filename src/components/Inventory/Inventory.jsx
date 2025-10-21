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
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

  const fetchProducts = async (searchTerm = "") => {
    setProductLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/Products?searchTerm=${searchTerm}&PageSize=25`,
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

      setAllProducts(productData);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm.");
      setAllProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    if (isImportModalOpen) {
      fetchProducts("");
    }
  }, [isImportModalOpen]);

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

  const handleProductSearch = (value) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(
      setTimeout(() => {
        fetchProducts(value);
      }, 300)
    );
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
  ];

  const importTableColumns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xoá?"
          onConfirm={() => handleRemoveFromImportList(record.productId)}
          okText="Xoá"
          cancelText="Huỷ"
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
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
          </Space>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Alert
          message={`Có ${lowStock.length} sản phẩm sắp hết hàng!`}
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
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
            showTotal: (total) => (
              <span>
                Tổng{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {total}
                </span>{" "}
                Sản phẩm
              </span>
            ),
          }}
          onChange={handleTableChange}
          scroll={{ y: 400, x: 1200 }}
        />
      </div>

      <Modal
        title="Nhập Hàng"
        open={isImportModalOpen}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Form
          form={importForm}
          onFinish={handleAddItemToImportList}
          autoComplete="off"
        >
          <Space align="start" wrap style={{ width: "100%", marginBottom: 8 }}>
            <Form.Item
              name="productId"
              rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
              style={{ flexGrow: 1, minWidth: 400 }}
            >
              <Select
                size="large"
                placeholder="Tìm sản phẩm theo tên..."
                showSearch
                onSearch={handleProductSearch}
                loading={productLoading}
                filterOption={false}
                notFoundContent={
                  productLoading ? <Spin size="small" /> : "Không tìm thấy"
                }
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
            >
              <InputNumber
                size="large"
                placeholder="Số lượng"
                min={1}
                style={{ width: 150 }}
              />
            </Form.Item>

            <Form.Item>
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
          title={() => <b>Danh sách nhập hàng</b>}
        />

        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <Space>
            <Button key="back" onClick={handleCancel}>
              Huỷ
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={handleFinalizeImport}
              disabled={importList.length === 0}
            >
              Nhập Hàng
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
}
