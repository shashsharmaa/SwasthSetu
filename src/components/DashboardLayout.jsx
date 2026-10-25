import { ArrowLeft, CheckCircle2, FileText, Home, Info, LocateFixed, LogIn, LogOut, Map, MapPin, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ResultsLayout from './ResultsLayout';
import AboutSection from './AboutSection';
import KiwiChatbot from './KiwiChatbot';
import ProfileModal from './ProfileModal';
import SosButton from './SosButton';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../context/AuthContext';
import { Dock, DockIcon, DockItem } from './ui/dock';

const insurers = ['Star Health', 'HDFC ERGO', 'TATA AIG'];

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <img src="/logo.png" alt="SwasthSetu Logo" className="h-14 w-auto object-contain" />
      <span className="text-2xl font-bold text-teal-800">SwasthSetu</span>
    </Link>
  );
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function DashboardLayout({ type, userName }) {
  const isScheme = type === 'scheme';
  const [insurer, setInsurer] = useState(insurers[0]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [routeTarget, setRouteTarget] = useState(null);
  const [sosHospitals, setSosHospitals] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  useEffect(() => {
    const initialLocation = searchParams.get('location');
    if (initialLocation) setLocation(initialLocation);
  }, [searchParams]);

  const title = isScheme ? 'Ayushman Bharat PM-JAY' : insurer;
  const mapCenter = location.toLowerCase().includes('mira') || location.includes('401')
    ? [19.28, 72.86]
    : [19.076, 72.8777];
  const mapZoom = location ? 11 : 10;

  async function handleAuth() {
    if (user) {
      await logout();
    } else {
      navigate('/login');
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) return Promise.resolve(null);
    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coordinates);
          setIsLocating(false);
          resolve(coordinates);
        },
        () => {
          setIsLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      );
    });
  }

  async function fetchHospitals(distance = maxDistance, coordinates = userLocation) {
    const params = new URLSearchParams({ location: location.trim() });
    if (isScheme) {
      params.set('scheme', 'PM-JAY');
    } else {
      params.set('insurer', insurer);
    }
    if (coordinates) {
      params.set('user_lat', String(coordinates.lat));
      params.set('user_lng', String(coordinates.lng));
    }
    if (distance) params.set('max_distance', distance);

    try {
      const response = await fetch(`http://localhost:5000/api/hospitals/search?${params.toString()}`);
      if (!response.ok) {
        const responseBody = await response.json().catch(() => ({}));
        throw new Error(responseBody.error || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setHospitals(Array.isArray(data) ? data : []);
      setSearched(true);
      requestAnimationFrame(() => scrollToSection('results-section'));
    } catch (searchError) {
      setError(`Unable to search hospitals: ${searchError.message}`);
      setHospitals([]);
      setSearched(true);
      requestAnimationFrame(() => scrollToSection('results-section'));
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!location.trim()) {
      setError('Please enter a city, area, or pincode.');
      return;
    }
    setError('');
    setSelectedHospital(null);
    setRouteTarget(null);
    const coordinates = await getCurrentLocation();
    await fetchHospitals(maxDistance, coordinates);
  }

  async function handleDistanceChange(distance) {
    setMaxDistance(distance);
    if (!location.trim() || !searched) return;
    const coordinates = userLocation || await getCurrentLocation();
    await fetchHospitals(distance, coordinates);
  }

  function clearSearch() {
    setLocation('');
    setHospitals([]);
    setSearched(false);
    setError('');
    setMaxDistance('');
    setUserLocation(null);
    setSelectedHospital(null);
    setRouteTarget(null);
  }

  function handleSelectHospital(hospital) {
    setSelectedHospital(hospital);
    requestAnimationFrame(() => scrollToSection('details-section'));
  }

  function handleSosHospitalsFound(nearestHospitals, coordinates) {
    setSosHospitals(nearestHospitals);
    setUserLocation(coordinates);
    requestAnimationFrame(() => scrollToSection('results-section'));
  }

  function handleViewSavedHospital(hospital) {
    setIsProfileOpen(false);
    setLocation(hospital.city || hospital.pincode || '');
    setHospitals((current) => current.some((item) => item.id === hospital.id) ? current : [...current, hospital]);
    setSearched(true);
    requestAnimationFrame(() => scrollToSection('results-section'));
  }

  async function handleDirections(hospital) {
    if (!Number.isFinite(Number(hospital.lat)) || !Number.isFinite(Number(hospital.lng))) {
      setError('Directions are unavailable because this hospital has no map coordinates.');
      return;
    }
    const coordinates = userLocation || await getCurrentLocation();
    if (!coordinates) {
      setError('Allow location access to get directions from your current location.');
      return;
    }
    setError('');
    setRouteTarget({
      hospital: { lat: Number(hospital.lat), lng: Number(hospital.lng) },
      user: coordinates,
    });
    requestAnimationFrame(() => scrollToSection('results-section'));
  }

  const dockItems = [
    { label: 'Home', id: 'home-section', icon: <Home className="h-5 w-5" /> },
    { label: 'Map & Results', id: 'results-section', icon: <Map className="h-5 w-5" /> },
    { label: 'Hospital Details', id: 'details-section', icon: <FileText className="h-5 w-5" /> },
    { label: 'About Us', id: 'about-section', icon: <Info className="h-5 w-5" /> },
  ];

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-4 z-50 mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-8">
        <div className="min-w-0 flex-1">
          <Logo />
        </div>
        <Dock className="shrink-0">
          {dockItems.map((item) => (
            <DockItem key={item.id} label={item.label} onClick={() => scrollToSection(item.id)}>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          ))}
        </Dock>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {user && <span className="hidden px-2 text-sm font-semibold text-teal-700 lg:inline">Hello, {userName}</span>}
          <button type="button" onClick={() => setIsProfileOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
          </button>
          <button type="button" onClick={handleAuth} className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">
            {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />} {user ? 'Logout' : 'Login'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="hidden items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 sm:inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </header>

      <section id="home-section" className="relative w-full scroll-mt-24 px-4 py-6 md:px-8">
        {user && <h2 className="relative z-10 mt-4 text-center text-3xl font-bold text-teal-700 sm:text-left">Hello, {userName}</h2>}
        <div className="w-full text-center">
          <DashboardHeader type={type} totalHospitals={hospitals.length} hasSearched={searched} />
          <div className="mx-auto mt-5 flex w-fit rounded-full border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Search pathway">
            <button type="button" onClick={() => navigate(`/insurance/dashboard${location.trim() ? `?location=${encodeURIComponent(location.trim())}` : ''}`)} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${!isScheme ? 'text-teal-800' : 'text-slate-500 hover:text-teal-700'}`}>
              {!isScheme && <motion.span layoutId="active-pathway" className="absolute inset-0 -z-0 rounded-full bg-teal-100" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span className="relative z-10">🏥 Private Insurance</span>
            </button>
            <button type="button" onClick={() => navigate(`/scheme/dashboard${location.trim() ? `?location=${encodeURIComponent(location.trim())}` : ''}`)} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${isScheme ? 'text-green-800' : 'text-slate-500 hover:text-green-700'}`}>
              {isScheme && <motion.span layoutId="active-pathway" className="absolute inset-0 -z-0 rounded-full bg-green-100" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span className="relative z-10">🛡️ Government Scheme</span>
            </button>
          </div>
          <form onSubmit={handleSearch} className="mt-10 flex w-full flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:flex-row sm:items-end">
            {!isScheme && (
              <label className="flex-1">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Select Insurance Provider</span>
                <select value={insurer} onChange={(event) => setInsurer(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white text-black px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10">
                  {insurers.map((option) => <option className="bg-white text-black" key={option} value={option}>{option}</option>)}
                </select>
              </label>
            )}
            {isScheme && (
              <div className="flex-1">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Select Scheme</span>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-black">Ayushman Bharat PM-JAY</div>
              </div>
            )}
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Location</span>
              <span className="relative block">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-600" />
                <input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, area, district, or pincode" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
              </span>
            </label>
            <button type="submit" className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg ${isScheme ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
              <Search className="h-5 w-5" /> {isLocating ? 'Locating...' : 'Search Hospitals'}
            </button>
            <button type="button" onClick={clearSearch} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700">Clear All</button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2 text-sm">
            <span className="mr-1 flex items-center gap-1 font-semibold text-slate-600"><LocateFixed className="h-4 w-4 text-teal-600" /> Distance:</span>
            {[['', 'All'], ['5', 'Within 5 km'], ['10', 'Within 10 km'], ['20', 'Within 20 km']].map(([value, label]) => (
              <button key={value || 'all'} type="button" onClick={() => handleDistanceChange(value)} className={`rounded-full px-4 py-2 font-medium transition ${maxDistance === value ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'}`}>
              {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="results-section" className="scroll-mt-24 border-y border-gray-100 bg-gray-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <ResultsLayout title={title} location={location || 'Mumbai'} hospitals={searched ? hospitals : []} resultType={type} embedded onSelect={handleSelectHospital} onDirections={handleDirections} center={mapCenter} zoom={mapZoom} userLocation={userLocation} routeTarget={routeTarget} highlightedHospitals={sosHospitals} />
        </div>
      </section>

      <section id="details-section" className="scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {!selectedHospital ? <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm"><Info className="mx-auto h-10 w-10 text-teal-600" /><p className="mx-auto mt-4 max-w-md text-gray-600">Select a hospital from the results above to view its details and verification guidelines.</p></div> : <DashboardHospitalDetails hospital={selectedHospital} isScheme={isScheme} context={title} />}
        </div>
      </section>

      <section id="about-section" className="scroll-mt-24 bg-teal-50 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Our story</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About SwasthSetu</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">A smart, scalable, and inclusive platform for healthcare empowerment.</p>
          </div>
          <AboutSection />
        </div>
      </section>
      <KiwiChatbot />
      <SosButton insurer={isScheme ? '' : insurer} scheme={isScheme ? 'PM-JAY' : ''} onHospitalsFound={handleSosHospitalsFound} />
      {isProfileOpen && <ProfileModal userName={userName} onClose={() => setIsProfileOpen(false)} onViewMap={handleViewSavedHospital} />}
    </main>
  );
}

function DashboardHospitalDetails({ hospital, isScheme, context }) {
  const isVerified = isScheme ? hospital.is_pmjay_empanelled : true;
  const status = isScheme ? 'PM-JAY Empanelled' : 'Network Hospital';
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
      <p className="mt-6 text-sm text-gray-700"><span className="font-semibold">Accepted Insurances:</span> {(hospital.accepted_insurers || []).join(', ') || 'Not listed'}</p>
      <h3 className="mt-8 text-xl font-bold text-gray-900">Before You Visit</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{['Carry your insurance/scheme card and ID proof.', "Confirm the hospital's current network/empanelment status.", 'Ask if the required treatment/speciality is available.', 'Confirm if pre-authorization is required for your treatment.', 'Verify cashless treatment availability (if applicable).'].map((item) => <li key={item} className="flex gap-2 text-sm text-gray-700"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />{item}</li>)}</ul>
      <p className="mt-6 text-xs text-gray-500">Last Verified: {hospital.lastVerified} | Source: Official Hospital Directory (Mock)</p>
    </article>
  );
}
