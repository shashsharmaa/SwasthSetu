import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportIssueModal from './ReportIssueModal';
import { getLastVerified, getOfficialSource, getSafeUrl } from '../lib/officialSources';

export default function HospitalCard({ hospital, resultType, contextValue, location, onSelect, onDirections, isCompared = false, onToggleCompare }) {
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isScheme = resultType === 'scheme';
  const isVerified = isScheme ? hospital.is_pmjay_empanelled : true;
  const statusLabel = isScheme ? 'PM-JAY Empanelled' : 'Network Hospital';
  const contextParam = resultType === 'scheme' ? 'scheme=PMJAY' : `insurer=${encodeURIComponent(contextValue || '')}`;
  const detailsPath = `/${resultType}/hospital/${hospital.id}?${contextParam}&location=${encodeURIComponent(location || '')}`;
  const lastVerified = getLastVerified(hospital);
  const daysSinceVerified = lastVerified ? Math.max(0, Math.floor((Date.now() - new Date(lastVerified).getTime()) / 86400000)) : null;
  const freshness = daysSinceVerified !== null && daysSinceVerified <= 30
    ? { label: 'Verified', className: 'bg-green-100 text-green-700', icon: '🟢' }
    : daysSinceVerified !== null && daysSinceVerified <= 180
      ? { label: 'Needs Re-verification', className: 'bg-yellow-100 text-yellow-700', icon: '🟡' }
      : { label: 'Sample Data', className: 'bg-red-100 text-red-700', icon: '🔴' };
  const sourceUrl = getOfficialSource(hospital, contextValue, resultType);

  return (
    <>
      <article className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      {onToggleCompare && (
        <label className="absolute left-4 top-4 flex cursor-pointer items-center gap-2 text-xs text-gray-500">
          <input type="checkbox" checked={isCompared} onChange={() => onToggleCompare(hospital)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" aria-label={`Compare ${hospital.name}`} />
          Compare
        </label>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className={`min-w-0 ${onToggleCompare ? 'pt-7' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900">{hospital.name}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-gray-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>
              {hospital.address}, {hospital.city} - {hospital.pincode}
              {Number.isFinite(Number(hospital.distance_km)) && <span className="mt-1 block font-semibold text-teal-700">{hospital.distance_km} km away</span>}
            </span>
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {statusLabel}
        </span>
      </div>
      <div className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${freshness.className}`}>{freshness.icon} {freshness.label}</div>
      <div className="mt-2 text-xs text-gray-500">
        <a href={getSafeUrl(sourceUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline">
          <ExternalLink size={12} /> Verify on Official Site
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(hospital.specialities || []).map((speciality) => (
          <span key={speciality} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{speciality}</span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <button type="button" onClick={() => setIsReportOpen(true)} className="text-xs text-gray-400 transition hover:text-gray-600">Report Wrong Info</button>
        <div className="flex items-center gap-3">
        {onDirections && <button type="button" onClick={() => onDirections(hospital)} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"><Navigation className="h-4 w-4" /> Get Directions</button>}
        <button type="button" onClick={() => onSelect ? onSelect(hospital) : navigate(detailsPath)} className="rounded-lg border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30">
          View Details
        </button>
        </div>
      </div>
      </article>
      {isReportOpen && <ReportIssueModal hospital={hospital} onClose={() => setIsReportOpen(false)} />}
    </>
  );
}
