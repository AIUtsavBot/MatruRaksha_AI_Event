// FILE: frontend/src/App.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import RiskDashboard from './pages/RiskDashboard'
import DoctorDashboard from './pages/DoctorDashboard.jsx'
import ASHAInterface from './pages/ASHAInterface.jsx'

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Simple check - just set ready after a short delay
    setTimeout(() => {
      setIsReady(true)
    }, 500)
  }, [])

  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        {t('loading')}
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>{t('risk_dashboard')}</Link>
        <Link to="/doctor" style={{ textDecoration: 'none' }}>{t('doctor_dashboard')}</Link>
        <Link to="/asha" style={{ textDecoration: 'none' }}>{t('asha_interface')}</Link>
        <div style={{ marginLeft: 'auto' }}>
          <select aria-label="Language" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} style={{ padding: 6 }}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<RiskDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/asha" element={<ASHAInterface />} />
      </Routes>
    </BrowserRouter>
  )
}
