import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import SosModal from './SosModal';

export default function SosButton({ insurer, scheme, onHospitalsFound }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState(null);
  const [error, setError] = useState('');

  function findNearestHospitals() {
    if (!navigator.geolocation) {
      setError('Location access is unavailable in this browser.');
      return;
    }
    setError('');
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        });
        if (insurer) params.set('insurer', insurer);
        if (scheme) params.set('scheme', scheme);
        const response = await fetch(`/api/hospitals/nearest?${params.toString()}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
        const nearest = Array.isArray(data) ? data : [];
        setHospitals(nearest);
        onHospitalsFound?.(nearest, { lat: position.coords.latitude, lng: position.coords.longitude });
      } catch (requestError) {
        setError(`Unable to find nearby hospitals: ${requestError.message}`);
      } finally {
        setIsLoading(false);
      }
    }, () => {
      setError('Allow location access to find the nearest hospitals.');
      setIsLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[1000] flex flex-col items-start gap-2">
        {error && <p className="max-w-56 rounded-xl bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg">{error}</p>}
        <button type="button" onClick={findNearestHospitals} disabled={isLoading} className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-bold text-white shadow-xl shadow-red-600/30 transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-80 animate-pulse" aria-label="Find nearest emergency hospitals">
          <AlertTriangle className="h-5 w-5" /> {isLoading ? 'Finding nearest hospitals...' : 'SOS'}
        </button>
      </div>
      {hospitals && <SosModal hospitals={hospitals} onClose={() => setHospitals(null)} />}
    </>
  );
}
