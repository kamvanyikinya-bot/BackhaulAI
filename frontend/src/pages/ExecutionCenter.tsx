import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { MapPin, Truck, Phone, MessageCircle, Navigation, Clock, DollarSign, Route, CheckCircle, TrendingUp } from 'lucide-react';

export function ExecutionCenter() {
  const trip = {
    id: '1', title: 'Electronics - JHB to DBN',
    from: { name: 'Midrand Logistics Hub', city: 'Midrand', lat: -25.9988, lng: 28.1225 },
    to: { name: 'Durban Harbour Terminal', city: 'Durban', lat: -29.8786, lng: 31.0107 },
    status: 'in_transit' as const, forwardRevenue: 22000, returnRevenue: 18500,
    weight: 6000, distance: 590, driverName: 'Thabo Ndlovu', driverRating: 4.6, driverTrips: 187,
    pickupTime: '02 Jun, 09:15', currentPos: { lat: -28.45, lng: 30.22 },
  };

  useEffect(() => {
    let map: any = null;
    (async () => {
      try {
        const L = await import('leaflet');
        if (typeof L.Icon.Default.prototype._getIconUrl === 'undefined') {
          L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });
        }
        const el = document.getElementById('exec-map');
        if (el && !el.hasChildNodes()) {
          map = L.map(el).setView([-28.45, 30.22], 7);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
          const pickup = [trip.from.lat, trip.from.lng] as [number, number];
          const delivery = [trip.to.lat, trip.to.lng] as [number, number];
          const current = [trip.currentPos.lat, trip.currentPos.lng] as [number, number];
          L.marker(current).addTo(map).bindPopup('<b>Truck BA-7824</b><br/>In transit');
          L.marker(pickup).addTo(map).bindPopup(`<b>Pickup</b><br/>${trip.from.name}`);
          L.marker(delivery).addTo(map).bindPopup(`<b>Delivery</b><br/>${trip.to.name}`);
          L.polyline([pickup, current, delivery], { color: '#2563eb', weight: 3, opacity: 0.5, dashArray: '8, 8' }).addTo(map);
          map.fitBounds(L.latLngBounds([pickup, delivery]), { padding: [50, 50] });
        }
      } catch (e) { console.error('Map error:', e); }
    })();
    return () => { if (map) map.remove(); };
  }, []);

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-900">Execution Center</h1><p className="text-gray-500 mt-1">Track and manage your active trips in real time</p></div>

    {/* Profit Banner */}
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white"><CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-5 h-5 text-blue-200" /><p className="text-sm font-medium text-blue-200">Active Trip Profit Tracker</p></div>
          <div className="flex items-center gap-4 mt-2">
            <div><p className="text-xs text-blue-200">Forward</p><p className="text-xl font-bold">{formatCurrency(22000)}</p></div>
            <span className="text-blue-200 text-xl">+</span>
            <div><p className="text-xs text-green-200">Return</p><p className="text-xl font-bold">{formatCurrency(18500)}</p></div>
            <span className="text-blue-200 text-xl">=</span>
            <div><p className="text-xs text-blue-200">Total</p><p className="text-2xl font-bold">{formatCurrency(40500)}</p></div>
          </div>
        </div>
        <div className="hidden sm:block bg-white/20 rounded-xl p-3 text-center"><p className="text-2xl font-bold">0%</p><p className="text-xs text-blue-200">Empty Miles</p></div>
      </div>
    </CardContent></Card>

    {/* Map + Details */}
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2"><Card className="overflow-hidden"><div id="exec-map" className="h-[400px] lg:h-[450px] w-full bg-blue-50 flex items-center justify-center text-gray-400 text-sm">Loading map...</div></Card></div>
      <div className="space-y-4">
        <Card><CardHeader><h2 className="font-semibold text-gray-900 flex items-center gap-2"><Navigation className="w-4 h-4 text-blue-600" /> Trip Details</h2></CardHeader><CardContent className="space-y-3">
          <div><p className="text-sm font-medium text-gray-900">{trip.title}</p><Badge status={trip.status} /></div>
          <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-green-500 mt-0.5" /><div><p className="font-medium text-gray-900">Pickup</p><p className="text-gray-500">{trip.from.name}</p></div></div>
          <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-red-500 mt-0.5" /><div><p className="font-medium text-gray-900">Delivery</p><p className="text-gray-500">{trip.to.name}</p></div></div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-medium">{trip.distance} km</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="font-medium">{trip.weight.toLocaleString()} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pickup</span><span className="font-medium">{trip.pickupTime}</span></div>
          </div>
        </CardContent></Card>

        <Card><CardHeader><h2 className="font-semibold text-gray-900">Driver</h2></CardHeader><CardContent>
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">TN</div><div><p className="font-medium text-gray-900">{trip.driverName}</p><p className="text-xs text-gray-500">★ {trip.driverRating} · {trip.driverTrips} trips</p></div></div>
          <div className="flex gap-2 mt-4"><Button variant="outline" size="sm" className="flex-1" leftIcon={<Phone className="w-4 h-4" />}>Call</Button><Button variant="outline" size="sm" className="flex-1" leftIcon={<MessageCircle className="w-4 h-4" />}>Message</Button></div>
        </CardContent></Card>

        <Link to="/return-trip"><Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 cursor-pointer"><CardContent className="p-4 flex items-center gap-3">
          <div className="bg-green-100 rounded-lg p-2"><Route className="w-5 h-5 text-green-600" /></div>
          <div className="flex-1"><p className="font-semibold text-gray-900 text-sm">Return Load Available</p><p className="text-xs text-green-700">+{formatCurrency(18500)} · Durban → Johannesburg</p></div>
          <CheckCircle className="w-5 h-5 text-green-500" />
        </CardContent></Card></Link>
      </div>
    </div>

    {/* Timeline */}
    <Card><CardHeader><h2 className="font-semibold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Trip Timeline</h2></CardHeader><CardContent>
      <div className="relative"><div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
        {[
          { time: '02 Jun, 07:30', title: 'Trip Accepted', desc: 'Driver accepted the load', done: true },
          { time: '02 Jun, 09:15', title: 'Pickup Confirmed', desc: 'Cargo loaded at Midrand', done: true },
          { time: '02 Jun, 10:30', title: 'In Transit', desc: 'Departed. ETA 18:00', done: true, active: true },
          { time: '02 Jun, ~18:00', title: 'Delivery', desc: 'Durban Harbour Terminal', done: false },
          { time: '03 Jun, ~10:00', title: 'Return Pickup', desc: 'Retail Goods at Durban Harbour', done: false, optional: true },
        ].map((item, i) => <div key={i} className="flex items-start gap-4 mb-6 last:mb-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-100' : item.active ? 'bg-blue-100' : item.optional ? 'bg-yellow-100' : 'bg-gray-100'} relative z-10`}>
            <div className={`w-3 h-3 rounded-full ${item.done ? 'bg-green-500' : item.active ? 'bg-blue-500' : item.optional ? 'bg-yellow-500' : 'bg-gray-300'}`} />
          </div>
          <div><div className="flex items-center gap-2"><p className="text-sm font-medium text-gray-900">{item.title}</p>{item.optional && <Badge status="available" className="text-xs bg-yellow-100 text-yellow-700">Return Load</Badge>}</div><p className="text-xs text-gray-500">{item.desc}</p><p className="text-xs text-gray-400 mt-0.5">{item.time}</p></div>
        </div>)}
      </div>
    </CardContent></Card>
  </div>;
}