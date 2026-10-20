import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function InsuranceDashboard() {
  const { userName } = useAuth();
  return <DashboardLayout type="insurance" userName={userName} />;
}
