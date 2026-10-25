import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResultsLayout from '../components/ResultsLayout';

export default function SchemeResults() {
  const [searchParams] = useSearchParams();
  const scheme = searchParams.get('scheme') === 'PMJAY' ? 'Ayushman Bharat PM-JAY' : (searchParams.get('scheme') || 'your scheme');
  const location = searchParams.get('location') || 'your location';
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams({ location, scheme: 'PM-JAY' });
    fetch(`/api/hospitals/search?${params.toString()}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
        return data;
      })
      .then((data) => {
      if (!mounted) return;
      setHospitals(Array.isArray(data) ? data : []);
      })
      .catch((queryError) => {
        if (mounted) setError(queryError.message);
      });
    return () => { mounted = false; };
  }, [location]);

  if (error) return <main className="p-8 text-red-700">Unable to load hospitals: {error}</main>;
  return <ResultsLayout title={scheme} location={location} hospitals={hospitals} resultType="scheme" />;
}
