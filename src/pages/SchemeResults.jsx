import { useSearchParams } from 'react-router-dom';
import ResultsLayout from '../components/ResultsLayout';
import { mockHospitals } from '../data/mockHospitals';

export default function SchemeResults() {
  const [searchParams] = useSearchParams();
  const scheme = searchParams.get('scheme') === 'PMJAY' ? 'Ayushman Bharat PM-JAY' : (searchParams.get('scheme') || 'your scheme');
  const location = searchParams.get('location') || 'your location';
  const hospitals = mockHospitals.map((hospital) => ({ ...hospital, networkStatus: hospital.networkStatus === 'Unknown' ? 'Unknown' : 'Empanelled' }));

  return <ResultsLayout title={scheme} location={location} hospitals={hospitals} resultType="scheme" />;
}
