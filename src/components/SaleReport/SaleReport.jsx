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
    ArrowUpOutlined,
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

const ABC_COLORS = {
    A: { color: "#52c41a", bg: "#f6ffed", label: "A - Cao" },
    B: { color: "#fa8c16", bg: "#fff7e6", label: "B - Trung" },
    C: { color: "#f5222d", bg: "#fff1f0", label: "C - Thấp" },
};

export default function SaleReport() {
    const [pieData, setPieData] = useState(null);
    const [lineData, setLineData] = useState(null);
    const [abcData, setAbcData] = useState([]);
    const [top5Products, setTop5Products] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const currentYear = dayjs();
    const [yearSelected, setYearSelected] = useState(currentYear);
    const [yearSelectedpie, setYearSelectedPie] = useState(currentYear);
    const [monthSelected, setMonthSelected] = useState(dayjs());
    const [TotalRevenueMonth, setTotalRevenueMonth] = useState(0);
    const startOfMonth = dayjs().startOf("month"); // Ngày đầu tháng hiện tại
    const endOfMonth = dayjs().endOf("month"); // Ngày cuối tháng hiện tại
    const [startDate] = useState(startOfMonth);
    const [endDate] = useState(endOfMonth);
    const API_URL = "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    // === HÀM TÍNH TOÁN DOANH THU NĂM ===
    const fetchtotalRevenueYear = async () => {
        try {
            // Xác định ngày đầu năm và cuối năm
            const year = yearSelected ? yearSelected.year() : dayjs().year();
            const startDate = dayjs(`${year}-01-01`).startOf("year");
            const endDate = dayjs(`${year}-12-31`).endOf("year");

            const response = await fetch(
                `${API_URL}/Reports/sales/overview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=day`,
                {
                    headers: { ...authHeader },
                }
            );

            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

            const result = await response.json();
            if (!result.success || !result.data)
                throw new Error("Dữ liệu không hợp lệ");

            const items = result.data;

            // === TÍNH TỔNG DOANH THU CẢ NĂM ===
            const total = items.reduce(
                (sum, item) => sum + Number(item.totalRevenue || 0),
                0
            );

            setTotalRevenue(total);
        } catch (error) {
            console.error("Lỗi API:", error);
        }
    };

    // === HÀM TÍNH TOÁN DOANH THU THÁNG HIỆN TẠI ===
    const fetchtotalRevenueMonth = async () => {
        try {
            // const now = dayjs();
            const now = yearSelectedpie ? yearSelectedpie : dayjs();
            const monthStart = now.startOf("month");
            const monthEnd = now.endOf("month");

            const response = await fetch(
                `${API_URL}/Reports/sales/overview?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}&groupBy=day`,
                {
                    headers: { ...authHeader },
                }
            );

            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

            const result = await response.json();
            if (!result.success || !result.data)
                throw new Error("Dữ liệu không hợp lệ");

            const items = result.data;

            const total = items.reduce(
                (sum, item) => sum + Number(item.totalRevenue || 0),
                0
            );

            setTotalRevenueMonth(total);
        } catch (error) {
            console.error("Lỗi API:", error);
        }
    };

    // === HÀM TẢI DỮ LIỆU BIỂU ĐỒ THEO THÁNG ĐƯỢC CHỌN ===
    const fetchChartABC = async (yearSelectedpie) => {
        try {
            const month = yearSelectedpie
                ? yearSelectedpie.month() + 1
                : dayjs().month() + 1;
            const year = yearSelectedpie ? yearSelectedpie.year() : dayjs().year();

            // Ngày bắt đầu và kết thúc của tháng đó
            const fromDate = dayjs(`${year}-${month}-01`).startOf("month");
            const toDate = dayjs(`${year}-${month}-01`).endOf("month");

            // Gọi API
            const response = await fetch(
                `${API_URL}/Products/abc-analysis?pageNumber=1&pageSize=100&fromDate=${fromDate.format(
                    "YYYY-MM-DD"
                )}&toDate=${toDate.format("YYYY-MM-DD")}`,
                {
                    headers: { ...authHeader },
                }
            );

            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

            const result = await response.json();
            if (!result.success || !result.data?.items)
                throw new Error("Dữ liệu không hợp lệ");

            const items = result.data.items;

            // === Xử lý dữ liệu như cũ ===
            setAbcData(items);

            const sorted = [...items].sort((a, b) => b.value - a.value);
            setTop5Products(sorted.slice(0, 5));

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
        } catch (error) {
            console.error("Lỗi API:", error);
        }
    };

    const fetchChart = async () => {
        try {
            const year = yearSelected ? yearSelected.year() : dayjs().year();
            const monthlyRevenue = [];

            for (let month = 0; month < 12; month++) {
                const monthStart = dayjs(`${year}-${month + 1}-01`).startOf("month");
                const monthEnd = dayjs(`${year}-${month + 1}-01`).endOf("month");

                const res = await fetch(
                    `${API_URL}/Reports/sales/overview?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}&groupBy=day`,
                    {
                        headers: { ...authHeader },
                    }
                );

                if (!res.ok)
                    throw new Error(`Lỗi API tháng ${month + 1}: ${res.status}`);

                const data = await res.json();

                // Tính tổng doanh thu của tháng đó
                const totalRevenue = data?.data?.reduce(
                    (sum, item) => sum + (item.totalRevenue || 0),
                    0
                );
                monthlyRevenue.push(totalRevenue || 0);
            }

            // Sau khi có dữ liệu 12 tháng → render Line chart
            const months = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

            setLineData({
                labels: months,
                datasets: [
                    {
                        label: `Doanh thu năm ${year} (₫)`,
                        data: monthlyRevenue,
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
            message.error("Không thể tải dữ liệu. Vui lòng kiểm tra API hoặc token.");
        }
    };

    // === CẬP NHẬT DOANH THU NĂM KHI NĂM ĐƯỢC CHỌN THAY ĐỔI ===
    useEffect(() => {
        fetchtotalRevenueYear();
        fetchtotalRevenueMonth();
        fetchChartABC(yearSelectedpie);
        fetchChart();
    }, [yearSelected, monthSelected, yearSelectedpie]);

    // === HÀM TẢI BÁO CÁO DƯỚI DẠNG CSV ===
    const downloadReport = () => {
        const header = [
            "Mã sản phẩm",
            "Tên sản phẩm",
            "Mã vạch",
            "Doanh thu (₫)",
            "Tần suất bán",
            "Điểm",
            "Phân loại ABC",
        ];

        const rows = abcData.map(
            (i) =>
                `${i.productId},"${i.productName}",${i.barcode},${i.value},${i.frequency},${i.score},${i.abcClassification}`
        );

        // BOM + dấu phẩy
        const csv = "\uFEFF" + [header.join(","), ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Báo cáo_ABC_Tháng_${startDate.format("MM_YYYY")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // === COLUMNS CHO BẢNG DỮ LIỆU TRONG MODAL ===
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
                        <DatePicker
                            picker="year"
                            value={yearSelected}
                            onChange={setYearSelected}
                            placeholder="Chọn năm"
                            className="modern-picker"
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
                                <h3>Doanh thu năm {yearSelected.year()}</h3>
                                <div className="value" style={{ color: "red" }}>
                                    {totalRevenue.toLocaleString()} ₫
                                </div>
                            </div>
                            <div className="revenue-box">
                                <CalendarOutlined className="icon" />
                                <h3>
                                    Doanh thu tháng{" "}
                                    {yearSelectedpie
                                        ? `tháng ${yearSelectedpie.month() + 1
                                        }/${yearSelectedpie.year()}`
                                        : "tháng hiện tại"}
                                </h3>
                                <div className="value">
                                    {TotalRevenueMonth.toLocaleString()} ₫
                                </div>
                            </div>
                        </div>
                        <div className="SaleReport-top5">
                            <h4>
                                Top 5 sản phẩm bán chạy trong{" "}
                                {yearSelectedpie
                                    ? `tháng ${yearSelectedpie.month() + 1
                                    }/${yearSelectedpie.year()}`
                                    : "tháng hiện tại"}
                            </h4>

                            {top5Products && top5Products.length > 0 ? (
                                <ul>
                                    {top5Products.map((p, i) => (
                                        <li
                                            key={p.productId}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontWeight: "bold", marginRight: 8 }}>
                                                    #{i + 1}
                                                </span>
                                                <span title={p.productName}>{p.productName}</span>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                }}
                                            >
                                                <span>{Number(p.value).toLocaleString()} ₫</span>
                                                <ArrowUpOutlined style={{ color: "red" }} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Empty description="Không có dữ liệu Top 5 sản phẩm" />
                            )}
                        </div>
                    </div>

                    {/* CỘT 2: Pie */}
                    <div className="SaleReport-pie-block">
                        <div className="chart-header">
                            <span>Tỷ trọng nhóm ABC</span>
                            <DatePicker
                                picker="month"
                                value={yearSelectedpie}
                                onChange={setYearSelectedPie}
                                placeholder="Chọn tháng"
                                className="modern-picker"
                            />
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => setModalVisible(true)}
                            >
                                Xem chi tiết
                            </Button>
                        </div>
                        {pieData && pieData.labels && pieData.labels.length > 0 ? (
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
                        ) : (
                            <Empty description="Không có dữ liệu ABC" />
                        )}
                    </div>

                    {/* CỘT 3: Line */}
                    <div className="SaleReport-line-block">
                        <div className="chart-header">
                            Doanh thu năm {yearSelected.year()}
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
