import { AuthForm } from '../components/ui/premium-auth';
import { useLocation } from 'react-router-dom';

export default function LoginPage() {
  const { pathname } = useLocation();
  const destination = pathname.startsWith('/scheme/') ? '/scheme/dashboard' : '/insurance/dashboard';

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 text-black">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold text-white shadow-lg shadow-teal-600/20">S</div>
          <p className="mt-3 text-xl font-bold tracking-tight">Swasth<span className="text-teal-600">Setu</span></p>
          <p className="mt-1 text-sm text-gray-500">Your bridge to better healthcare</p>
        </div>
        <AuthForm destination={destination} />
      </div>
    </main>
  );
}
