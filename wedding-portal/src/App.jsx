import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Finance from './pages/Finance.jsx'
import Vendors from './pages/Vendors.jsx'
import Checklist from './pages/Checklist.jsx'
import Guests from './pages/Guests.jsx'

export default function App() {
  return (
    <div className="portal-shell">
      <Nav />
      <main className="portal-main">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/finance"   element={<Finance />} />
          <Route path="/vendors"   element={<Vendors />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/guests"    element={<Guests />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
