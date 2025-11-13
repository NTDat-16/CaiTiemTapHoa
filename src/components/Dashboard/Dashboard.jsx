import { useState } from "react";

import SalesReport from "../SaleReport/SaleReport";
import Forecast from "../Forecast/Forecast";
// import Inventory from "./Inventory";
// import DeadStock from "./DeadStock";
import DeadStock from "../DeadStock/Deadstock";
import {
  BarChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import "./Dashboard.css";
import Overview from "../Overview/Overview";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Tổng quan", icon: <BarChartOutlined /> },
    { key: "sales", label: "Doanh thu", icon: <LineChartOutlined /> },
    // { key: "forecast", label: "Dự báo Nhu cầu", icon: <DatabaseOutlined /> },
    { key: "deadstock", label: "Dead Stock", icon: <WarningOutlined /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "sales":
        return <SalesReport />;
      case "forecast":
        return <Forecast />;
      case "deadstock":
        return <DeadStock />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Báo Cáo & Phân Tích Bán Hàng</h2>

        <div className="dashboard-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`dashboard-tab-button ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} <span style={{ marginLeft: 4 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* NỘI DUNG */}
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
}
