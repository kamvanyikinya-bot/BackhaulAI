import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { mockReturnLoads } from '../lib/mockData';
import { discovery as discoveryApi } from '../lib/api';
import { Route, MapPin, DollarSign, CheckCircle, TrendingDown, Star, ArrowRight, Truck, Zap, Info, Calendar, Weight } from 'lucide-react';

interface ReturnLoad {
  id: string; title: string; from: string; to: string; distance: number; weight: number;
  revenue: number; matchScore: number; reason: string; pickupDate: string;
}

export function ReturnTripFinder() {
  const [destination, setDestination] = useState('Durban');
  const [truckType, setTruckType] = useState('flatbed');
  const [accepted, setAccepted] = useState<string[]>([]);
  const [returnLoads, setReturnLoads] = useState<ReturnLoad[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const forwardRevenue = 22000;

  useEffect(() => {
    (async () => {
      setLoading(true); setApiError('');
      const { data, error } = await discoveryApi.matchReturn({ origin: 'Johannesburg', destination, truckType });
      if (data) setReturnLoads(data as ReturnLoad[]);
      else if (error) setApiError(error);
      setLoading(false);
    })();
  }, [destination, truckType]);

  const loads = returnLoads.length > 0 ? returnLoads : mockReturnLoads;
  const totalReturnRevenue = accepted.reduce((s, id) => s + (loads.find(l => l.id === id)?.revenue || 0), 0);
  const bestMatch = loads[0];

  const handleAccept = (id: string) => setAccepted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return <div className="space-y-6">
    <div className="flex items-center gap-2 mb-1">
      <Route className="w-6 h-6 text-blue-600" />
      <h1 className="text-2xl font-bold text-gray-900">Return Trip Finder</h1>
      <Badge status="available" className="bg-orange-100 text-orange-700 text-xs">💰 Core Feature</Badge>
    </div>
    <p className="text-gray-500">Find profitable return loads before you depart — never drive empty again.</p>

    {apiError && <div className="bg-yellow-50 text-yellow-700 text-sm rounded-lg px-4 py-2">Using sample data — {apiError}</div>}
    {loading && <div className="text-center text-sm text-gray-400 py-2">Finding return loads...</div>}

    <Card><CardContent className="p-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div><label className="text-xs font-semibold text-gray-500 uppercase">Current Location</label><p className="text-lg font-bold text-gray-900 mt-1">Johannesburg</p></div>
        <div><label className="text-xs font-semibold text-gray-500 uppercase">Delivering To</label>
          <input className="text-lg font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full mt-1" value={destination} onChange={e => setDestination(e.target.value)} />
        </div>
        <div><label className="text-xs font-semibold text-gray-500 uppercase">Truck Type</label>
          <div className="flex gap-2 mt-1.5">{['flatbed', 'refrigerated', 'tautliner'].map(t => <button key={t} onClick={() => setTruckType(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${truckType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div>
        </div>
      </div>
    </CardContent></Card>

    <Card className="border-2 border-green-400 profit-glow"><CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-6 h-6 text-green-600" /><h2 className="text-lg font-bold text-gray-900">Profit Impact</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <div><p className="text-xs text-gray-500">Forward Only</p><p className="text-xl font-bold text-gray-400">{formatCurrency(forwardRevenue)}</p></div>
            <div><p className="text-xs text-gray-500">+ Return Load</p><p className="text-xl font-bold text-green-600">+{formatCurrency(totalReturnRevenue || bestMatch?.revenue || 0)}</p></div>
            <div><p className="text-xs text-gray-500">Total Trip</p><p className="text-xl font-bold text-gray-900">{formatCurrency(forwardRevenue + (totalReturnRevenue || bestMatch?.revenue || 0))}</p></div>
            <div><p className="text-xs text-gray-500">Empty Miles</p><p className="text-xl font-bold text-green-600">{accepted.length > 0 ? '0% 🎉' : '100%'}</p></div>
          </div>
        </div>
        <div className="hidden sm:block bg-green-50 rounded-xl p-3 text-center min-w-[100px]"><TrendingDown className="w-6 h-6 text-green-600 mx-auto" /><p className="text-2xl font-bold text-green-600 mt-1">{Math.round((totalReturnRevenue || bestMatch?.revenue || 0) / forwardRevenue * 100)}%</p><p className="text-xs text-green-600 font-medium">extra profit</p></div>
      </div>
    </CardContent></Card>

    <h2 className="text-lg font-semibold text-gray-900">Available Return Loads from {destination}</h2>
    <div className="space-y-4">
      {loads.map((load, index) => {
        const isAccepted = accepted.includes(load.id);
        return <Card key={load.id} className={`border-2 transition-all ${isAccepted ? 'border-green-400 bg-green-50/50' : index === 0 ? 'border-blue-300' : 'border-gray-200 hover:border-blue-200'}`}><CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${load.matchScore >= 90 ? 'bg-green-100' : load.matchScore >= 75 ? 'bg-yellow-100' : 'bg-gray-100'}`}><Route className={`w-4 h-4 ${load.matchScore >= 90 ? 'text-green-600' : load.matchScore >= 75 ? 'text-yellow-600' : 'text-gray-600'}`} /></div>
                <h3 className="font-semibold text-gray-900">{load.title}</h3>
                <Badge status={`${load.matchScore}%`} className={`${load.matchScore >= 90 ? 'bg-green-100 text-green-700' : load.matchScore >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{load.matchScore}% Match</Badge>
                {index === 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Best Match</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
                <span className="flex items-center gap-1 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {load.from}</span>
                <span className="flex items-center gap-1 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {load.to}</span>
                <span className="flex items-center gap-1 text-gray-600"><Weight className="w-4 h-4 text-gray-400" /> {load.weight.toLocaleString()} kg</span>
                <span className="flex items-center gap-1 text-gray-600"><Calendar className="w-4 h-4 text-gray-400" /> {load.pickupDate}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2"><Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" /><span>{load.reason}</span></div>
            </div>
            <div className="ml-4 text-right flex-shrink-0">
              <p className="text-xs text-gray-500">Return revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(load.revenue)}</p>
              <p className="text-xs text-gray-400">{load.distance} km</p>
              <Button size="sm" className={`mt-3 w-full min-w-[120px] ${isAccepted ? 'bg-green-600 hover:bg-green-700' : ''}`} variant={isAccepted ? 'primary' : 'outline'} onClick={() => handleAccept(load.id)} leftIcon={isAccepted ? <CheckCircle className="w-4 h-4" /> : undefined}>{isAccepted ? 'Accepted' : 'Accept Load'}</Button>
            </div>
          </div>
        </CardContent></Card>;
      })}
    </div>

    {accepted.length > 0 && <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white"><CardContent className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-200" /><div><p className="font-semibold text-lg">{accepted.length} return load{accepted.length > 1 ? 's' : ''} secured!</p><p className="text-sm text-green-200">Total round trip: {formatCurrency(forwardRevenue + accepted.reduce((s, id) => s + loads.find(l => l.id === id)!.revenue, 0))} · 0% empty miles</p></div></div>
      <Button className="bg-white text-green-700 hover:bg-green-50">Start Trip <ArrowRight className="w-4 h-4 ml-1" /></Button>
    </CardContent></Card>}

    <Link to="/ai-discover"><Card className="border border-dashed border-blue-300 hover:bg-blue-50/50 cursor-pointer"><CardContent className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-blue-600" /></div><div><p className="font-semibold text-gray-900">Let AI find opportunities for you</p><p className="text-sm text-gray-500">Discover profitable routes and return loads automatically</p></div></div>
      <ArrowRight className="w-5 h-5 text-gray-400" />
    </CardContent></Card></Link>
  </div>;
}