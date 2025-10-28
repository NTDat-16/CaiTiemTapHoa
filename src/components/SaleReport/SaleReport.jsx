import React, { useState, useEffect } from "react";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

import {
  Card,
  DatePicker,
  Button,
  Modal,
  Table,
  Tag,
  Empty,
} from "antd";

import {
  RiseOutlined,
  DollarOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import "./SaleReport.css";

const { RangePicker } = DatePicker;
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const ABC_COLORS = {
  A: { color: "#52c41a", bg: "#f6ffed", label: "A - Cao" },
  B: { color: "#fa8c16", bg: "#fff7e6", label: "B - Trung" },
  C: { color: "#f5222d", bg: "#fff1f0", label: "C - Thấp" },
};

// === DỮ LIỆU ẢO ===
const MOCK_ABC_DATA = [
  { productId: "SP001", productName: "Sữa Ensure Gold", barcode: "893500000001",  frequency: 120, category: "A",value: 15200000, },
  { productId: "SP002", productName: "Bánh Oreo", barcode: "893500000002", frequency: 95, category: "B", value: 8500000 },
  { productId: "SP003", productName: "Nước ngọt Coca", barcode: "893500000003", frequency: 80, category: "B", value: 5300000 },
  { productId: "SP004", productName: "Trứng gà 10 quả", barcode: "893500000004", frequency: 70, category: "B", value: 4200000 },
  { productId: "SP005", productName: "Gạo ST25 5kg", barcode: "893500000005", frequency: 65, category: "B", value: 3800000 },
  { productId: "SP006", productName: "Dầu ăn Tường An", barcode: "893500000006", frequency: 50, category: "C", value: 1500000 },
  { productId: "SP007", productName: "Mì ăn liền Hảo Hảo", barcode: "893500000007", frequency: 45, category: "C", value: 1200000 },
  { productId: "SP008", productName: "Nước rửa chén Sunlight", barcode: "893500000008", frequency: 40, category: "C", value: 1000000 },
  { productId: "SP009", productName: "Bột giặt OMO", barcode: "893500000009", frequency: 35, category: "C", value: 900000 },
  { productId: "SP010", productName: "Khăn giấy Vinda", barcode: "893500000010", frequency: 30, category: "C", value: 800000 },
];

const MOCK_DAILY_REVENUE = [
  1200000, 1800000, 2100000, 1600000, 1900000, 2300000, 2000000,
  1700000, 1950000, 2200000, 1800000, 2150000, 2400000, 1900000,
  1600000, 1850000, 2250000, 2000000, 1700000, 1950000, 2300000,
  2100000, 1800000, 1600000, 1900000, 2200000, 2000000, 1750000,
];

export default function SaleReport() {
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [top5Products, setTop5Products] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const today = dayjs();
  const oneMonthAgo = today.subtract(1, "month");
  const [startDate] = useState(oneMonthAgo);
  const [endDate] = useState(today);

  useEffect(() => {
    const sorted = [...MOCK_ABC_DATA].sort((a, b) => b.value - a.value);
    setTop5Products(sorted.slice(0, 5));

    // === TÍNH SỐ SẢN PHẨM THEO NHÓM A/B/C ===
    const grouped = MOCK_ABC_DATA.reduce((acc, i) => {
      const k = i.category; // đổi sang 'category'
      acc[k] = (acc[k] || 0) + 1; // đếm số sản phẩm
      return acc;
    }, {});

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
    const total = data.reduce((a, b) => a + b, 0);
    const bgColors = labels.map(k => (ABC_COLORS[k]?.color || "#8c8c8c") + "40");

    setPieData({
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderColor: labels.map(k => ABC_COLORS[k]?.color || "#8c8c8c"),
        borderWidth: 1,
      }],
    });

    // === Biểu đồ Line giữ nguyên ===
    const days = Array.from({ length: 28 }, (_, i) => (i + 1).toString());
    setLineData({
      labels: days,
      datasets: [{
        label: "Doanh thu (₫)",
        data: MOCK_DAILY_REVENUE,
        borderColor: "#008f5a",
        backgroundColor: "rgba(0, 143, 90, 0.1)",
        fill: true,
        tension: 0.4,
      }],
    });
  }, []);


  // Hàm định dạng khoảng thời gian của tháng hiện tại
  function getCurrentMonthRange() {
    const now = dayjs();
    const startOfMonth = now.startOf("month").format("DD/MM/YYYY");
    const endOfMonth = now.endOf("month").format("DD/MM/YYYY");
    return `${startOfMonth} - ${endOfMonth}`;
  }

  // Hàm tải báo cáo dưới dạng file CSV
  const downloadReport = () => {
    const csv = [
      "Mã SP,Tên SP,Barcode,Phân loại,Doanh thu,",
      ...MOCK_ABC_DATA.map(i =>
        `${i.productId},"${i.productName}",${i.barcode},${i.value},${i.abcClassification}`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sale_report_0110-2810.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  //Danh sách các cột của bảng
  const columns = [
    {title: "Mã SP",dataIndex: "productId",width: 100, align: "center"},
    {title: "Tên sản phẩm", dataIndex: "productName", ellipsis: true, width: 250 },
    {title: "Barcode", dataIndex: "barcode", width: 150, align: "center" },
    {title: "Loại sản phẩm", dataIndex: "category", align: "center", width: 120,
      render: text => {
        const cls = ABC_COLORS[text] || { label: text, color: "#8c8c8c" };
        return (
          <Tag color={cls.bg} style={{ color: cls.color, fontWeight: 600 }}>
            {cls.label}
          </Tag>
        );
      },
    },
    {title: "Đã bán", dataIndex: "frequency", align: "right", width: 130 },
    {title: "Doanh thu", dataIndex: "value", align: "right", width: 150,render: v => `${v.toLocaleString()} ₫`},
  ];

  return (
    <div className="SaleReport-container">
      <Card
        className="SaleReport-card"
        extra={
          <div className="SaleReport-filter">
            <RangePicker value={[startDate, endDate]} format="DD/MM/YYYY" className="modern-picker"/>
            <Button icon={<DownloadOutlined />} onClick={downloadReport} className="modern-button modern-button-secondary">
              Tải báo cáo
            </Button>
          </div>
        }
      >
        <div className="SaleReport-body">
          {/* CỘT 1: Tổng DT + Top 5 */}
          <div className="SaleReport-left-block">
            <div className="SaleReport-revenue-summary">
              <div className="revenue-box">
                <DollarOutlined className="icon" />
                <h3>Tổng doanh thu</h3>
                <div className="value">43.688.871 ₫</div>
              </div>
              <div className="revenue-box">
                <CalendarOutlined className="icon" />
                <h3>Doanh thu tháng hiện tại</h3>
                <div className="value">43.688.871 ₫</div>
                <div className="sub">{getCurrentMonthRange()}</div>
              </div>
            </div>

            <div className="SaleReport-top5">
              <h4>Top 5 sản phẩm bán chạy</h4>
              <ul>
                {top5Products.map((p, i) => (
                  <li key={p.productId}>
                    <span className="rank">#{i + 1}</span>
                    <span className="name" title={p.productName}>{p.productName}</span>
                    <span className="value">{p.value.toLocaleString()} ₫</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CỘT 2: Biểu đồ Pie */}
          <div className="SaleReport-pie-block">
            {pieData ? (
              <>
                <div className="chart-header">
                  <span>Doanh thu theo từng nhóm</span>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => setModalVisible(true)}>
                    Xem chi tiết
                  </Button>
                </div>
                <div className="chart-container">
                  <Pie data={pieData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } }
                  }} />
                </div>
              </>
            ) : <Empty />}
          </div>

          {/* CỘT 3: Biểu đồ Line */}
          <div className="SaleReport-line-block">
            <div className="chart-header">Doanh thu mỗi ngày ({getCurrentMonthRange()})</div>
            <div className="chart-container">
              {lineData ? <Line data={lineData} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { ticks: { callback: v => `${(v/1000000).toFixed(1)}M` } } }
              }} /> : <Empty />}
            </div>
          </div>
        </div>
      </Card>

      <Modal closable={false} title="Chi tiết phân tích ABC" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={1100}>
        <Table className="tableSale" dataSource={MOCK_ABC_DATA} columns={columns} rowKey="productId" pagination={{ pageSize: 10 }} size="small" scroll={{ y: 400, x: 900 }} />
      </Modal>
    </div>
  );
}