import { useState, useMemo } from "react";
import { Card, DatePicker, Select, Button, Spin, message } from "antd";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./Forecast.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

// --- Mock data ---
const MOCK_PRODUCTS = [
  { id: 1, name: "Sản phẩm A" },
  { id: 2, name: "Sản phẩm B" },
  { id: 3, name: "Sản phẩm C" },
];

// Tạo dữ liệu 30 ngày, số lượng dự báo tăng dần, actual lệch ±10%
const MOCK_FORECAST = Array.from({ length: 30 }, (_, i) => {
  const date = dayjs("2025-10-01").add(i, "day").format("YYYY-MM-DD");
  const forecast = 100 + i * 10 + Math.floor(Math.random() * 20); // tăng dần với biến động nhỏ
  const actual = forecast - 5 + Math.floor(Math.random() * 10); // actual lệch ±5
  return { date, forecast, actual };
});


export default function Forecast() {
  const [data, setData] = useState(MOCK_FORECAST);
  const [products] = useState(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0].id);
  const [startDate, setStartDate] = useState(dayjs("2025-10-01"));
  const [endDate, setEndDate] = useState(dayjs("2025-10-07"));
  const [loading, setLoading] = useState(false);

 const fetchForecast = () => {
  if (startDate.isAfter(endDate)) {
    message.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!");
    return;
  }
  // Lọc dữ liệu ngay lập tức
  const filteredData = MOCK_FORECAST.filter(
    (d) =>
      dayjs(d.date).isSameOrAfter(startDate) &&
      dayjs(d.date).isSameOrBefore(endDate)
  );
  setData(filteredData);
};


  const trend = useMemo(() => {
    if (data.length < 2) return "Không đủ dữ liệu";
    const change =
      ((data[data.length - 1].forecast - data[0].forecast) / data[0].forecast) *
      100;
    return change > 0
      ? `Tăng ${change.toFixed(1)}%`
      : `Giảm ${Math.abs(change).toFixed(1)}%`;
  }, [data]);

  const trendColor = trend.includes("Tăng")
    ? "#008f5a"
    : trend.includes("Giảm")
    ? "#e74c3c"
    : "#888";

  const accuracy = useMemo(() => {
    const valid = data.filter((d) => d.actual !== null);
    if (!valid.length) return 0;
    const error = valid.reduce(
      (sum, d) => sum + Math.abs(d.forecast - d.actual),
      0
    );
    const totalActual = valid.reduce((sum, d) => sum + d.actual, 0);
    return ((1 - error / totalActual) * 100).toFixed(1);
  }, [data]);

  const downloadReport = () => {
    const csv = [
      "Date,Forecast,Actual",
      ...data.map((d) => `${d.date},${d.forecast},${d.actual || ""}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forecast_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => dayjs(d.date).format("DD/MM")),
      datasets: [
        {
          label: "Dự báo",
          data: data.map((d) => d.forecast),
          borderColor: "#008f5a",
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, "rgba(0,143,90,0.3)");
            gradient.addColorStop(1, "rgba(0,143,90,0)");
            return gradient;
          },
          fill: "origin",
          tension: 0.3,
          pointRadius: 4,
        },
        {
          label: "Thực tế",
          data: data.map((d) => d.actual || null),
          borderColor: "#e67e22",
          borderDash: [6, 4],
          tension: 0.2,
          pointRadius: 3,
        },
      ],
    }),
    [data]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Dự báo nhu cầu & thực tế",
        font: { size: 16, weight: "bold" },
        color: "#333",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const index = ctx.dataIndex;
            const d = data[index];
            const diff = d.actual ? Math.abs(d.forecast - d.actual) : null;
            return [
              `${ctx.dataset.label}: ${ctx.parsed.y}`,
              diff ? `Chênh lệch: ${diff} (${((diff / d.actual) * 100).toFixed(1)}%)` : "",
            ];
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Ngày" }, grid: { display: false } },
      y: { title: { display: true, text: "Số lượng" }, beginAtZero: true },
    },
  };

  const totalForecast = data.reduce((sum, d) => sum + (d.forecast || 0), 0);
  const totalActual = data.reduce((sum, d) => sum + (d.actual || 0), 0);
  const avgForecast = data.length ? Math.round(totalForecast / data.length) : 0;
  const maxForecast = data.length ? Math.max(...data.map((d) => d.forecast || 0)) : 0;

  return (
    <div className="forecast-container">
      <Card
        className="forecast-card"
        title="🌾 Dự báo nhu cầu sản phẩm (Mock Data)"
        extra={
          <div className="forecast-filter">
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Ngày bắt đầu" />
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Ngày kết thúc" />
            <Select
              value={selectedProduct}
              style={{ width: 180 }}
              onChange={setSelectedProduct}
            >
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={fetchForecast}
              loading={loading}
              style={{ background: "#008f5a", borderColor: "#008f5a" }}
            >
              Lọc
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadReport}
              style={{ borderColor: "#008f5a", color: "#008f5a" }}
            >
              Tải báo cáo
            </Button>
          </div>
        }
      >
        <div className="forecast-body">
          <div className="forecast-stats-panel">
            <div className="stats-column">
              <div className="stat-box stat-total">
                <h3>Tổng nhu cầu</h3>
                <p>{totalForecast}</p>
              </div>
              <div className="stat-box stat-avg">
                <h3>Trung bình</h3>
                <p>{avgForecast}</p>
              </div>
              <div className="stat-box stat-accuracy">
                <h3>Độ chính xác</h3>
                <p>{accuracy}%</p>
              </div>
            </div>
            <div className="stats-column">
              <div className="stat-box stat-actual">
                <h3>Cao nhất</h3>
                <p>{maxForecast}</p>
              </div>
              <div className="stat-box stat-trend">
                <h3>Xu hướng</h3>
                <p style={{ color: trendColor }}>{trend}</p>
              </div>
            </div>
          </div>
          <div className="forecast-chart-panel">
            {loading ? (
              <Spin tip="Đang tải..." size="large" />
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}