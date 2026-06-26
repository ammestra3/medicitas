import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Notifications from './pages/Notifications'
import Chat from './pages/Chat'
import History from './pages/History'
import Profile from './pages/patient/Profile'
import DoctorCalendar from './pages/doctor/DoctorCalendar'
import DoctorProfile from './pages/doctor/DoctorProfile'
import PatientRecords from './pages/doctor/PatientRecords'
import Analytics from './pages/doctor/Analytics'

function ProtectedLayout() {
  const { user, isDoctor } = useAuth()
  const [notifCount, setNotifCount] = useState(3)
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-layout">
      <Sidebar notifCount={notifCount} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          {!isDoctor() && <>
            <Route path="/appointments"  element={<Appointments />} />
            <Route path="/history"       element={<History />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/notifications" element={<Notifications onRead={() => setNotifCount(0)} />} />
          </>}
          {isDoctor() && <>
            <Route path="/calendar"  element={<DoctorCalendar />} />
            <Route path="/patients"  element={<PatientRecords />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile"   element={<DoctorProfile />} />
          </>}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
