import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import InsuranceResults from './pages/InsuranceResults';
import SchemeResults from './pages/SchemeResults';
import HospitalDetails from './pages/HospitalDetails';
import InsuranceDashboard from './pages/InsuranceDashboard';
import SchemeDashboard from './pages/SchemeDashboard';
import KiwiChatbot from './components/KiwiChatbot';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/insurance/login" element={<LoginPage />} />
        <Route path="/scheme/login" element={<LoginPage />} />
        <Route path="/insurance/dashboard" element={<InsuranceDashboard />} />
        <Route path="/scheme/dashboard" element={<SchemeDashboard />} />
        <Route path="/insurance/results" element={<InsuranceResults />} />
        <Route path="/scheme/results" element={<SchemeResults />} />
        <Route path="/insurance/hospital/:id" element={<HospitalDetails />} />
        <Route path="/scheme/hospital/:id" element={<HospitalDetails />} />
      </Routes>
      <KiwiChatbot />
    </>
  );
}
