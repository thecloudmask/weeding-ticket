

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import { Toaster } from 'sonner';
import LoginPage from './pages/Login'
import GuestPaymentPage from './pages/GuestPaymentPage'

import WeddingFlowPage from './pages/WeddingFlowPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <Router>
    <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/wedding/:id" element={<WeddingFlowPage />} />
        <Route path="/guest-payment" element={<ProtectedRoute><GuestPaymentPage /></ProtectedRoute>} />
      </Routes>
  </Router>
  )
}

export default App
