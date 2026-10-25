import { CheckCircle2, ChevronLeft, ExternalLink, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { getOfficialSource, getSafeUrl } from '../lib/officialSources';

const visitChecklist = [
  'Carry your insurance/scheme card and ID proof.',
  "Confirm the hospital's current network/empanelment status.",
  'Ask if the required treatment/speciality is available.',
  'Confirm if pre-authorization is required for your treatment.',
  'Verify cashless treatment availability (if applicable).',
];

export default function HospitalDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [hospital, setHospital] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const isScheme = location.pathname.startsWith('/scheme/');
  const resultType = isScheme ? 'scheme' : 'insurance';
  const context = isScheme
    ? 'PM-JAY'
    : (searchParams.get('insurer') ? `${searchParams.get('insurer')} Insurance` : 'Private Insurance');
  const resultsQuery = isScheme
    ? `scheme=PMJAY&location=${encodeURIComponent(searchParams.get('location') || '')}`
    : `insurer=${encodeURIComponent(searchParams.get('insurer') || '')}&location=${encodeURIComponent(searchParams.get('location') || '')}`;

  useEffect(() => {
    let mounted = true;
    async function loadHospital() {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetch(`http://localhost:5000/api/hospitals/${encodeURIComponent(id)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        if (mounted) setHospital(data);
      } catch (error) {
        if (mounted) setLoadError(error.message);
      }
      if (mounted) setIsLoading(false);
    }
    loadHospital();
    return () => { mounted = false; };
  }, [id]);

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-gray-600">Loading hospital details...</main>;
  }

  if (!hospital) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <img src="/logo.png" alt="SwasthSetu Logo" className="mx-auto mb-6 h-16 w-auto object-contain" />
          <h1 className="text-3xl font-semibold text-gray-900">Hospital not found</h1>
          <p className="mt-3 text-gray-500">{loadError || 'This hospital could not be found in the hospital directory.'}</p>
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700">Back to home</Link>
        </div>
      </main>
    );
  }

  const isVerified = isScheme ? hospital.is_pmjay_empanelled : true;
  const statusLabel = isScheme ? 'PM-JAY Empanelled' : 'Network Hospital';
  const sourceUrl = getOfficialSource(hospital, searchParams.get('insurer'), resultType);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="SwasthSetu Logo" className="h-14 w-auto object-contain" />
            <span className="text-2xl font-bold text-teal-800">SwasthSetu</span>
          </Link>
          <Link to={`/${resultType}/results?${resultsQuery}`} className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition hover:text-teal-700">
            <ChevronLeft className="h-4 w-4" /> Back to Results
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm leading-6 text-teal-950 shadow-sm">
          <p className="font-bold">Important</p>
          <p>SwasthSetu is an information platform. We do not guarantee claim approval, treatment coverage, or cashless facilities. Always verify current status directly with the hospital or official authorities before admission.</p>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <a href={getSafeUrl(sourceUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              <ExternalLink className="h-4 w-4" /> Verify Current Status on Official Website
            </a>
          </div>
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            ⚠️ Information may change. Always confirm with the hospital before admission.
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Hospital details</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{hospital.name}</h1>
          <p className="mt-4 flex items-start gap-2 text-gray-600">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <span>{hospital.address}, {hospital.city} - {hospital.pincode}</span>
          </p>
          <a href={`tel:${hospital.phone}`} className="mt-3 flex items-center gap-2 font-medium text-teal-700 hover:underline">
            <Phone className="h-5 w-5" /> {hospital.phone}
          </a>

          <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">{isScheme ? 'Empanelment Status' : 'Network Status'}</p>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                {statusLabel}
              </span>
            </div>
            <div className="rounded-2xl bg-teal-50 p-5">
              <p className="text-sm font-medium text-teal-800">Searching under</p>
              <p className="mt-3 flex items-center gap-2 font-semibold text-teal-900"><ShieldCheck className="h-5 w-5 text-teal-600" /> {context}</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-gray-700"><span className="font-semibold">Accepted Insurances:</span> {(hospital.accepted_insurers || []).join(', ') || 'Not listed'}</p>
        </section>

        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">Specialities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(hospital.specialities || []).map((speciality) => <span key={speciality} className="rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">{speciality}</span>)}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">Before You Visit</h2>
          <p className="mt-2 text-sm text-gray-500">Please confirm these details before travelling to the hospital.</p>
          <ul className="mt-5 space-y-4">
            {visitChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" /> {item}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </main>
  );
}
