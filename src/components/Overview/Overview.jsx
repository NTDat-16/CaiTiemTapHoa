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
import { 
    UserOutlined ,CalendarOutlined,RiseOutlined, 
    DownloadOutlined, TeamOutlined, UserAddOutlined, 
    DollarOutlined, ShoppingCartOutlined,LineChartOutlined
} from "@ant-design/icons";
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


export default function Overview() {
    const [loading, setLoading] = useState(false);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalCusNewToday, setTotalCusNewToday] = useState(0);
    const API_BASE = "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    const [ChartData, setChartData] = useState([]);
    const today = dayjs();
    const oneMonthAgo = today.subtract(1, "month");
    const [startDate, setStartDate] = useState(oneMonthAgo);
    const [endDate, setEndDate] = useState(today);
    const [TodayRevenue, setTodayRevenue] = useState(0);
    const [MonthRevenue, setMonthRevenue] = useState(0);
    const [TodayOder, setTodayOder] = useState(0);
    const [MonthOrder, setMonthOrder] = useState(0);

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

    //Doanh thu ngày hôm nay
    const getTodayRevenue = async () => {
        try {
            const today = new Date();
            const todayStr = today.toISOString().split("T")[0]; // "2025-10-31"

            // --- DOANH THU HÔM NAY ---
            const startDate = `${todayStr}T00:00:00`;
            const endDate = `${todayStr}T23:59:59`;

            const response = await fetch(
            `${API_BASE}/Reports/sales/overview?startDate=${startDate}&endDate=${endDate}&groupBy=day`,
            { headers: { ...authHeader } }
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            const revenue = data?.data?.[0]?.totalRevenue || 0;
            const order = data?.data?.[0]?.numberOfOrders || 0;
            setTodayRevenue(revenue);
            setTodayOder(order);

            // --- DOANH THU TRONG THÁNG HIỆN TẠI ---
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString()
            .split("T")[0];
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];

            const startMonth = `${firstDayOfMonth}T00:00:00`;
            const endMonth = `${lastDayOfMonth}T23:59:59`;

            const monthResponse = await fetch(
            `${API_BASE}/Reports/sales/overview?startDate=${startMonth}&endDate=${endMonth}&groupBy=day`,
            { headers: { ...authHeader } }
            );

            if (!monthResponse.ok)
            throw new Error(`HTTP error! Status: ${monthResponse.status}`);

            const monthData = await monthResponse.json();

            // Cộng tổng doanh thu tháng
            const monthRevenue = monthData?.data?.reduce(
                (sum, item) => sum + (item.totalRevenue || 0),
                0
            );
            const monthOrders = monthData?.data?.reduce(
                (sum, item) => sum + (item.numberOfOrders || 0),
                0
            );
            setMonthOrder(monthOrders);
            setMonthRevenue(monthRevenue);
        } catch (error) {
            console.error("Lỗi khi lấy doanh thu:", error);
            setTodayRevenue(0);
            setMonthRevenue(0);
        }
    };

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
            await fetchChartData(startDate, endDate); // fetch lại từ API
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu khách hàng");
        } finally {
            setLoading(false);
        }
    };

    //Tải báo cáo
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

    //Lấy dữ liệu để vẽ
    const fetchChartData = async (startDateParam, endDateParam) => {
        try {
            //Lấy danh sách khách hàng
            const response = await fetch(`${API_BASE}/Customer?PageNumber=1&PageSize=100`, {
                headers: { ...authHeader },
            });
            const result = await response.json();
            const customersArray = Array.isArray(result?.data?.items)
            ? result.data.items
            : [];

            const activeCustomers = customersArray.filter(
                (c) => c.status?.toLowerCase() === "active"
            );

            //Lấy doanh thu theo ngày
            const startDateISO = dayjs(startDateParam).startOf("day").toISOString();
            const endDateISO = dayjs(endDateParam).endOf("day").toISOString();

            const salesResponse = await fetch(
                `${API_BASE}/Reports/sales/overview?startDate=${startDateISO}&endDate=${endDateISO}&groupBy=day`,
                { headers: { ...authHeader } }
            );
            const salesData = await salesResponse.json();
            const salesArray = Array.isArray(salesData?.data) ? salesData.data : [];

            // Tạo map ngày mặc định
            let dateMap = {};
            let currentDate = dayjs(startDateParam);
            while (!currentDate.isAfter(endDateParam, "day")) {
                dateMap[currentDate.format("YYYY-MM-DD")] = {
                    newCustomers: 0,
                    totalRevenue: 0,
                    totalOrders: 0,
                };
                currentDate = currentDate.add(1, "day");
            }

            // Đếm khách hàng mới theo ngày
            activeCustomers.forEach((c) => {
                const date = dayjs(c.createdAt).format("YYYY-MM-DD");
                if (dateMap[date]) dateMap[date].newCustomers++;
            });

            // Gán doanh thu từng ngày
            salesArray.forEach((s) => {
                const date = dayjs(s.period).format("YYYY-MM-DD");
                if (dateMap[date]) {
                    dateMap[date].totalRevenue = s.totalRevenue || 0;
                    dateMap[date].totalOrders = s.numberOfOrders || 0;
                }
            });

            // Chuyển thành mảng dữ liệu để hiển thị biểu đồ
            const chartDataArray = Object.keys(dateMap)
                .sort()
                .map((date) => ({
                    date,
                    ...dateMap[date],
            }));

            setChartData(chartDataArray);
        } catch (error) {
            message.error("Lỗi khi lấy dữ liệu khách hàng và doanh thu");
            console.error(error);
        }
    };

    //Vẽ biểu đồ
    const chartData = useMemo(() => ({
        labels: ChartData.map((d) => dayjs(d.date).format("DD/MM")),
        datasets: [
            {
                label: "Khách hàng mới",
                data: ChartData.map((d) => d.newCustomers),
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
            {
                label: "Doanh thu (Triệu VND)",
                data: ChartData.map((d) => d.totalRevenue / 1000000),
                borderColor: "#ff7b00",
                borderDash: [6, 4],
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                yAxisID: "y1",
            },
            {
                label: "Số đơn hàng",
                data: ChartData.map((d) => d.totalOrders),
                borderColor: "#3b82f6",
                borderDash: [3, 3],
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                yAxisID: "y2",
            },
        ],
    }),[ChartData]);

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

    // Khi component mount
    useEffect(() => {
        const fetchTotal = async () => {
            await getActiveEmployeeCount();
            await fetchCustomer();
            await fetchNewCustomersToday();
            await fetchChartData(oneMonthAgo, today);
            await getTodayRevenue();
        };
        fetchTotal();
    }, []);

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
                            <div className="stat-box stat-customers">
                                <UserOutlined className="stat-icon" />
                                <h3>Khách hàng</h3>
                                <p>{totalCustomers}</p>
                            </div>
                            <div className="stat-box stat-new-today">
                                <UserAddOutlined className="stat-icon" />
                                <h3>Khách mới trong ngày</h3>
                                <p>{totalCusNewToday}</p>
                            </div>
                        </div>
                        <div className="stats-column">
                            <div className="stat-box stat-orders-today">
                                <ShoppingCartOutlined className="stat-icon" />
                                <h3>Đơn hàng trong ngày</h3>
                                <p>{TodayOder}</p>
                            </div>
                            <div className="stat-box stat-orders-month">
                                <CalendarOutlined className="stat-icon" />
                                <h3>Đơn hàng trong tháng</h3>
                                <p>{MonthOrder}</p>
                            </div>
                        </div>
                        <div className="stats-column">
                            <div className="stat-box stat-revenue-today">
                                <DollarOutlined className="stat-icon" />
                                <h3>Doanh thu ngày (VND)</h3>
                                <p>{TodayRevenue.toLocaleString()}</p>
                            </div>
                            <div className="stat-box stat-revenue-month">
                                <RiseOutlined className="stat-icon" />
                                <h3>Doanh thu tháng (VND)</h3>
                                <p>{MonthRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="Overview-chart-panel">
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