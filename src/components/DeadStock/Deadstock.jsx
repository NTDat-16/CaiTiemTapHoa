import React, { useEffect, useState } from "react";
import {
  Card, Row, Col, DatePicker, Button, Table, Spin, Space, notification
} from "antd";
import dayjs from "dayjs";
import { PageHeader } from "@ant-design/pro-layout";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

const { RangePicker } = DatePicker;

const API_BASE_URL = "http://localhost:5000/api";
const getAuthToken = () => localStorage.getItem("token") || "";

export default function Deadstock() {
  const [range, setRange] = useState([dayjs().subtract(90, "day"), dayjs()]);
  const [loading, setLoading] = useState(false);
  const [deadstock, setDeadstock] = useState([]);

  const fetchDeadStock = async () => {
    setLoading(true);

    try {
      const startDate = range[0].startOf("day").toISOString();
      const endDate = range[1].endOf("day").toISOString();

      const token = getAuthToken();
      const params = new URLSearchParams({ startDate, endDate }).toString();

      const resp = await fetch(`${API_BASE_URL}/Reports/products/dead-stock?${params}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json();
      setDeadstock(json.data ?? []);

    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu Deadstock",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadStock();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "productId", width: 60 },
    { title: "Tên sản phẩm", dataIndex: "productName" },
    { title: "Barcode", dataIndex: "barcode" },
    { 
      title: "Giá (VND)",
      dataIndex: "price",
      render: (v) => v.toLocaleString()
    },
    { 
      title: "Tồn kho",
      dataIndex: "quantityInStock",
      render: (v) => v.toLocaleString()
    }
  ];

  return (
    <div style={{ padding: 16, background: "white", minHeight: "100vh", color: "white" }}>
      <PageHeader title=" Báo cáo hàng tồn kho" style={{ backgroundcolor: 'green'}} />

      <Card style={{ marginTop: 12, background: "white" }}>
        <Row gutter={12}>
          <Col xs={24} sm={12} md={8}>
            <label style={{ color: "black" }}>Chọn khoảng thời gian</label>
            <RangePicker value={range} onChange={setRange} style={{ width: "100%" }} />
          </Col>
          <Col>
            <Space style={{ marginTop: 24 }}>
              <Button type="primary" onClick={fetchDeadStock}>Tìm</Button>
              <Button onClick={() => setRange([dayjs().subtract(90, "day"), dayjs()])}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>

        {/* Table Left */}
        <Card 
          title="Danh sách sản phẩm Dead Stock" 
          style={{ flex: 1, background: "white" }}
          bodyStyle={{ maxHeight: 480, overflow: "auto" }}
        >
          <Spin spinning={loading}>
            <Table
              rowKey="productId"
              columns={columns}
              dataSource={deadstock}
              pagination={false}
              size="small"
              
            />
          </Spin>
        </Card>

        {/* Chart Right */}
        <Card 
          title="📊 Biểu đồ tồn kho"
          style={{ width: "45%", background: "white"   }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={deadstock}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="productName" tick={{ fill: "#cbd5e1" }} />
              <YAxis tick={{ fill: "#cbd5e1" }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Legend />
              <Bar dataKey="quantityInStock"  fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );  
}
