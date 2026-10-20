import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function AuthForm({ destination = '/insurance/dashboard' }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message || 'Invalid login credentials');
      return;
    }

    navigate(destination);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/insurance/dashboard` },
    });
    if (oauthError) {
      setIsSubmitting(false);
      setError(oauthError.message || 'Unable to continue with Google');
    }
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8" aria-labelledby="auth-title">
      <div className="mb-7 text-center">
        <h1 id="auth-title" className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500">Sign in to continue your healthcare journey</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="button" disabled={isSubmitting} onClick={handleGoogleSignIn} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:opacity-60">
        <span className="text-lg font-bold text-[#4285F4]">G</span> Continue with Google
      </button>
      <div className="my-6 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" /> OR <span className="h-px flex-1 bg-gray-200" /></div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Email address</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Password</span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input required minLength={1} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-12 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </span>
        </label>
        <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">Sign In</button>
        <button type="button" onClick={() => navigate(destination)} className="w-full rounded-xl border-2 border-teal-600 py-3 font-semibold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2">Skip Login (Demo Mode)</button>
      </form>
    </section>
  );
}
