import { Bookmark, BookmarkCheck, Copy, ExternalLink, MapPin, Navigation, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportIssueModal from './ReportIssueModal';
import { getLastVerified, getOfficialSource, getSafeUrl } from '../lib/officialSources';

export default function HospitalCard({ hospital, resultType, contextValue, location, onSelect, onDirections, isCompared = false, onToggleCompare }) {
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedHospitals') || '[]');
      return Array.isArray(saved) && saved.some((savedHospital) => savedHospital.id === hospital.id);
    } catch {
      return false;
    }
  });
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

  useEffect(() => {
    function refreshSavedState() {
      try {
        const saved = JSON.parse(localStorage.getItem('savedHospitals') || '[]');
        setIsSaved(Array.isArray(saved) && saved.some((savedHospital) => savedHospital.id === hospital.id));
      } catch {
        setIsSaved(false);
      }
    }
    window.addEventListener('savedHospitalsChanged', refreshSavedState);
    return () => window.removeEventListener('savedHospitalsChanged', refreshSavedState);
  }, [hospital.id]);

  function toggleSaved() {
    let saved = [];
    try {
      const stored = JSON.parse(localStorage.getItem('savedHospitals') || '[]');
      saved = Array.isArray(stored) ? stored : [];
    } catch {
      saved = [];
    }
    const next = isSaved ? saved.filter((savedHospital) => savedHospital.id !== hospital.id) : [...saved, hospital];
    localStorage.setItem('savedHospitals', JSON.stringify(next));
    setIsSaved(!isSaved);
    window.dispatchEvent(new Event('savedHospitalsChanged'));
    window.alert(isSaved ? 'Removed' : 'Saved to profile');
  }

  function shareHospital() {
    const text = `Check out this hospital on SwasthSetu: ${hospital.name} - ${hospital.address}. Accepts: ${(hospital.accepted_insurers || []).join(', ') || 'Not listed'}.`;
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function copyHospitalLink() {
    const link = `${window.location.origin}${detailsPath}`;
    const text = `Check out this hospital on SwasthSetu: ${hospital.name} - ${hospital.address}. Accepts: ${(hospital.accepted_insurers || []).join(', ') || 'Not listed'}.\n${link}`;
    try {
      await navigator.clipboard.writeText(text);
      window.alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Unable to copy hospital link:', error);
      window.alert('Unable to copy the link. Please try again.');
    }
  }

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
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={toggleSaved} className="rounded-lg p-2 text-teal-700 transition hover:bg-teal-50" aria-label={isSaved ? `Remove ${hospital.name} from saved hospitals` : `Save ${hospital.name}`}>
            {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
          <button type="button" onClick={shareHospital} className="rounded-lg p-2 text-teal-700 transition hover:bg-teal-50" aria-label={`Share ${hospital.name}`}>
            <Share2 className="h-5 w-5" />
          </button>
          <button type="button" onClick={copyHospitalLink} className="rounded-lg p-2 text-teal-700 transition hover:bg-teal-50" aria-label={`Copy link for ${hospital.name}`} title="Copy Link">
            <Copy className="h-5 w-5" />
          </button>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
            {statusLabel}
          </span>
        </div>
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
