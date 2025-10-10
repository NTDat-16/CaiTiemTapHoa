import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import UserManage from "../../components/UserManage/UserManage";
import Order from "../../components/Order/Order";
import CustomerManage from "../../components/CustomerManage/CustomerManage";
import Promotion from "../../components/Promotion/Promotion";
import "./Home.css";
import ProductManage from "../../components/ProductManage/ProductManage";
import Inventory from "../../components/Inventory/Inventory";

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
          {choosen === "category" && <UserManage />}
          {choosen === "employee" && <UserManage />}
          {choosen === "customer" && <CustomerManage />}
          {choosen === "order" && <Order />}
          {choosen === "promotion" && <Promotion />}
          {choosen === "product" && <ProductManage />}
          {choosen === "inventory" && <Inventory />}
          {choosen === "report" && (
            <p style={{ textAlign: "center", marginTop: "100px" }}>
              Trang Báo cáo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
