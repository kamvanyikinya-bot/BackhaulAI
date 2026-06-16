import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { formatDate } from '../lib/utils';
import { users as usersApi } from '../lib/api';
import { mockUser } from '../lib/mockData';
import { Star, ShieldCheck, Truck, Phone, Mail, Calendar } from 'lucide-react';

export function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await usersApi.getProfile();
      if (data) setProfile(data);
      else if (error) setApiError(error);
      setLoading(false);
    })();
  }, []);

  const user = profile || authUser || mockUser;

  return <div className="space-y-6 max-w-3xl">
    <div><h1 className="text-2xl font-bold text-gray-900">Profile & Company</h1><p className="text-gray-500 mt-1">Manage your account and reputation</p></div>

    {loading && <div className="text-center text-sm text-gray-400 py-2">Loading profile...</div>}
    {apiError && <div className="bg-yellow-50 text-yellow-700 text-sm rounded-lg px-4 py-2">Using local profile — {apiError}</div>}

    <Card><CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">{user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'BA'}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-gray-900">{user.name}</h2><Badge status="verified" /></div>
          {user.companyName && <p className="text-gray-600 font-medium">{user.companyName}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
            {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {user.phone}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Since {formatDate(user.memberSince || new Date().toISOString())}</span>
          </div>
        </div>
      </div>
    </CardContent></Card>

    <div className="grid md:grid-cols-3 gap-4">
      <Card><CardContent className="p-5 text-center"><div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />{user.reputation || 4.8}</div><p className="text-sm text-gray-500 mt-1">Reputation</p></CardContent></Card>
      <Card><CardContent className="p-5 text-center"><p className="text-2xl font-bold text-gray-900">{user.tripsCompleted || 0}</p><p className="text-sm text-gray-500 mt-1">Trips Completed</p></CardContent></Card>
      <Card><CardContent className="p-5 text-center"><ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-1" /><p className="text-sm font-medium text-green-600">Verified</p><p className="text-xs text-gray-400">KYC completed</p></CardContent></Card>
    </div>

    <Card><CardHeader><h2 className="font-semibold text-gray-900">Account Settings</h2></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2"><div><p className="text-sm font-medium text-gray-900">Company</p><p className="text-sm text-gray-500">{user.companyName || 'Not set'}</p></div><Button variant="outline" size="sm">Edit</Button></div>
        <div className="border-t" />
        <div className="flex items-center justify-between py-2"><div><p className="text-sm font-medium text-gray-900">Phone</p><p className="text-sm text-gray-500">{user.phone || 'Not set'}</p></div><Button variant="outline" size="sm">Edit</Button></div>
        <div className="border-t" />
        <div className="flex items-center justify-between py-2"><div><p className="text-sm font-medium text-gray-900">Type</p><p className="text-sm text-gray-500 capitalize">{user.role?.replace('_', ' ') || 'company'}</p></div><Badge status="verified" /></div>
      </CardContent></Card>
  </div>;
}