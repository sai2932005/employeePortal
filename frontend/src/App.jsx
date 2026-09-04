import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/admin" element={<ProtectedRoute requires="manage_users"><AdminPanel/></ProtectedRoute>}/>
        <Route path ="*" element={<Navigate to="/dashboard" replace/>}/>



      </Routes>
    
    
    
    </BrowserRouter>
  )

}
  

export default App
