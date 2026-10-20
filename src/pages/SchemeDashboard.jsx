import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function SchemeDashboard() {
  const { userName } = useAuth();
  return <DashboardLayout type="scheme" userName={userName} />;
}
