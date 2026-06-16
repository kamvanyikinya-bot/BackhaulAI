import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { LayoutDashboard, Route, MapPin, UserCircle, Bell, Menu, X, ChevronDown, LogOut, Truck, TrendingUp, DollarSign, Search, Sparkles } from 'lucide-react';

const navSections = [
  { label: 'Overview', items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Profit & performance' }] },
  { label: 'Operations', items: [
    { path: '/return-trip', label: 'Return Trip Finder', icon: Route, desc: 'Find backhaul loads', badge: '💰' },
    { path: '/ai-discover', label: 'AI Discover', icon: Sparkles, desc: 'Find profitable routes', badge: '🤖' },
    { path: '/marketplace', label: 'Load Marketplace', icon: Search, desc: 'Browse & post loads' },
  ]},
  { label: 'Tracking', items: [{ path: '/tracking', label: 'Execution Center', icon: MapPin, desc: 'Active trips & GPS' }] },
  { label: 'Account', items: [{ path: '/profile', label: 'Profile', icon: UserCircle, desc: 'Company & reputation' }] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation(); const navigate = useNavigate(); const { user, logout } = useAuth();

  const isAuthPage = ['/login', '/signup', '/onboarding'].includes(location.pathname);
  const isLanding = location.pathname === '/';
  if (isAuthPage || isLanding) return <>{children}</>;

  return <div className="min-h-screen bg-gray-50">
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
      <div className="flex items-center justify-between px-4 h-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Truck className="w-4 h-4 text-white" /></div>
            <span className="font-bold text-lg text-gray-900">BackhaulAI</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mr-2">
            <DollarSign className="w-4 h-4 text-green-600" /><span className="text-sm font-medium text-green-700">R48,500 saved this month</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-100"><Bell className="w-5 h-5 text-gray-500" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'BA'}</div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-green-600 font-medium">{user?.kycStatus === 'verified' ? '✓ Verified' : 'Verify Now'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>
            {profileOpen && <><div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-4 py-2 border-b"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
                <button onClick={() => { navigate('/profile'); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><UserCircle className="w-4 h-4" /> Profile</button>
                <div className="border-t my-1" />
                <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Sign Out</button>
              </div>
            </>}
          </div>
        </div>
      </div>
    </header>

    <aside className={cn('fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 overflow-y-auto sidebar-transition', 'lg:translate-x-0', sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full')}>
      <nav className="p-3 space-y-4">
        {navSections.map(section => <div key={section.label}>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{section.label}</p>
          <div className="space-y-0.5">
            {section.items.map(item => {
              const isActive = location.pathname === item.path;
              return <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all', isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0"><span className="block truncate">{item.label}</span><span className="text-xs text-gray-400 font-normal">{item.desc}</span></div>
                {item.badge && <span className="text-xs">{item.badge}</span>}
              </Link>;
            })}
          </div>
        </div>)}
      </nav>
      <div className="p-4 mt-2 border-t border-gray-100">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="w-5 h-5 text-green-200" /><p className="text-sm font-semibold">Your Impact</p></div>
          <p className="text-2xl font-bold mt-1">R48,500</p>
          <p className="text-xs text-green-200">saved by avoiding empty trips</p>
          <div className="mt-2 bg-white/20 rounded-lg px-2 py-1 text-xs">42% fewer empty miles this month</div>
        </div>
      </div>
    </aside>

    {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    <main className="lg:pl-64 pt-16 min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
    </main>
  </div>;
}