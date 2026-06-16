import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { auth as authApi } from '../lib/api';
import { Truck } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate(); const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('john@translogix.co.za'); const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { data, error: err } = await authApi.login(email, password);
    if (err) { setError(err); setLoading(false); return; }
    if (data) localStorage.setItem('backhaulai_token', data.token);
    await authLogin(email, password);
    navigate('/dashboard');
  };

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div><span className="font-bold text-2xl text-gray-900">BackhaulAI</span></Link>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1><p className="text-gray-500 mt-1">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link></p>
    </div>
  </div>;
}

export function SignupPage() {
  const navigate = useNavigate(); const { signup: authSignup } = useAuth();
  const [step, setStep] = useState(1); const [role, setRole] = useState(''); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { data, error: err } = await authApi.signup({ name, email, password, role });
    if (err) { setError(err); setLoading(false); return; }
    if (data) localStorage.setItem('backhaulai_token', data.token);
    await authSignup({ name, email, password, role });
    navigate('/dashboard');
  };

  const roles = [
    { v: 'company', l: 'Logistics Company', d: 'Post loads and manage your fleet' },
    { v: 'driver', l: 'Driver / Fleet Owner', d: 'Find and book return loads' },
  ];

  return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div><span className="font-bold text-2xl text-gray-900">BackhaulAI</span></Link>
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1><p className="text-gray-500 mt-1">Start in under 60 seconds</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
        {step === 1 && <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">I am a...</label>
          {roles.map(r => <button key={r.v} type="button" onClick={() => { setRole(r.v); setStep(2); }} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${role === r.v ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <p className="font-medium text-gray-900">{r.l}</p><p className="text-sm text-gray-500">{r.d}</p>
          </button>)}
        </div>}
        {step === 2 && <><div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}
          <div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-300 bg-white text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button><button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button></div>
        </>}
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link></p>
    </div>
  </div>;
}