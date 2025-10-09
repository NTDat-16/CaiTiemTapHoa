import { useState, useEffect } from "react";
import { Table, Alert } from "antd";
import "./Inventory.css";

// Mock data for products tồn kho
const mockProducts = [
  {
    product_id: 1,
    product_name: "Áo thun nam",
    quantity: 12,
    unit: "cái",
  },
  {
    product_id: 2,
    product_name: "Quần jean nữ",
    quantity: 3,
    unit: "cái",
  },
  {
    product_id: 3,
    product_name: "Bánh mì thịt",
    quantity: 0,
    unit: "cái",
  },
  {
    product_id: 4,
    product_name: "Cà phê sữa",
    quantity: 7,
    unit: "ly",
  },
  {
    product_id: 5,
    product_name: "Túi xách da",
    quantity: 25,
    unit: "cái",
  },
];

export default function InventoryManage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLowStock(mockProducts.filter((item) => item.quantity <= 5));
      setLoading(false);
    }, 300);
  }, []);

  // Table columns definition
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
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
  ];

  return (
    <div className="product-manage-container">
      <div className="product-manage-header">
        <h2>Quản lý tồn kho</h2>
      </div>
      {/* Cảnh báo tồn kho thấp */}
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
      <div className="product-manage-table">
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
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  );
}
