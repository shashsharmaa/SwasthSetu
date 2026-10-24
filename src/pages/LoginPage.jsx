import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/ui/premium-auth';
import LoginGlobe from '../components/LoginGlobe';

export default function LoginPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const destination = pathname.startsWith('/scheme/') ? '/scheme/dashboard' : '/insurance/dashboard';

  return (
    <main className="relative flex h-screen min-h-[680px] w-full flex-col bg-white text-black md:flex-row">
      <button type="button" onClick={() => navigate('/')} className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur transition hover:bg-teal-50" aria-label="Back to landing page">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-slate-50 md:flex" aria-label="SwasthSetu 3D globe">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(204,251,241,0.65),transparent_58%)]" />
        <LoginGlobe />
        <p className="absolute bottom-8 left-10 z-20 text-sm font-medium tracking-wide text-teal-800">SwasthSetu - Bridging you to care.</p>
      </section>

      <section className="flex w-full items-center justify-center bg-white p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src="/logo.png" alt="SwasthSetu Logo" className="h-20 w-auto object-contain" />
              <span className="text-2xl font-bold text-teal-800">SwasthSetu</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Your bridge to better healthcare</p>
          </div>
          <AuthForm destination={destination} />
        </div>
      </section>
    </main>
  );
}
