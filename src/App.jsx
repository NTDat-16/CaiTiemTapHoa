import './App.css'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
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
          <Route path='/login' element={<Login />}/>
          <Route path='/' element={<Protected><Home /></Protected>}/>
           <Route path='/home' element={<Home/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App