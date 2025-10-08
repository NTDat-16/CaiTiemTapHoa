import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Sidebar from '../../components/Sidebar/Sidebar'
import UserManage from '../../components/UserManage/UserManage'
import './Home.css'
import CustomerManage from '../../components/CustomerManage/CustomerManage'
import InvoiceManage from '../../components/InvoiceManage/InvoiceManage'

export default function Home() {
  const [choosen, setChoosen] = useState("invoice");

  function handleChoosen(frame) {
    switch (frame) {
      case "invoice":
        setChoosen("invoice");
        break;

      case "employee":
        setChoosen("employee");
        break;

      case "customer":
        setChoosen("customer");
        break;

      case "product":

        break;

      case "report":

        break;

    }
  }
  return (
    <>
      <Navbar />
      <div className="HomeWrapper">
        <Sidebar onTag={handleChoosen} choosen={choosen}/>
        {choosen === "invoice" && <InvoiceManage />}
        {choosen === "employee" && <UserManage />}
        {choosen === "customer" && <CustomerManage />}
      </div>
    </>
  )
}