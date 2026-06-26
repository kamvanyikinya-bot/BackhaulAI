import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Truck, CheckCircle, ArrowRight, Sparkles, Building2, Users, Route, Phone } from 'lucide-react';

interface WaitlistEntry {
  id: string; companyName: string; email: string; phone: string;
  fleetSize: string; routes: string; createdAt: string;
}

export function WaitlistPage() {
  const [form, setForm] = useState({ companyName: '', email: '', phone: '', fleetSize: '1', routes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

  useEffect(() => {
    try { const saved = localStorage.getItem('backhaulai_waitlist'); if (saved) setEntries(JSON.parse(saved)); } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WaitlistEntry = {
      id: Date.now().toString(36), ...form, createdAt: new Date().toISOString(),
    };
    const updated = [...entries, entry];
    setEntries(updated);
    localStorage.setItem('backhaulai_waitlist', JSON.stringify(updated));
    setSubmitted(true);
  };

  return <div className="space-y-6 max-w-3xl mx-auto">
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-blue-600" /></div>
      <h1 className="text-3xl font-bold text-gray-900">Get Early Access</h1>
      <p className="text-gray-500 mt-2 max-w-lg mx-auto">BackhaulAI is launching soon. Join the waitlist for early access and exclusive launch pricing.</p>
    </div>

    {submitted ? (
      <Card className="border-2 border-green-400 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You're on the list!</h2>
          <p className="text-gray-500">We'll notify you when BackhaulAI launches. Expect early access within 2-4 weeks.</p>
          <p className="text-xs text-gray-400 mt-4">You're #{entries.length} on the waitlist</p>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="tel" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fleet Size</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.fleetSize} onChange={e => setForm({ ...form, fleetSize: e.target.value })}>
                  {[1,2,3,4,5,6,7,8,9,10,15,20,30,50,100].map(n => <option key={n} value={n}>{n} {n === 1 ? 'truck' : 'trucks'}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Routes (optional)</label>
              <div className="relative"><Route className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input placeholder="e.g. JHB↔DBN, JHB↔CPT" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm" value={form.routes} onChange={e => setForm({ ...form, routes: e.target.value })} /></div>
            </div>
            <Button type="submit" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>Join Waitlist</Button>
          </form>
        </CardContent>
      </Card>
    )}

    {/* Contact Sales */}
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
          <div><p className="font-semibold text-gray-900">Need a custom plan?</p><p className="text-sm text-gray-500">Contact our sales team for enterprise requirements</p></div>
        </div>
        <Button variant="outline" size="sm">Contact Sales <ArrowRight className="w-4 h-4 ml-1" /></Button>
      </CardContent>
    </Card>
  </div>;
}