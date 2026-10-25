import { AlertTriangle, ArrowLeft, MapPinned, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HospitalCard from './HospitalCard';
import HospitalMap from './HospitalMap';
import CompareModal from './CompareModal';

export default function ResultsLayout({ title, location, hospitals, resultType, embedded = false, onSelect, onDirections, center, zoom, userLocation, routeTarget }) {
  const [comparison, setComparison] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const navigate = useNavigate();
  const mapCenter = center || (location.toLowerCase().includes('mira') ? [19.28, 72.86] : undefined);
  const mapZoom = zoom || (mapCenter ? 12 : undefined);
  const recommendations = useMemo(() => [...hospitals]
    .sort((first, second) => {
      const firstDistance = Number.isFinite(Number(first.distance_km)) ? Number(first.distance_km) : Number.POSITIVE_INFINITY;
      const secondDistance = Number.isFinite(Number(second.distance_km)) ? Number(second.distance_km) : Number.POSITIVE_INFINITY;
      return firstDistance - secondDistance || (second.accepted_insurers || []).length - (first.accepted_insurers || []).length;
    })
    .slice(0, 3), [hospitals]);

  function toggleComparison(hospital) {
    setComparison((current) => current.some((item) => item.id === hospital.id)
      ? current.filter((item) => item.id !== hospital.id)
      : current.length < 3 ? [...current, hospital] : current);
  }

  function viewRecommendation(hospital) {
    if (onSelect) {
      onSelect(hospital);
      return;
    }
    const contextQuery = resultType === 'scheme'
      ? 'scheme=PMJAY'
      : `insurer=${encodeURIComponent(title)}`;
    navigate(`/${resultType}/hospital/${hospital.id}?${contextQuery}&location=${encodeURIComponent(location)}`);
  }

  const content = (
    <>
      <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">
        <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Please verify current network/empanelment status with the hospital before admission.</p>
      </div>
      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-700"><MapPinned className="h-4 w-4" /> {hospitals.length} hospitals found</p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Hospitals for {title} in {location}</h1>
      </div>
      {recommendations.length > 0 && (
        <section className="mb-8 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white p-5">
          <p className="text-sm font-semibold text-teal-800">🤖 Kiwi&apos;s Recommendation</p>
          <p className="mt-1 text-sm text-slate-600">Based on your location and insurance, here are your top picks.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recommendations.map((hospital) => (
              <div key={hospital.id} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-900">{hospital.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {Number.isFinite(Number(hospital.distance_km)) ? `${hospital.distance_km} km away` : 'Distance unavailable'}, accepts {(hospital.accepted_insurers || []).length} insurers
                </p>
                <button type="button" onClick={() => viewRecommendation(hospital)} className="mt-3 text-sm font-semibold text-teal-700 hover:underline">View</button>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="relative mb-8 h-[400px] w-full">
        <motion.div
          className="pointer-events-none absolute inset-1 rounded-3xl bg-gradient-to-r from-teal-400 to-blue-500 opacity-70 blur-xl"
          animate={{ opacity: [0.45, 0.75, 0.45], scale: [0.99, 1.01, 0.99] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <div className="relative z-10 h-full w-full rounded-3xl bg-white p-1">
          <HospitalMap hospitals={hospitals} resultType={resultType} onSelect={onSelect} onDirections={onDirections} center={mapCenter} zoom={mapZoom} userLocation={userLocation} routeTarget={routeTarget} />
        </div>
      </section>
      <section>
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Hospitals Found ({hospitals.length})
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} resultType={resultType} contextValue={title} location={location} onSelect={onSelect} onDirections={onDirections} isCompared={comparison.some((item) => item.id === hospital.id)} onToggleCompare={toggleComparison} />)}
        </div>
      </section>
      {comparison.length > 0 && (
        <button type="button" onClick={() => setIsCompareOpen(true)} className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white shadow-xl transition hover:bg-teal-800">
          <Scale className="h-4 w-4" /> Compare ({comparison.length})
        </button>
      )}
      {isCompareOpen && <CompareModal hospitals={comparison} onRemove={(id) => setComparison((current) => current.filter((hospital) => hospital.id !== id))} onClose={() => setIsCompareOpen(false)} />}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="SwasthSetu Logo" className="h-14 w-auto object-contain" />
            <span className="text-2xl font-bold text-teal-800">SwasthSetu</span>
          </Link>
          <Link to={`/${resultType}/select`} className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-teal-700">
            <ArrowLeft className="h-4 w-4" /> Change search
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">{content}</div>
    </main>
  );
}
