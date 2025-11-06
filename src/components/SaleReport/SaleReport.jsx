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
  message,
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
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const API_URL = "http://localhost:5000/api/Products/abc-analysis";

const ABC_COLORS = {
  A: { color: "#52c41a", bg: "#f6ffed", label: "A - Cao" },
  B: { color: "#fa8c16", bg: "#fff7e6", label: "B - Trung" },
  C: { color: "#f5222d", bg: "#fff1f0", label: "C - Thấp" },
};

// === DỮ LIỆU MẪU CHO LINE CHART (có thể thay bằng API sau) ===
const MOCK_DAILY_REVENUE = [
  1200000, 1800000, 2100000, 1600000, 1900000, 2300000, 2000000, 1700000,
  1950000, 2200000, 1800000, 2150000, 2400000, 1900000, 1600000, 1850000,
  2250000, 2000000, 1700000, 1950000, 2300000, 2100000, 1800000, 1600000,
  1900000, 2200000, 2000000, 1750000,
];

export default function SaleReport() {
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [abcData, setAbcData] = useState([]);
  const [top5Products, setTop5Products] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const today = dayjs();
  const oneMonthAgo = today.subtract(1, "month");
  const [startDate] = useState(oneMonthAgo);
  const [endDate] = useState(today);

  useEffect(() => {
    const fetchABCData = async () => {
      try {
        const fromDate = startDate.format("YYYY-MM-DD");
        const toDate = endDate.format("YYYY-MM-DD");
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}?pageNumber=1&pageSize=100&fromDate=${fromDate}&toDate=${toDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const result = await response.json();
        if (!result.success || !result.data?.items)
          throw new Error("Dữ liệu không hợp lệ");

        const items = result.data.items;

        // === TÍNH TỔNG DOANH THU ===
        const total = items.reduce((sum, item) => sum + Number(item.value), 0);
        setTotalRevenue(total);

        // === LƯU DỮ LIỆU ABC ===
        setAbcData(items);

        // === TOP 5 ===
        const sorted = [...items].sort((a, b) => b.value - a.value);
        setTop5Products(sorted.slice(0, 5));
        console.log("Top 5 sản phẩm bán chạy:", sorted.slice(0, 5));

        // === BIỂU ĐỒ PIE ===
        const grouped = items.reduce((acc, item) => {
          const cls = item.abcClassification;
          acc[cls] = (acc[cls] || 0) + Number(item.value);
          return acc;
        }, {});

        setPieData({
          labels: Object.keys(grouped),
          datasets: [
            {
              data: Object.values(grouped),
              backgroundColor: Object.keys(grouped).map(
                (k) => (ABC_COLORS[k]?.color || "#8c8c8c") + "80"
              ),
            },
          ],
        });

        // === BIỂU ĐỒ LINE (dùng mock) ===
        const days = Array.from({ length: dayjs(toDate).date() }, (_, i) =>
          (i + 1).toString()
        );
        setLineData({
          labels: days,
          datasets: [
            {
              label: "Doanh thu (₫)",
              data: MOCK_DAILY_REVENUE,
              borderColor: "#008f5a",
              backgroundColor: "rgba(0, 143, 90, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        });

        message.success("Đã tải dữ liệu từ API thành công!");
      } catch (error) {
        console.error("Lỗi API:", error);
        message.error(
          "Không thể tải dữ liệu. Vui lòng kiểm tra API hoặc token."
        );
      }
    };

    fetchABCData();
  }, [startDate, endDate]);

  const downloadReport = () => {
    const csv = [
      "Mã SP,Tên SP,Barcode,Doanh thu,Tần suất,Điểm,Phân loại",
      ...abcData.map(
        (i) =>
          `${i.productId},"${i.productName}",${i.barcode},${i.value},${i.frequency},${i.score},${i.abcClassification}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sale_report_${startDate.format("DDMM")}-${endDate.format(
      "DDMM"
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { title: "Mã SP", dataIndex: "productId", width: 90 },
    { title: "Tên sản phẩm", dataIndex: "productName", ellipsis: true },
    { title: "Barcode", dataIndex: "barcode", width: 130 },
    {
      title: "Doanh thu",
      dataIndex: "value",
      align: "right",
      render: (v) => `${Number(v).toLocaleString()} ₫`,
    },
    { title: "Tần suất", dataIndex: "frequency", align: "center", width: 90 },
    {
      title: "Điểm",
      dataIndex: "score",
      align: "center",
      width: 150,
      render: (v) => Number(v).toFixed(1),
    },
    {
      title: "Phân loại",
      dataIndex: "abcClassification",
      align: "center",
      width: 100,
      render: (text) => {
        const cls = ABC_COLORS[text] || { label: text, color: "#8c8c8c" };
        return (
          <Tag color={cls.bg} style={{ color: cls.color, fontWeight: 600 }}>
            {cls.label}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="SaleReport-container">
      <Card
        className="SaleReport-card"
        extra={
          <div className="SaleReport-filter">
            <RangePicker
              value={[startDate, endDate]}
              format="DD/MM/YYYY"
              className="modern-picker"
              disabled
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadReport}
              className="modern-button modern-button-secondary"
            >
              Tải báo cáo
            </Button>
          </div>
        }
      >
        <div className="SaleReport-body">
          {/* CỘT 1 */}
          <div className="SaleReport-left-block">
            <div className="SaleReport-revenue-summary">
              <div className="revenue-box">
                <DollarOutlined className="icon" />
                <h3>Tổng doanh thu</h3>
                <div className="value">{totalRevenue.toLocaleString()} ₫</div>
              </div>
              <div className="revenue-box">
                <CalendarOutlined className="icon" />
                <h3>Doanh thu kỳ hiện tại</h3>
                <div className="value">{totalRevenue.toLocaleString()} ₫</div>
                <div className="sub">
                  {startDate.format("DD/MM")} - {endDate.format("DD/MM")}
                </div>
              </div>
            </div>

            <div className="SaleReport-top5">
              <h4>Top 5 sản phẩm bán chạy</h4>
              <ul>
                {top5Products.map((p, i) => (
                  <li key={p.productId}>
                    <span className="rank">#{i + 1}</span>
                    <span className="name" title={p.productName}>
                      {p.productName}
                    </span>
                    <span className="value">
                      {Number(p.value).toLocaleString()} ₫
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CỘT 2: Pie */}
          <div className="SaleReport-pie-block">
            {pieData ? (
              <>
                <div className="chart-header">
                  <span>Tỷ trọng nhóm ABC</span>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setModalVisible(true)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
                <div className="chart-container">
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
              </>
            ) : (
              <Empty description="Không có dữ liệu ABC" />
            )}
          </div>

          {/* CỘT 3: Line */}
          <div className="SaleReport-line-block">
            <div className="chart-header">
              Doanh thu mỗi ngày ({endDate.format("MM/YYYY")})
            </div>
            <div className="chart-container">
              {lineData ? (
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        ticks: {
                          callback: (v) => `${(v / 1000000).toFixed(1)}M`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Empty description="Không có dữ liệu doanh thu" />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        title="Chi tiết phân tích ABC"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1100}
        style={{ top: 10 }}
        className="SaleReport-modal"
        closable={false}
      >
        <Table
          dataSource={abcData}
          columns={columns}
          rowKey="productId"
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 900 }}
        />
      </Modal>
    </div>
  );
}
