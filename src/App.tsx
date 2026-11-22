import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useQueueStore } from './stores/queueStore'
import { LiveToastContainer } from './components/ui/LiveToast'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import JoinQueue from './pages/JoinQueue'
import CustomerToken from './pages/CustomerToken'
import LiveDisplay from './pages/LiveDisplay'
import BarberDashboard from './pages/BarberDashboard'
import AdminDashboard from './pages/AdminDashboard'
import BarberAnalytics from './pages/BarberAnalytics'
import CustomerFeedback from './pages/CustomerFeedback'
import QueueClosed from './pages/QueueClosed'
import AdminLogin from './pages/AdminLogin'
import NotFound from './pages/NotFound'

export default function App() {
  const { initRealtimeSync } = useQueueStore()

  useEffect(() => {
    // Mount cross-tab real-time and Supabase / backend database synchronization
    const cleanup = initRealtimeSync()
    return () => {
      if (typeof cleanup === 'function') {
        (cleanup as () => void)()
      }
    }
  }, [initRealtimeSync])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F4F8FC] text-slate-900 selection:bg-blue-600 selection:text-white relative">
        {/* Dynamic Living Ambient Orbs in Background */}
        <div className="ambient-bg">
          <div className="ambient-orb-1" />
          <div className="ambient-orb-2" />
          <div className="ambient-orb-3" />
        </div>

        {/* Global Realtime Live Activity Toasts */}
        <LiveToastContainer />

        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/join" replace />} />
            <Route path="/join" element={<JoinQueue />} />
            <Route path="/token/:id" element={<CustomerToken />} />
            <Route path="/display" element={<LiveDisplay />} />
            <Route path="/barber/:id" element={<BarberDashboard />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <BarberAnalytics />
                </ProtectedRoute>
              }
            />
            <Route path="/feedback/:token" element={<CustomerFeedback />} />
            <Route path="/closed" element={<QueueClosed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
