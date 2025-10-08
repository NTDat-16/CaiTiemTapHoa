import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Sidebar from '../../components/Sidebar/Sidebar'
import UserManage from '../../components/UserManage/UserManage'
import './Home.css'
import CustomerManage from '../../components/CustomerManage/CustomerManage'

export default function Home() {
  const [choosen, setChoosen] = useState("employee");

  function handleChoosen(frame) {
    switch (frame) {
      case "home":
        
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
        <Sidebar onTag={handleChoosen}/>
        {/* <UserManage /> */}
        {choosen === "employee" && <UserManage />}
        {choosen === "customer" && <CustomerManage />}
      </div>
    </>
  )
}