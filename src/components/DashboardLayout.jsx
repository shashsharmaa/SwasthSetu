import { ArrowLeft, CheckCircle2, Info, LogIn, LogOut, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ResultsLayout from './ResultsLayout';
import { mockHospitals } from '../data/mockHospitals';
import { useAuth } from '../context/AuthContext';

const insurers = ['Star Health', 'TATA AIG Health', 'HDFC ERGO Health'];

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-teal-700">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-lg text-white">S</span>
      Swasth<span className="text-teal-600">Setu</span>
    </Link>
  );
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function DashboardLayout({ type, userName }) {
  const isScheme = type === 'scheme';
  const [menuOpen, setMenuOpen] = useState(false);
  const [insurer, setInsurer] = useState(insurers[0]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const title = isScheme ? 'Ayushman Bharat PM-JAY' : insurer;
  const displayHospitals = isScheme
    ? mockHospitals.map((hospital) => ({ ...hospital, networkStatus: hospital.networkStatus === 'Unknown' ? 'Unknown' : 'Empanelled' }))
    : mockHospitals;
  const mapCenter = location.toLowerCase().includes('mira') || location.includes('401')
    ? [19.288, 72.865]
    : [19.076, 72.8777];
  const mapZoom = location ? 11 : 10;

  async function handleAuth() {
    if (user) {
      await logout();
    } else {
      navigate('/login');
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    if (!location.trim()) {
      setError('Please enter a city, area, or pincode.');
      return;
    }
    setError('');
    setSearched(true);
    setSelectedHospital(null);
    requestAnimationFrame(() => scrollToSection('results-section'));
  }

  function handleSelectHospital(hospital) {
    setSelectedHospital(hospital);
    requestAnimationFrame(() => scrollToSection('details-section'));
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3 sm:px-8">
          <Logo />
          <button type="button" className="ml-auto rounded-lg p-2 text-gray-600 md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-1 border-b border-gray-100 bg-white p-4 md:static md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:justify-center md:border-0 md:p-0`}>
            {[
              ['Home', 'home-section'],
              ['Map & Results', 'results-section'],
              ['Hospital Details', 'details-section'],
              ['About Us', 'about-section'],
            ].map(([label, id]) => (
              <button key={id} type="button" onClick={() => { scrollToSection(id); setMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 transition-all duration-300 hover:scale-105 hover:text-teal-700 active:scale-95 hover:shadow-lg md:text-center">
                {label}
              </button>
            ))}
          </div>
          <div className={`${menuOpen ? 'flex' : 'hidden'} absolute right-4 top-[calc(100%+190px)] gap-2 bg-white md:static md:flex`}>
            <button type="button" onClick={handleAuth} className="inline-flex items-center gap-1.5 rounded-full border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg">
              {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />} {user ? 'Logout' : 'Login'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="hidden items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg sm:inline-flex">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>
        </div>
      </nav>

      <section id="home-section" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28">
        {user && <h2 className="absolute left-5 top-8 text-3xl font-bold text-teal-700 sm:left-8 lg:top-12">Hello, {userName}</h2>}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">{isScheme ? 'Government scheme' : 'Private insurance'}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Find hospitals that work for you</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">Search trusted hospitals by {isScheme ? 'government scheme' : 'insurance provider'} and location.</p>
          <form onSubmit={handleSearch} className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 text-left shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:flex-row sm:items-end">
            {!isScheme && (
              <label className="flex-1">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Insurance provider</span>
                <select value={insurer} onChange={(event) => setInsurer(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white text-black px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10">
                  {insurers.map((option) => <option className="bg-white text-black" key={option}>{option}</option>)}
                </select>
              </label>
            )}
            {isScheme && (
              <div className="flex-1">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Government Scheme</span>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-black">Ayushman Bharat PM-JAY</div>
              </div>
            )}
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Location</span>
              <input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, area, or pincode" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg">
              <Search className="h-5 w-5" /> Search
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </section>

      <section id="results-section" className="scroll-mt-24 border-y border-gray-100 bg-gray-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <ResultsLayout title={title} location={location || 'Mumbai'} hospitals={searched ? displayHospitals : []} resultType={type} embedded onSelect={handleSelectHospital} center={mapCenter} zoom={mapZoom} />
        </div>
      </section>

      <section id="details-section" className="scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {!selectedHospital ? <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm"><Info className="mx-auto h-10 w-10 text-teal-600" /><p className="mx-auto mt-4 max-w-md text-gray-600">Select a hospital from the results above to view its details and verification guidelines.</p></div> : <DashboardHospitalDetails hospital={selectedHospital} isScheme={isScheme} context={title} />}
        </div>
      </section>

      <section id="about-section" className="scroll-mt-24 bg-teal-50 px-5 py-24 text-center sm:px-8">
        <h2 className="text-3xl font-bold text-gray-900">About SwasthSetu - Coming Soon</h2>
      </section>
    </main>
  );
}

function DashboardHospitalDetails({ hospital, isScheme, context }) {
  const isVerified = hospital.networkStatus === 'In-Network' || hospital.networkStatus === 'Empanelled';
  const status = isScheme && hospital.networkStatus !== 'Unknown' ? 'Empanelled' : hospital.networkStatus;
  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Hospital details</p>
      <h2 className="mt-2 text-3xl font-bold text-gray-900">{hospital.name}</h2>
      <p className="mt-3 text-gray-600">{hospital.address}, {hospital.city} - {hospital.pincode}</p>
      <p className="mt-2 font-medium text-teal-700">{hospital.phone}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-4"><p className="text-sm text-gray-500">{isScheme ? 'Empanelment Status' : 'Network Status'}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>{status}</span></div>
        <div className="rounded-2xl bg-teal-50 p-4"><p className="text-sm text-teal-800">Searching under</p><p className="mt-2 font-semibold text-teal-900">{context}</p></div>
      </div>
      <h3 className="mt-8 text-xl font-bold text-gray-900">Before You Visit</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{['Carry your insurance/scheme card and ID proof.', "Confirm the hospital's current network/empanelment status.", 'Ask if the required treatment/speciality is available.', 'Confirm if pre-authorization is required for your treatment.', 'Verify cashless treatment availability (if applicable).'].map((item) => <li key={item} className="flex gap-2 text-sm text-gray-700"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />{item}</li>)}</ul>
      <p className="mt-6 text-xs text-gray-500">Last Verified: {hospital.lastVerified} | Source: Official Hospital Directory (Mock)</p>
    </article>
  );
}
