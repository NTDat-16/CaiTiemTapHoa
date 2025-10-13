import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Order from "../../components/Order/Order";
import CustomerManage from "../../components/CustomerManage/CustomerManage";
import Promotion from "../../components/Promotion/Promotion";
import ProductManage from "../../components/ProductManage/ProductManage";
import Inventory from "../../components/Inventory/Inventory";
import Dashboard from "../../components/Dashboard/Dashboard";
import Category from "../../components/Category/Category";
import Employee from "../../components/Employee/Employee";
import "./Home.css";

export default function Home() {
  const [choosen, setChoosen] = useState("order");

  function handleChoosen(frame) {
    setChoosen(frame);
  }
  return (
    <div className="home-container">
      <Navbar />
      <div className="HomeWrapper">
        {/* Sidebar cố định bên trái */}
        <Sidebar onTag={handleChoosen} choosen={choosen} />

        {/* Khu vực nội dung chính thay đổi */}
        <div className="HomeContent">
          {choosen === "category" && <Category />}
          {choosen === "employee" && <Employee />}
          {choosen === "customer" && <CustomerManage />}
          {choosen === "order" && <Order />}
          {choosen === "promotion" && <Promotion />}
          {choosen === "product" && <ProductManage />}
          {choosen === "inventory" && <Inventory />}
          {choosen === "report" && <Dashboard />}
        </div>
      </div>
    </div>
  );
}
