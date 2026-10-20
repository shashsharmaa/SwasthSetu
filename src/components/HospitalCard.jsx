import { CalendarDays, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HospitalCard({ hospital, resultType, contextValue, location, onSelect }) {
  const navigate = useNavigate();
  const isVerified = hospital.networkStatus === 'In-Network' || hospital.networkStatus === 'Empanelled';
  const contextParam = resultType === 'scheme' ? 'scheme=PMJAY' : `insurer=${encodeURIComponent(contextValue || '')}`;
  const detailsPath = `/${resultType}/hospital/${hospital.id}?${contextParam}&location=${encodeURIComponent(location || '')}`;

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{hospital.name}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-gray-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>{hospital.address}, {hospital.city} - {hospital.pincode}</span>
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {hospital.networkStatus}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {hospital.specialities.map((speciality) => (
          <span key={speciality} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{speciality}</span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays className="h-4 w-4" /> Verified {hospital.lastVerified}
        </p>
        <button type="button" onClick={() => onSelect ? onSelect(hospital) : navigate(detailsPath)} className="rounded-lg border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30">
          View Details
        </button>
      </div>
    </article>
  );
}
