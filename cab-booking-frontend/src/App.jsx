import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MyRides from './pages/MyRides'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
return (
<BrowserRouter>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/my-rides" element={<MyRides />} />
<Route path="/driver-dashboard" element={<DriverDashboard />} />
<Route path="/admin-dashboard" element={<AdminDashboard />} />
</Routes>
</BrowserRouter>
)
}

export default App