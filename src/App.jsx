import './App.css'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
<<<<<<< HEAD
import Order from './pages/Order/Order'
import Promotion from './pages/Promotion/Promotion'
=======

>>>>>>> origin/main
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext';

export function Protected({children}) {
  const { user } = useAuth();
  if (!user){
    return <Navigate to={'/login'} replace />
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
<<<<<<< HEAD
            <Route path="order" element={<Order />} />
          <Route path="promotion" element={<Promotion />} />
=======
        
>>>>>>> origin/main
          <Route path='/login' element={<Login />}/>
          <Route path='/order' element={<Order/>}></Route>
          <Route path='/promotion' element={<Promotion/>}></Route>
          <Route path='/' element={<Protected><Home /></Protected>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App