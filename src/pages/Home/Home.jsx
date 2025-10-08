import Navbar from '../../components/Navbar/Navbar'
import Sidebar from '../../components/Sidebar/Sidebar'
import UserManage from '../../components/UserManage/UserManage'
import './Home.css'

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="HomeWrapper">
        <Sidebar />
        <UserManage />
      </div>
    </>
  )
}