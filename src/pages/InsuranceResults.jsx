import { useSearchParams } from 'react-router-dom';
import ResultsLayout from '../components/ResultsLayout';
import { mockHospitals } from '../data/mockHospitals';

export default function InsuranceResults() {
  const [searchParams] = useSearchParams();
  const insurer = searchParams.get('insurer') || 'your insurer';
  const location = searchParams.get('location') || 'your location';

  return <ResultsLayout title={insurer} location={location} hospitals={mockHospitals} resultType="insurance" />;
}
