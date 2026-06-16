import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Route, Shield, Zap, TrendingDown, Truck, CheckCircle, Star, ChevronRight, DollarSign } from 'lucide-react';

export function LandingPage() {
  return <div className="min-h-screen bg-white">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-2"><div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-gray-900">BackhaulAI</span></div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
          <Link to="/signup"><button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Get Started</button></Link>
        </div>
      </div>
    </nav>

    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6"><Zap className="w-4 h-4" />AI-Powered Logistics Intelligence</div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">Never Send a Truck<br /><span className="text-blue-600">Empty Again</span></h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">BackhaulAI eliminates empty return trips through intelligent load matching. Every kilometre profitable.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/signup"><button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 inline-flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></button></Link>
            <Link to="/login"><button className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50">Sign In</button></Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Route className="w-5 h-5 text-green-600" /></div>
              <div><p className="font-semibold text-gray-900">Return Trip Match Found!</p><p className="text-sm text-gray-500">JHB → DBN → JHB · Total: R40,500</p></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Forward Load</span><span className="font-medium">R22,000</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Return Load</span><span className="font-medium text-green-600">+R18,500</span></div>
              <div className="border-t pt-3 flex justify-between text-sm"><span className="font-medium">Total Trip</span><span className="font-bold text-lg text-blue-600">R40,500</span></div>
              <div className="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2"><TrendingDown className="w-3.5 h-3.5" /> 100% empty miles eliminated</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-gray-50 py-12 border-y">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[{ v: '12,500+', l: 'Loads Matched' }, { v: '3,200+', l: 'Active Drivers' }, { v: 'R2.4B+', l: 'Trip Value' }, { v: '4.8★', l: 'Avg. Rating' }].map(s => <div key={s.l} className="text-center"><p className="text-3xl font-bold text-gray-900">{s.v}</p><p className="text-sm text-gray-500 mt-1">{s.l}</p></div>)}
      </div>
    </section>

    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16"><h2 className="text-3xl font-bold text-gray-900 mb-4">Why BackhaulAI?</h2><p className="text-lg text-gray-600 max-w-2xl mx-auto">Every feature is designed to maximise your profit per kilometre.</p></div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: DollarSign, title: 'Double Your Trip Revenue', desc: 'Forward load + return load = 2x earnings on every route. Our AI finds high-confidence backhaul matches.' },
            { icon: Route, title: 'AI Return Trip Matching', desc: 'Before you depart, we show you return loads ranked by profit impact, match score, and route fit.' },
            { icon: TrendingDown, title: 'Eliminate Empty Miles', desc: 'Cut empty return trips by up to 60%. Turn deadhead kilometres into revenue.' },
            { icon: BarChart3, title: 'Real Profit Analytics', desc: 'See exactly how much you save per route, per driver, per month. Data-driven decisions.' },
            { icon: Shield, title: 'Verified Trust Network', desc: 'KYC-verified users with transparent reputation scores. Safe, reliable transactions.' },
            { icon: Zap, title: 'Instant Load Matching', desc: 'AI agents work 24/7 finding profitable loads. One-click booking, real-time tracking.' },
          ].map((f, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-blue-600" /></div>
            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3><p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="py-20 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Eliminate Empty Miles?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">Join thousands already using BackhaulAI.</p>
          <Link to="/signup"><button className="bg-white text-blue-700 px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-50 inline-flex items-center gap-2">Start Free Trial <ChevronRight className="w-5 h-5" /></button></Link>
          <p className="text-sm text-blue-200 mt-4">No credit card required.</p>
        </div>
      </div>
    </section>

    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto text-center text-sm">&copy; 2025 BackhaulAI. All rights reserved.</div>
    </footer>
  </div>;
}