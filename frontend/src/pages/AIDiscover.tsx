import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { mockOpportunities } from '../lib/mockData';
import { discovery as discoveryApi } from '../lib/api';
import { Zap, TrendingUp, DollarSign, Route, MapPin, Star, ArrowRight, Truck, Sparkles, Target } from 'lucide-react';

type FilterType = 'all' | 'return_trip' | 'load_to_haul' | 'profitable_corridor';

export function AIDiscover() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await discoveryApi.getStats();
      if (data?.opportunities) setOpportunities(data.opportunities);
      else if (error) setApiError(error);
      setLoading(false);
    })();
  }, []);

  const items = opportunities.length > 0 ? opportunities : mockOpportunities;
  const filtered = filter === 'all' ? items : items.filter((o: any) => o.type === filter);
  const totalProfit = items.filter((o: any) => o.matchQuality >= 80).reduce((s: number, o: any) => s + o.expectedProfit, 0);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'return_trip', label: '💰 Return Trips' },
    { key: 'load_to_haul', label: '🚚 Loads to Haul' },
    { key: 'profitable_corridor', label: '📈 Corridors' },
  ];

  return <div className="space-y-6">
    <div className="flex items-center gap-2 mb-1"><Sparkles className="w-6 h-6 text-purple-600" /><h1 className="text-2xl font-bold text-gray-900">AI Discover</h1><Badge status="available" className="bg-purple-100 text-purple-700 text-xs">🤖 AI Powered</Badge></div>
    <p className="text-gray-500">Smart opportunities found for your fleet.</p>

    {loading && <div className="text-center text-sm text-gray-400 py-2">Analysing opportunities...</div>}
    {apiError && <div className="bg-yellow-50 text-yellow-700 text-sm rounded-lg px-4 py-2">Using sample data — {apiError}</div>}

    <Card className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white"><CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Target className="w-5 h-5 text-purple-200" /><p className="text-sm font-medium text-purple-200">AI Analysis Complete</p></div>
          <h2 className="text-2xl font-bold mt-1">{formatCurrency(totalProfit)} in potential earnings</h2>
          <p className="text-purple-200 text-sm mt-1">Based on your fleet profile and market demand</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3"><Zap className="w-5 h-5" /><div className="text-right"><p className="text-xs text-purple-200">Match Score</p><p className="text-xl font-bold">92%</p></div></div>
      </div>
    </CardContent></Card>

    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map(f => <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.label}</button>)}
    </div>

    <div className="space-y-4">
      {filtered.map((opp: any, i: number) => <Card key={opp.id || i} className={`hover:shadow-md transition-all border-l-4 ${opp.type === 'return_trip' ? 'border-l-green-500' : opp.type === 'profitable_corridor' ? 'border-l-blue-500' : 'border-l-purple-500'}`}><CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opp.type === 'return_trip' ? 'bg-green-100' : opp.type === 'profitable_corridor' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                {opp.type === 'return_trip' ? <Route className="w-4 h-4 text-green-600" /> : opp.type === 'profitable_corridor' ? <TrendingUp className="w-4 h-4 text-blue-600" /> : <Truck className="w-4 h-4 text-purple-600" />}
              </div>
              <h3 className="font-semibold text-gray-900">{opp.title}</h3>
              <div className="flex items-center gap-1 ml-auto">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(opp.matchQuality / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}<span className="text-xs text-gray-500 ml-1">{opp.matchQuality}%</span></div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{opp.description}</p>
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.route}</p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2"><Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" /><span>{opp.reason}</span></div>
          </div>
          <div className="ml-4 text-right flex-shrink-0">
            <p className="text-xs text-gray-500">Expected profit</p>
            <p className={`text-2xl font-bold ${opp.expectedProfit >= 30000 ? 'text-green-600' : 'text-blue-600'}`}>{formatCurrency(opp.expectedProfit)}</p>
            <Button size="sm" className="mt-3 w-full min-w-[120px]">{opp.action || 'View'} <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      </CardContent></Card>)}
    </div>
  </div>;
}