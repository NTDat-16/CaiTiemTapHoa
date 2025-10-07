import Navbar from '../../components/Navbar/Navbar'
import Sidebar from '../../components/Sidebar/Sidebar'
import './Home.css'

export default function Home() {
  return (
    <div className="HomeWrapper">
        <div className="HomeTop">
          <Navbar />
        </div>
        <div className="HomeBody">
          <Sidebar />
          <div className="MainContentRight">
            <h1>Dashboard</h1>
          </div>
        </div>
    </div>
  )
}
