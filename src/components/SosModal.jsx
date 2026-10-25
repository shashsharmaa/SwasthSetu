import { Phone, X } from 'lucide-react';

export default function SosModal({ hospitals, onClose }) {
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="sos-title">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Emergency assistance</p>
            <h2 id="sos-title" className="mt-1 text-2xl font-bold text-gray-900">Nearest Hospitals</h2>
            <p className="mt-1 text-sm text-gray-500">Call the hospital to confirm emergency availability.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close SOS results"><X className="h-5 w-5" /></button>
        </div>
        {hospitals.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">No nearby hospitals with valid contact coordinates were found.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {hospitals.map((hospital) => (
              <article key={hospital.id} className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{hospital.address}, {hospital.city} - {hospital.pincode}</p>
                    <p className="mt-2 text-sm font-semibold text-red-700">{hospital.distance_km} km away</p>
                  </div>
                  {hospital.phone && <a href={`tel:${hospital.phone}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"><Phone className="h-4 w-4" /> Call</a>}
                </div>
              </article>
            ))}
          </div>
        )}
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-red-300 hover:text-red-700">Close</button>
      </div>
    </div>
  );
}
