import React, { useEffect, useState, useMemo } from "react";
import {
  
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Table,
  Spin,
  Space,
  notification,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";
import './Deadstock.css';

import { PageHeader } from "@ant-design/pro-layout";


const { RangePicker } = DatePicker;
const { Option } = Select;

const mockDeadStock = [
  {
    productId: 1,
    productName: "Nước ngọt Coca Cola",
    productImage: "/images/products/cola.jpg",
    stockQuantity: 150,
    lastSoldDate: "2025-07-15",
    daysNoSale: 104
  },
  {
    productId: 2,
    productName: "Bánh Oreo Classic",
    productImage: "/images/products/oreo.jpg", 
    stockQuantity: 85,
    lastSoldDate: "2025-08-01",
    daysNoSale: 87
  },
  {
    productId: 3,
    productName: "Mì gói Hảo Hảo",
    productImage: "/images/products/haohao.jpg",
    stockQuantity: 200,
    lastSoldDate: "2025-08-15", 
    daysNoSale: 73
  },
  {
    productId: 4,
    productName: "Sữa tươi Vinamilk",
    productImage: "/images/products/vinamilk.jpg",
    stockQuantity: 45,
    lastSoldDate: "2025-09-01",
    daysNoSale: 56
  },
  {
    productId: 5,
    productName: "Dầu ăn Simply",
    productImage: "/images/products/simply.jpg",
    stockQuantity: 30,
    lastSoldDate: "2025-09-15",
    daysNoSale: 42
  }
];

// Mock data for sales forecast
const mockForecast = [
  { date: "2025-10-01", predicted: 1200 },
  { date: "2025-10-02", predicted: 1350 },
  { date: "2025-10-03", predicted: 1100 },
  { date: "2025-10-04", predicted: 1400 },
  { date: "2025-10-05", predicted: 1600 },
  { date: "2025-10-06", predicted: 1250 },
  { date: "2025-10-07", predicted: 1300 },
  { date: "2025-10-08", predicted: 1450 },
  { date: "2025-10-09", predicted: 1550 },
  { date: "2025-10-10", predicted: 1700 }
];

const API_BASE_URL = "http://localhost:5000/api";

const getAuthToken = () => localStorage.getItem("token") || "";
// Mock data for dead stock
export default function Deadstock() {
  const [range, setRange] = useState([
    dayjs().subtract(90, "day"),
    dayjs(),
  ]);
  const [period, setPeriod] = useState("monthly"); // daily | weekly | monthly
  const [loading, setLoading] = useState(false);
  const [deadstock, setDeadstock] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [tableLoading, setTableLoading] = useState(false);

 
  const fetchDeadStock = async ({ page = 1, pageSize = 20 } = {}) => {
    setTableLoading(true);
    try {
      const from = range[0].startOf("day").toISOString();
      const to = range[1].endOf("day").toISOString();
      const token = getAuthToken();

      // Try real API first
      try {
        const q = new URLSearchParams({
          from,
          to,
          page: String(page),
          pageSize: String(pageSize),
        });

        const resp = await fetch(`${API_BASE_URL}/products/reports/dead-stock?${q.toString()}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          throw new Error(`API error: ${resp.status}`);
        }

        const json = await resp.json();
        const items = json?.data?.items ?? json?.data ?? [];
        const total = json?.data?.total ?? items.length;

        setDeadstock(items);
        setTablePagination((s) => ({ ...s, current: page, pageSize, total }));
        return; // API success, exit
      } catch (apiError) {
        console.warn("API not ready, using mock:", apiError);
      }

      // Fallback to mock if API fails
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const items = mockDeadStock.slice(start, end);
      
      setDeadstock(items);
      setTablePagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: mockDeadStock.length
      }));

    } catch (err) {
      console.error("fetchDeadStock:", err);
      notification.error({ 
        message: "Lỗi khi tải Deadstock", 
        description: err.message || String(err) 
      });
    } finally {
      setTableLoading(false);
    }
  };

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const from = range[0].startOf("day").toISOString();
      const to = range[1].endOf("day").toISOString();
      const token = getAuthToken();

      // Try real API first
      try {
        const q = new URLSearchParams({
          from,
          to,
          period,
        });

        const resp = await fetch(`${API_BASE_URL}/orders/reports/forecast?${q.toString()}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          throw new Error(`API error: ${resp.status}`);
        }

        const json = await resp.json();
        const series = json?.data ?? [];
        const normalized = series.map((s) => ({
          date: s.date || s.label || s.x,
          predicted: Number(s.predicted ?? s.value ?? s.y ?? 0),
        }));
        setForecast(normalized);
        return; // API success, exit
      } catch (apiError) {
        console.warn("API not ready, using mock:", apiError);
      }

      // Fallback to mock if API fails
      await new Promise(resolve => setTimeout(resolve, 1000));
      setForecast(mockForecast);

    } catch (err) {
      console.error("fetchForecast:", err);
      notification.error({ 
        message: "Lỗi khi tải Forecast", 
        description: err.message || String(err) 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchDeadStock({ page: tablePagination.current, pageSize: tablePagination.pageSize });
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () => {
    // refresh both
    fetchDeadStock({ page: 1, pageSize: tablePagination.pageSize });
    fetchForecast();
  };

  const columns = useMemo(
    () => [
      {
        title: "Ảnh",
        dataIndex: "productImage",
        key: "productImage",
        width: 80,
        render: (v) =>
          v ? <img src={v.startsWith("/") ? `${v}` : v} alt="img" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4 }} /> : null,
      },
      {
        title: "Mã / Tên",
        dataIndex: "productName",
        key: "productName",
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{record.productName || record.name || "-"}</div>
            <div style={{ color: "#666", fontSize: 12 }}>{record.productId ?? record.sku ?? ""}</div>
          </div>
        ),
      },
      {
        title: "Tồn kho",
        dataIndex: "stockQuantity",
        key: "stockQuantity",
        align: "right",
        render: (q) => Number(q ?? 0).toLocaleString(),
      },
      {
        title: "Ngày bán cuối",
        dataIndex: "lastSoldDate",
        key: "lastSoldDate",
        render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
      },
      {
        title: "Số ngày không bán",
        dataIndex: "daysNoSale",
        key: "daysNoSale",
        align: "right",
      },
    ],
    []
  );

  const onTableChange = (pagination) => {
    fetchDeadStock({ page: pagination.current, pageSize: pagination.pageSize });
  };

  return (
    <div style={{ padding: 16 }}>
      <PageHeader title="Dead Stock & Forecast" subTitle="Danh sách hàng ế và dự báo bán hàng" />
      <Card style={{ marginTop: 12 }}>
        <Row gutter={12} align="middle">
          <Col xs={24} sm={12} md={8}>
            <label>Khoảng thời gian</label>
            <RangePicker
              value={range}
              onChange={(val) => setRange(val)}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} sm={8} md={6}>
            <label>Chu kỳ dự báo</label>
            <Select value={period} onChange={(v) => setPeriod(v)} style={{ width: "100%" }}>
              <Option value="daily">Hàng ngày</Option>
              <Option value="weekly">Hàng tuần</Option>
              <Option value="monthly">Hàng tháng</Option>
            </Select>
          </Col>

          <Col xs={24} sm={4} md={4}>
            <Space>
              <Button type="primary" onClick={onSearch}>Tìm</Button>
              <Button onClick={() => {
                setRange([dayjs().subtract(90, "day"), dayjs()]);
                setPeriod("monthly");
              }}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col xs={24} lg={14}>
          <Card title="Danh sách Dead Stock" bodyStyle={{ padding: 8 }}>
            <Table
              rowKey={(r) => r.productId ?? r.product_id ?? `${r.sku}-${r.productName}`}
              columns={columns}
              dataSource={deadstock}
              loading={tableLoading}
              pagination={{
                current: tablePagination.current,
                pageSize: tablePagination.pageSize,
                total: tablePagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              onChange={onTableChange}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Dự báo bán hàng" bodyStyle={{ height: 380 }}>
            {loading ? (
              <div style={{ display: "flex", height: 300, alignItems: "center", justifyContent: "center" }}>
                <Spin />
              </div>
            ) : forecast && forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast}>
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format(period === "daily" ? "MM-DD" : "YYYY-MM")} />
                  <YAxis />
                  <Tooltip labelFormatter={(d) => dayjs(d).format("YYYY-MM-DD")} />
                  <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: 16 }}>Không có dữ liệu dự báo</div>
            )}
          </Card>

          <Card title="Biểu đồ cột (tùy chọn)" style={{ marginTop: 12 }} bodyStyle={{ height: 220 }}>
            {forecast && forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format("MM-DD")} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="predicted" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: 16 }}>Không có dữ liệu</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}