import { useState, useMemo, useEffect } from "react";
import { Card, DatePicker, Button, Spin, message } from "antd";
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
import { DownloadOutlined, TeamOutlined, UserAddOutlined, DollarOutlined, ShoppingCartOutlined, WarningOutlined, StopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./Overview.css";

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
const MOCK_OVERVIEW = Array.from({ length: 30 }, (_, i) => {
  const date = dayjs("2025-10-01").add(i, "day").format("YYYY-MM-DD");
//   const totalEmployees = 50 + Math.floor(Math.random() * 10); // Số nhân viên
  const newCustomers = 20 + Math.floor(Math.random() * 10); // Khách hàng mới trong ngày
  const totalRevenue = 5000000 + i * 200000 + Math.floor(Math.random() * 500000); // Doanh thu (VND)
  const totalOrders = 30 + i * 2 + Math.floor(Math.random() * 5); // Số đơn hàng
  const lowStockItems = Math.floor(Math.random() * 5); // Sản phẩm tồn kho thấp
  const deadStockItems = Math.floor(Math.random() * 3); // Sản phẩm không bán được
  return { date, newCustomers, totalRevenue, totalOrders, lowStockItems, deadStockItems };
});

export default function Overview() {
    const [data, setData] = useState(MOCK_OVERVIEW);
    const [loading, setLoading] = useState(false);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalCusNewToday, setTotalCusNewToday] = useState(0);
    const API_BASE = "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const [customerChartData, setCustomerChartData] = useState([]);
    
    const today = dayjs();
    const oneMonthAgo = today.subtract(1, "month");

    const [startDate, setStartDate] = useState(oneMonthAgo);
    const [endDate, setEndDate] = useState(today);

    //Lấy số lượng nhân viên còn hoạt động
    const getActiveEmployeeCount = async () => {
        try {
            const response = await fetch(`${API_BASE}/Users`,
                {headers: {...authHeader},}
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            const items = Array.isArray(data?.data?.items) ? data.data.items : [];
            const activeCount = items.filter(u => u.status === "Active").length;
            setTotalEmployees(activeCount);
        } catch (error) {
            console.error("Lỗi khi lấy số lượng nhân viên active:", error);
            return 0;
        }
    };

    //Lấy số lượng khách hàng còn hoạt động
    const fetchCustomer = async () => {
        try {
            const response = await fetch(`${API_BASE}/Customer?PageNumber=1&PageSize=100`, {
                headers: {...authHeader},
            });
            const result = await response.json();
            const customersArray = Array.isArray(result?.data?.items) ? result.data.items : [];
            const customersStatus = customersArray.filter(cus => cus.status?.toLowerCase() === "active").length
            setTotalCustomers(customersStatus);
        } catch (error) {
            message.error("Lỗi khi tải khách hàng")
        }
    }

    //Lấy số lượng khách hàng mới trong ngày hôm nay
    const fetchNewCustomersToday = async () => {
        try {
            const response = await fetch(`${API_BASE}/Customer?PageNumber=1&PageSize=100`, {
                headers: {...authHeader},
            });
            const result = await response.json();
            const customersArray = Array.isArray(result?.data?.items) ? result.data.items : [];

            const today = dayjs().format("YYYY-MM-DD");
            const newTodayCount = customersArray.filter(
            c => c.status?.toLowerCase() === "active" &&
                dayjs(c.createdAt).isSame(today, "day")
            ).length;

            setTotalCusNewToday(newTodayCount);
        } catch (error) {
            message.error("Lỗi khi lấy khách hàng hôm nay");
        }
    };


    // Khi component mount
    useEffect(() => {
        const fetchTotal = async () => {
            await getActiveEmployeeCount();
            await fetchCustomer();
            await fetchNewCustomersToday();
            await fetchCustomerChartData(oneMonthAgo, today);
        };
        fetchTotal();
    }, []);

    const fetchOverview = async () => {
    if (!startDate || !endDate) {
        message.error("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
    }

    if (startDate.isAfter(endDate, "day")) {
        message.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!");
        return;
    }

    setLoading(true);
    try {
        await fetchCustomerChartData(startDate, endDate); // fetch lại từ API
    } catch (error) {
        message.error("Lỗi khi tải dữ liệu khách hàng");
    } finally {
        setLoading(false);
    }
};





    // Tính toán xu hướng khách hàng mới
    const customerTrend = useMemo(() => {
        if (data.length < 2) return "Không đủ dữ liệu";
        const change =
        ((data[data.length - 1].newCustomers - data[0].newCustomers) /
            data[0].newCustomers) *
        100;
        return change > 0
        ? `Tăng ${change.toFixed(1)}%`
        : `Giảm ${Math.abs(change).toFixed(1)}%`;
    }, [data]);

    const customerTrendColor = customerTrend.includes("Tăng")
        ? "#008f5a"
        : customerTrend.includes("Giảm")
        ? "#ff4d4f"
        : "#888";

    // Tính toán xu hướng doanh thu
    const revenueTrend = useMemo(() => {
        if (data.length < 2) return "Không đủ dữ liệu";
        const change =
        ((data[data.length - 1].totalRevenue - data[0].totalRevenue) /
            data[0].totalRevenue) *
        100;
        return change > 0
        ? `Tăng ${change.toFixed(1)}%`
        : `Giảm ${Math.abs(change).toFixed(1)}%`;
    }, [data]);

    const revenueTrendColor = revenueTrend.includes("Tăng")
        ? "#008f5a"
        : revenueTrend.includes("Giảm")
        ? "#ff4d4f"
        : "#888";

    const downloadReport = () => {
        const csv = [
        "Date,Total Employees,New Customers,Total Revenue,Total Orders,Low Stock Items,Dead Stock Items",
        ...data.map(
            (d) =>
            `${d.date},${d.totalEmployees},${d.newCustomers},${d.totalRevenue},${d.totalOrders},${d.lowStockItems},${d.deadStockItems}`
        ),
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "overview_sales_report.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const fetchCustomerChartData = async (startDateParam, endDateParam) => {
        try {
            const response = await fetch(`${API_BASE}/Customer?PageNumber=1&PageSize=100`, {
                headers: {...authHeader},
            });
            const result = await response.json();
            const customersArray = Array.isArray(result?.data?.items) ? result.data.items : [];

            // Lọc khách hàng active
            const activeCustomers = customersArray.filter(c => c.status?.toLowerCase() === "active");

            // Khởi tạo map ngày với 0
            let dateMap = {};
            let currentDate = dayjs(startDateParam);
            while (!currentDate.isAfter(endDateParam, "day")) {
                dateMap[currentDate.format("YYYY-MM-DD")] = 0;
                currentDate = currentDate.add(1, "day");
            }

            // Đếm khách hàng theo ngày
            activeCustomers.forEach(c => {
                const date = dayjs(c.createdAt).format("YYYY-MM-DD");
                if (dateMap[date] !== undefined) dateMap[date]++;
            });

            const chartDataArray = Object.keys(dateMap).sort().map(date => ({
                date,
                newCustomers: dateMap[date],
                totalRevenue: 0,
                totalOrders: 0,
                lowStockItems: 0,
                deadStockItems: 0
            }));

            setCustomerChartData(chartDataArray);
            setData(chartDataArray);
        } catch (error) {
            message.error("Lỗi khi lấy dữ liệu khách hàng chart");
            console.error(error);
        }
    };
    const chartData = useMemo(() => ({
        labels: data.map((d) => dayjs(d.date).format("DD/MM")),
        datasets: [
            {
            label: "Khách hàng mới",
            data: data.map((d) => d.newCustomers),
            borderColor: "#008f5a",
            backgroundColor: (ctx) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, "rgba(0,143,90,0.3)");
                gradient.addColorStop(1, "rgba(0,143,90,0)");
                return gradient;
            },
            fill: "origin",
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 2,
            },
            // {
            // label: "Doanh thu (Triệu VND)",
            // data: data.map((d) => d.totalRevenue / 1000000),
            // borderColor: "#ff7b00",
            // borderDash: [6, 4],
            // tension: 0.3,
            // pointRadius: 4,
            // pointHoverRadius: 6,
            // pointBackgroundColor: "#fff",
            // pointBorderWidth: 2,
            // yAxisID: "y1",
            // },
            // {
            // label: "Số đơn hàng",
            // data: data.map((d) => d.totalOrders),
            // borderColor: "#3b82f6",
            // borderDash: [3, 3],
            // tension: 0.3,
            // pointRadius: 4,
            // pointHoverRadius: 6,
            // pointBackgroundColor: "#fff",
            // pointBorderWidth: 2,
            // yAxisID: "y2",
            // },
        ],
        }),
        [data]
    );

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            position: "top",
            labels: {
            font: { size: 14, family: "'Inter', sans-serif" },
            color: "#333",
            padding: 20,
            },
        },
        title: {
            display: true,
            font: { size: 18, weight: "bold", family: "'Inter', sans-serif" },
            color: "#1a1a1a",
            padding: { top: 10, bottom: 20 },
        },
        tooltip: {
            backgroundColor: "rgba(0,0,0,0.85)",
            titleFont: { size: 14, family: "'Inter', sans-serif" },
            bodyFont: { size: 12, family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
            label: (ctx) => {
                const index = ctx.dataIndex;
                const d = data[index];
                return [
                `${ctx.dataset.label}: ${
                    ctx.dataset.label.includes("Doanh thu")
                    ? (ctx.parsed.y * 1000000).toLocaleString() + " VND"
                    : ctx.parsed.y
                }`,
                `Nhân viên: ${d.totalEmployees}`,
                `Đơn hàng: ${d.totalOrders}`,
                `Tồn kho thấp: ${d.lowStockItems}`,
                `Dead stock: ${d.deadStockItems}`,
                ];
            },
            },
        },
        },
        scales: {
        x: {
            title: { display: true, text: "Ngày", font: { size: 14, family: "'Inter', sans-serif" } },
            grid: { display: false },
            ticks: { color: "#555", font: { size: 12 } },
        },
        y: {
            title: { display: true, text: "Khách hàng mới", font: { size: 14, family: "'Inter', sans-serif" } },
            beginAtZero: true,
            ticks: { color: "#555", font: { size: 12 } },
        },
        y1: {
            title: { display: true, text: "Doanh thu (Triệu VND)", font: { size: 14, family: "'Inter', sans-serif" } },
            position: "right",
            beginAtZero: true,
            grid: { display: false },
            ticks: { color: "#555", font: { size: 12 } },
        },
        y2: {
            title: { display: true, text: "Số đơn hàng", font: { size: 14, family: "'Inter', sans-serif" } },
            position: "right",
            beginAtZero: true,
            grid: { display: false },
            ticks: { color: "#555", font: { size: 12 } },
        },
        },
        animation: {
        duration: 1200,
        easing: "easeOutQuart",
        },
    };

    const totalRevenue = 0;
    const totalOrders = 0;
    const avgNewCustomers = 0;
    const lowStockItems = 0;
    const deadStockItems = 0;

    return (
        <div className="Overview-container">
            <Card
                className="Overview-card"
                extra={
                    <div className="Overview-filter">
                        <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            placeholder="Ngày bắt đầu"
                            className="modern-picker"
                        />
                        <DatePicker
                            value={endDate}
                            onChange={setEndDate}
                            placeholder="Ngày kết thúc"
                            className="modern-picker"
                        />
                        <Button
                            type="primary"
                            onClick={fetchOverview}
                            loading={loading}
                            className="modern-button"
                        >
                            Lọc
                        </Button>
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
                <div className="Overview-body">
                <div className="Overview-stats-panel">
                    <div className="stats-column">
                    <div className="stat-box stat-total">
                        <TeamOutlined className="stat-icon" />
                        <h3>Tổng nhân viên</h3>
                        <p>{totalEmployees}</p>
                    </div>
                    <div className="stat-box stat-avg">
                        <UserAddOutlined className="stat-icon" />
                        <h3>Khách hàng</h3>
                        <p>{totalCustomers}</p>
                    </div>
                    <div className="stat-box stat-actual">
                        <UserAddOutlined className="stat-icon" />
                        <h3>Khách mới trong ngày</h3>
                        <p>{totalCusNewToday}</p>
                    </div>
                    </div>
                    <div className="stats-column">
                    <div className="stat-box stat-accuracy">
                        <DollarOutlined className="stat-icon" />
                        <h3>Tổng doanh thu (VND)</h3>
                        <p>{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="stat-box stat-total">
                        <ShoppingCartOutlined className="stat-icon" />
                        <h3>Tổng đơn hàng</h3>
                        <p>{totalOrders}</p>
                    </div>
                    <div className="stat-box stat-avg">
                        <WarningOutlined className="stat-icon" />
                        <h3>Sản phẩm tồn thấp</h3>
                        <p>{lowStockItems}</p>
                    </div>
                    </div>
                    <div className="stats-column">
                    <div className="stat-box stat-accuracy">
                        <StopOutlined className="stat-icon" />
                        <h3>Sản phẩm dead stock</h3>
                        <p>{deadStockItems}</p>
                    </div>
                    <div className="stat-box stat-trend">
                        {/* <h3>Xu hướng</h3>
                        <p>
                        Khách mới: <span style={{ color: customerTrendColor }}>{customerTrend}</span>
                        <br />
                        Doanh thu: <span style={{ color: revenueTrendColor }}>{revenueTrend}</span>
                        </p> */}
                    </div>
                    </div>
                </div>
                <div className="Overview-chart-panel" >
                    {loading ? (
                    <Spin tip="Đang tải..." size="large" />
                    ) : (
                    <Line data={chartData} options={chartOptions}/>
                    )}
                </div>
                </div>
            </Card>
        </div>
    );
}