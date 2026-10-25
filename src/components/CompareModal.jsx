import { X } from 'lucide-react';

const rows = [
  ['Name', (hospital) => hospital.name || 'Not listed'],
  ['Distance', (hospital) => Number.isFinite(Number(hospital.distance_km)) ? `${hospital.distance_km} km` : 'Not available'],
  ['Insurances Accepted', (hospital) => (hospital.accepted_insurers || []).join(', ') || 'Not listed'],
  ['PMJAY Status', (hospital) => hospital.is_pmjay_empanelled ? 'Empanelled' : 'Not empanelled'],
  ['Specialities', (hospital) => (hospital.specialities || []).join(', ') || 'Not listed'],
  ['Verification', (hospital) => {
    const value = hospital.last_verified || hospital.lastVerified;
    const days = value ? Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000)) : null;
    const freshness = days !== null && days <= 30
      ? ['Verified', 'bg-green-100 text-green-700']
      : days !== null && days <= 180
        ? ['Needs Re-verification', 'bg-yellow-100 text-yellow-700']
        : ['Sample Data', 'bg-red-100 text-red-700'];
    return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${freshness[1]}`}>{freshness[0]}</span>;
  }],
];

export default function CompareModal({ hospitals, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="compare-title">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Side-by-side review</p>
            <h2 id="compare-title" className="mt-1 text-2xl font-bold text-gray-900">Compare Hospitals</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close comparison"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 min-w-[640px] overflow-hidden rounded-2xl border border-gray-200">
          <div className="grid" style={{ gridTemplateColumns: `10rem repeat(${hospitals.length}, minmax(12rem, 1fr))` }}>
            <div className="bg-slate-50 p-3 text-sm font-semibold text-slate-600">Compare</div>
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="border-l border-gray-200 bg-teal-50 p-3">
                <p className="font-semibold text-gray-900">{hospital.name}</p>
                <button type="button" onClick={() => onRemove(hospital.id)} className="mt-2 text-xs font-semibold text-gray-500 hover:text-red-600">Remove</button>
              </div>
            ))}
            {rows.map(([label, getValue]) => (
              <div key={label} className="contents">
                <div className="border-t border-gray-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600">{label}</div>
                {hospitals.map((hospital) => <div key={`${hospital.id}-${label}`} className="border-l border-t border-gray-200 p-3 text-sm text-gray-700">{getValue(hospital)}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
