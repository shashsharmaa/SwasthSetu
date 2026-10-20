import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold text-white shadow-lg shadow-teal-600/20">S</div>
      <span className="text-xl font-bold tracking-tight">Swasth<span className="text-teal-600">Setu</span></span>
    </div>
  );
}

export default function SchemeSelect() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!location.trim()) {
      setError('Please enter a city, area, or pincode.');
      return;
    }
    setError('');
    navigate(`/scheme/results?scheme=PMJAY&location=${encodeURIComponent(location.trim())}`);
  }

  return (
    <main className="min-h-screen bg-white px-5 py-7 text-black sm:px-8">
      <header className="mx-auto max-w-6xl">
        <Logo />
      </header>
      <section className="mx-auto flex max-w-6xl justify-center py-16 sm:py-24">
        <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-teal-600">GOVERNMENT SCHEME</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find Hospitals by Government Scheme</h1>
            <p className="mt-3 text-gray-500">Choose your scheme and tell us where you need care.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Government Scheme</span>
              <select value="Ayushman Bharat PM-JAY" disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none">
                <option>Ayushman Bharat PM-JAY</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Location</span>
              <span className="relative block">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter City, Area, or Pincode" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
              </span>
              {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
            </label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2">
              <Search className="h-5 w-5" /> Search Hospitals
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
