import { MapPinned, Trash2, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

function readSavedHospitals() {
  try {
    const saved = JSON.parse(localStorage.getItem('savedHospitals') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function ProfileModal({ userName, onClose, onViewMap }) {
  const [savedHospitals, setSavedHospitals] = useState(readSavedHospitals);

  useEffect(() => {
    const refresh = () => setSavedHospitals(readSavedHospitals());
    window.addEventListener('savedHospitalsChanged', refresh);
    return () => window.removeEventListener('savedHospitalsChanged', refresh);
  }, []);

  function removeHospital(id) {
    const next = savedHospitals.filter((hospital) => hospital.id !== id);
    localStorage.setItem('savedHospitals', JSON.stringify(next));
    setSavedHospitals(next);
    window.dispatchEvent(new Event('savedHospitalsChanged'));
  }

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3"><span className="rounded-full bg-teal-100 p-3 text-teal-700"><User className="h-5 w-5" /></span><div><h2 id="profile-title" className="text-2xl font-bold text-gray-900">My Profile</h2><p className="text-sm text-gray-500">{userName || 'Guest user'}</p></div></div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close profile"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="text-lg font-bold text-gray-900">Saved Hospitals</h3>
          {savedHospitals.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-teal-50 p-5 text-sm text-teal-900">No saved hospitals yet. Search and tap the bookmark icon!</p>
          ) : (
            <div className="mt-4 space-y-3">
              {savedHospitals.map((hospital) => (
                <article key={hospital.id} className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 p-4">
                  <div><h4 className="font-semibold text-gray-900">{hospital.name}</h4><p className="mt-1 text-sm text-gray-500">{hospital.address}, {hospital.city} - {hospital.pincode}</p></div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => onViewMap(hospital)} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"><MapPinned className="h-4 w-4" /> View on Map</button>
                    <button type="button" onClick={() => removeHospital(hospital.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${hospital.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
