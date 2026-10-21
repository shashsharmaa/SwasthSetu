import { AlertTriangle, ArrowLeft, MapPinned } from 'lucide-react';
import { Link } from 'react-router-dom';
import HospitalCard from './HospitalCard';
import HospitalMap from './HospitalMap';

export default function ResultsLayout({ title, location, hospitals, resultType, embedded = false, onSelect, center, zoom }) {
  const mapCenter = center || (location.toLowerCase().includes('mira') ? [19.28, 72.86] : undefined);
  const mapZoom = zoom || (mapCenter ? 12 : undefined);
  const content = (
    <>
      <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">
        <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Please verify current network/empanelment status with the hospital before admission.</p>
      </div>
      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-700"><MapPinned className="h-4 w-4" /> {hospitals.length} hospitals found</p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Hospitals for {title} in {location}</h1>
      </div>
      <section className="mb-8 h-[400px] w-full">
        <HospitalMap hospitals={hospitals} resultType={resultType} onSelect={onSelect} center={mapCenter} zoom={mapZoom} />
      </section>
      <section>
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Hospitals Found ({hospitals.length})
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} resultType={resultType} contextValue={title} location={location} onSelect={onSelect} />)}
        </div>
      </section>
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white shadow-lg shadow-teal-600/20">S</div>
            <span className="text-lg font-bold tracking-tight">Swasth<span className="text-teal-600">Setu</span></span>
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
