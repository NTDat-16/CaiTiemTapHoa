import React, { useState, useEffect } from "react";
import { Table, Tag, Alert } from "antd";
import "./Inventory.css";

// Dữ liệu giả cho tồn kho
const mockInventory = [
  { product_id: 1, product_name: "Áo thun nam", quantity: 12 },
  { product_id: 2, product_name: "Quần jean nữ", quantity: 3 },
  { product_id: 3, product_name: "Bánh mì thịt", quantity: 0 },
  { product_id: 4, product_name: "Cà phê sữa", quantity: 7 },
  { product_id: 5, product_name: "Túi xách da", quantity: 25 },
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    // Giả lập fetch dữ liệu
    setTimeout(() => {
      setInventory(mockInventory);
      setLowStock(mockInventory.filter((item) => item.quantity <= 5));
    }, 300);
  }, []);

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      width: 120,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      width: 220,
    },
    {
      title: "Số lượng tồn",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (qty) =>
        qty <= 5 ? (
          <Tag color="red">{qty}</Tag>
        ) : (
          <Tag color="green">{qty}</Tag>
        ),
    },
  ];

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Quản lý tồn kho</h2>
      </div>
      <div className="inventory-table">
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="product_id"
          pagination={false}
        />
      </div>
    </div>
  );
}
