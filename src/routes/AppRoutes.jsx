import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from '../pages/AuthPage'
import AdminDashboard from '../pages/AdminDashboard'
import UserDashboard from '../pages/UserDashboard'

function PrivateAdminRoute({ children }) {
  const token = localStorage.getItem('pointflow_token')
  const user = JSON.parse(localStorage.getItem('pointflow_user'))

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/admin"
          element={
            <PrivateAdminRoute>
              <AdminDashboard />
            </PrivateAdminRoute>
          }
        />

        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes