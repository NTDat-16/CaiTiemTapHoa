import { useState, useEffect } from "react";
import {
  Table,
  Alert,
  Select,
  Space,
  message,
} from "antd";
import axios from "axios";
import "./Inventory.css";

const { Option } = Select;

export default function InventoryManage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const [filterUnit, setFilterUnit] = useState(null);
  const [unitOptions, setUnitOptions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

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


  const filteredProducts = products.filter((product) => {
    if (!filterUnit || filterUnit === null) {
      return true;
    }
    return product.unit === filterUnit;
  });

  const handleUnitFilterChange = (value) => {
    setFilterUnit(value);
  };


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
          <span
            style={{
              color: isLowStock ? "red" : "inherit",
              fontWeight: isLowStock ? "bold" : "normal",
            }}
          >
            {quantity}
          </span>
        );
      },
    },
    { title: "Đơn vị", dataIndex: "unit", key: "unit" },
  ];

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // (JSX return... không thay đổi)
  return (
    <div className="inventory-manage-container">
      <div className="inventory-manage-header">
        <h2> Quản Lý Tồn Kho</h2>
        <Space>
          <Select
            allowClear
            placeholder="Chọn đơn vị"
            style={{ width: 150 }}
            onChange={handleUnitFilterChange}
            options={[{ label: "Tất cả", value: "" }, ...unitOptions]}
          />
        </Space>
      </div>

      {lowStock.length > 0 && (
        <Alert
          message={`Có ${lowStock.length} sản phẩm sắp hết hàng!`}
          description={
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                maxHeight: "70px",
                overflowY: "auto",
              }}
            >
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
    </div>
  );
}
