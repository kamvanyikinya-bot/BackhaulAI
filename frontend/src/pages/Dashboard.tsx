import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../lib/auth';
import { formatCurrency } from '../lib/utils';
import { mockDashboardStats } from '../lib/mockData';
import { stats as statsApi } from '../lib/api';
import { TrendingDown, DollarSign, Truck, Route, TrendingUp, BarChart3, ArrowRight, MapPin, Clock, PackageSearch } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await statsApi.getDashboard();
      if (data) setDashboardData(data);
      else setApiError(error || '');
      setLoading(false);
    })();
  }, []);

  // Use API data or fall back to mock
  const stats = dashboardData || mockDashboardStats;

  const metrics = [
    { label: 'Empty Miles Reduced', value: `${stats.emptyMilesReduced || 42}%`, icon: TrendingDown, trend: `+5% vs last month`, color: 'green' },
    { label: 'Total Savings', value: formatCurrency(stats.totalSavings || 485000), icon: DollarSign, trend: 'Since joining', color: 'green' },
    { label: 'Utilisation Rate', value: `${stats.utilisationRate || 78}%`, icon: TrendingUp, trend: '+12% improvement', color: 'blue' },
    { label: 'This Month', value: formatCurrency(stats.thisMonthEarnings || 44000), icon: BarChart3, trend: 'vs R38,000 last month', color: 'blue' },
  ];

  return <div className="space-y-6">
    {loading && <div className="text-center text-sm text-gray-400 py-2">Loading dashboard...</div>}
    {apiError && <div className="bg-yellow-50 text-yellow-700 text-sm rounded-lg px-4 py-2">Using sample data — backend: {apiError}</div>}

    {/* Hero Banner */}
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-green-100 text-sm font-medium">Welcome back, {user?.name?.split(' ')[0]}</p>
          <h1 className="text-3xl font-bold mt-1">Your fleet saved <span className="text-green-200">{formatCurrency(stats.totalSavings || 485000)}</span></h1>
          <p className="text-green-200 text-sm mt-1">{stats.emptyMilesReduced || 42}% fewer empty miles · {stats.utilisationRate || 78}% utilisation</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3">
          <TrendingDown className="w-5 h-5" /><div><p className="text-sm font-semibold">Empty Miles</p><p className="text-2xl font-bold">-{stats.emptyMilesReduced || 42}%</p></div>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Link to="/return-trip"><button className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 inline-flex items-center gap-1"><Route className="w-4 h-4" /> Find Return Loads</button></Link>
        <Link to="/ai-discover"><button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-400 inline-flex items-center gap-1"><BarChart3 className="w-4 h-4" /> AI Discover Routes</button></Link>
      </div>
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map(m => <Card key={m.label}><CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label}</p>
            <p className={`text-xl font-bold mt-1 ${m.color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.trend}</p>
          </div>
          <div className={`p-2 rounded-lg ${m.color === 'green' ? 'bg-green-50' : 'bg-blue-50'}`}><m.icon className={`w-4 h-4 ${m.color === 'green' ? 'text-green-600' : 'text-blue-600'}`} /></div>
        </div>
      </CardContent></Card>)}
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600" /> Active Trips</h2><Link to="/tracking" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link></div>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between mb-3"><div><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><h3 className="font-semibold text-gray-900">Electronics - JHB to DBN</h3></div><div className="flex items-center gap-3 mt-1 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" /> Midrand → Durban <Clock className="w-3.5 h-3.5 ml-2" /> ETA: 2h 15min</div></div><Badge status="in_transit" /></div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-blue-600 font-medium">Forward Revenue</p><p className="text-lg font-bold text-blue-700">{formatCurrency(22000)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-medium">Return Revenue</p><p className="text-lg font-bold text-green-700">+{formatCurrency(18500)}</p></div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" /><div className="flex-1"><p className="text-sm font-semibold text-gray-900">Total trip: {formatCurrency(40500)}</p><p className="text-xs text-green-600">100% empty miles eliminated</p></div>
            <Link to="/return-trip"><button className="px-3 py-1.5 border border-green-300 text-green-700 rounded-lg text-xs font-medium hover:bg-green-50">View Return Load</button></Link>
          </div>
        </CardContent></Card>
      </div>

      <div className="space-y-4">
        <Card><CardHeader><h2 className="font-semibold text-gray-900 flex items-center gap-2"><Route className="w-4 h-4 text-gray-400" /> Top Routes</h2></CardHeader>
          <CardContent className="space-y-2">
            {[{ r: 'JHB → DBN', c: 89, s: 'R285K' }, { r: 'DBN → JHB', c: 76, s: 'R198K' }, { r: 'JHB → CPT', c: 45, s: 'R342K' }].map(r =>
              <div key={r.r} className="flex items-center justify-between text-sm py-1.5">
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center"><Truck className="w-3 h-3 text-blue-700" /></div><span className="font-medium text-gray-700">{r.r}</span></div>
                <div className="text-right"><span className="text-gray-900 font-medium">{r.c} trips</span><span className="text-green-600 text-xs ml-2">+{r.s}</span></div>
              </div>
            )}
          </CardContent></Card>
        <Link to="/return-trip"><Card className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 cursor-pointer"><CardContent className="p-4 flex items-center gap-3 text-white">
          <div className="bg-white/20 rounded-lg p-2"><Route className="w-6 h-6" /></div><div className="flex-1"><p className="font-semibold">Check Return Loads</p><p className="text-sm text-orange-100">3 loads available</p></div><ArrowRight className="w-5 h-5" />
        </CardContent></Card></Link>
        <Link to="/ai-discover"><Card className="bg-gradient-to-r from-purple-500 to-purple-600 cursor-pointer"><CardContent className="p-4 flex items-center gap-3 text-white">
          <div className="bg-white/20 rounded-lg p-2"><BarChart3 className="w-6 h-6" /></div><div className="flex-1"><p className="font-semibold">AI Discover</p><p className="text-sm text-purple-100">Find profitable routes</p></div><ArrowRight className="w-5 h-5" />
        </CardContent></Card></Link>
      </div>
    </div>
  </div>;
}