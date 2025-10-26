import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  DatePicker,
  Select,
  InputNumber,
  Button,
  Form,
  Row,
  Col,
  Card,
  message,
  Table,
  Space,
} from "antd";
import dayjs from "dayjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = "http://localhost:5000/api";
const { RangePicker } = DatePicker;

export default function ProductAnalysis() {
  const [chartData, setChartData] = useState(null); // data for pie
  const [tableData, setTableData] = useState([]); // data for detail table
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState("abc"); // "abc" or "product"

  // columns for detail table
  const columns = [
    { title: "Mã sản phẩm", dataIndex: "productId", key: "productId" },
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" },
    { title: "Barcode", dataIndex: "barcode", key: "barcode" },
    {
      title: "Giá trị (₫)",
      dataIndex: "value",
      key: "value",
      render: (val) => (val != null ? val.toLocaleString("vi-VN") : "-"),
    },
    { title: "Tần suất", dataIndex: "frequency", key: "frequency" },
    { title: "Điểm số", dataIndex: "score", key: "score" },
    {
      title: "Phân loại ABC",
      dataIndex: "abcClassification",
      key: "abcClassification",
      render: (text) => {
        if (!text) return "-";
        const color = text === "A" ? "green" : text === "B" ? "orange" : "red";
        return <span style={{ color, fontWeight: 600 }}>{text}</span>;
      },
    },
  ];

  // validate range: returns { ok: boolean, from, to } and shows messages if invalid
  const validateRange = (fromDate, toDate) => {
    // if both absent -> default to today
    if (!fromDate && !toDate) return { ok: true, from: dayjs(), to: dayjs() };
    if (!fromDate || !toDate) {
      message.error("Vui lòng chọn cả từ ngày và đến ngày (hoặc để cả hai trống).");
      return { ok: false };
    }
    if (fromDate.isAfter(toDate, "day")) {
      message.error("Từ ngày không được lớn hơn Đến ngày.");
      return { ok: false };
    }
    return { ok: true, from: fromDate, to: toDate };
  };

  const fetchAnalysis = async (params) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/Products/abc-analysis?${query}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) {
        const errMsg = json?.message || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }
      if (!json.success) {
        message.error(json.message || "Lỗi server khi lấy dữ liệu phân tích");
        setChartData(null);
        setTableData([]);
        return;
      }

      const items = Array.isArray(json.data?.items) ? json.data.data?.items || json.data.items : [];

      // defensive: if structure is json.data.items (common)
      const itemsArray = Array.isArray(json.data?.items) ? json.data.items : Array.isArray(json.items) ? json.items : [];

      if (!itemsArray || itemsArray.length === 0) {
        message.warning("Không có dữ liệu trong khoảng thời gian đã chọn");
        setChartData(null);
        setTableData([]);
        return;
      }

      // build chart depending on viewMode
      if (viewMode === "abc") {
        // group by abcClassification -> sum value
        const grouped = itemsArray.reduce((acc, it) => {
          const key = it.abcClassification || "Unknown";
          acc[key] = (acc[key] || 0) + (it.value || 0);
          return acc;
        }, {});
        const labels = Object.keys(grouped);
        const data = Object.values(grouped);

        setChartData({
          labels,
          datasets: [
            {
              label: "Doanh thu theo nhóm ABC",
              data,
              backgroundColor: labels.map((_, i) =>
                ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0", "#9966FF"][i % 5]
              ),
            },
          ],
        });
      } else {
        // product mode
        const labels = itemsArray.map((i) => i.productName);
        const data = itemsArray.map((i) => i.value || 0);
        setChartData({
          labels,
          datasets: [
            {
              label: "Doanh thu theo sản phẩm",
              data,
              backgroundColor: labels.map((_, i) =>
                ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0", "#9966FF"][i % 5]
              ),
            },
          ],
        });
      }

      // set table data (show raw items)
      setTableData(itemsArray);
    } catch (err) {
      console.error("fetchAnalysis error:", err);
      message.error(err.message || "Lỗi khi lấy dữ liệu phân tích");
      setChartData(null);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // handle form submit
  const handleSearch = (values) => {
    // values: { PageNumber, PageSize, Skip, fromDate, toDate } or RangePicker can provide both in single field
    let from = values.fromDate;
    let to = values.toDate;

    // support if user used RangePicker by name 'range'
    if (!from && !to && values.range) {
      from = values.range[0];
      to = values.range[1];
    }

    const validation = validateRange(from, to);
    if (!validation.ok) return;

    const params = {
      PageNumber: values.PageNumber || 1,
      PageSize: values.PageSize || 10,
      Skip: values.Skip || 0,
      fromDate: validation.from.format("YYYY-MM-DD"),
      toDate: validation.to.format("YYYY-MM-DD"),
    };

    fetchAnalysis(params);
  };

  // initial load - default last 7 days
  useEffect(() => {
    const defaultFrom = dayjs().subtract(7, "day");
    const defaultTo = dayjs();
    form.setFieldsValue({
      PageNumber: 1,
      PageSize: 5,
      Skip: 0,
      fromDate: defaultFrom,
      toDate: defaultTo,
    });
    handleSearch({
      PageNumber: 1,
      PageSize: 5,
      Skip: 0,
      fromDate: defaultFrom,
      toDate: defaultTo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  return (
    <div style={{ padding: 16 }}>
      <Card title="📊 Thống kê doanh thu sản phẩm (ABC Analysis)" bordered>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{
            PageNumber: 1,
            PageSize: 5,
            Skip: 0,
            // fromDate / toDate set in useEffect
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={6} md={4}>
              <Form.Item name="PageNumber" label="Page Number">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Form.Item name="PageSize" label="Page Size">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Form.Item name="Skip" label="Skip">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="fromDate" label="Từ ngày">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="toDate" label="Đến ngày">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Hoặc chọn khoảng" name="range">
                <RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Chế độ hiển thị">
                <Select
                  defaultValue={viewMode}
                  onChange={(val) => setViewMode(val)}
                >
                  <Select.Option value="abc">Theo nhóm ABC</Select.Option>
                  <Select.Option value="product">Theo từng sản phẩm</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Col>
              <Space>
                <Button htmlType="submit" type="primary" loading={loading}>
                  Phân tích
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setChartData(null);
                    setTableData([]);
                  }}
                >
                  Clear
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <div style={{ marginTop: 24 }}>
          {chartData ? (
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ width: 520 }}>
                <Pie
                  data={chartData}
                  options={{
                    plugins: {
                      legend: { position: "bottom" },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `${context.label}: ${context.raw.toLocaleString(
                              "vi-VN"
                            )} VNĐ`,
                        },
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                    <Card size="small" title="Chi tiết (danh sách)" style={{ overflow: "scroll", maxHeight: "375px" }}>
                  <Table
                    dataSource={tableData}
                    columns={columns}
                    rowKey={(r) => r.productId ?? `${r.productName}-${Math.random()}`}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </div>
            </div>
          ) : (
            <p style={{ color: "#666", marginTop: 12 }}>
              {loading ? "Đang tải dữ liệu..." : "Chưa có dữ liệu hiển thị"}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
