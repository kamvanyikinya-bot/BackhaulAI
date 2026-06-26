import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { mockSubscriptionPlans, mockUserSubscription } from '../lib/mockData';
import { CheckCircle, CreditCard, Crown, Copy, Building2 } from 'lucide-react';

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState(mockUserSubscription.planId);
  const [showEft, setShowEft] = useState(false);
  const [copied, setCopied] = useState('');
  const bankRef = 'BAI-' + Date.now().toString(36).toUpperCase();

  const bankDetails = {
    bank: 'First National Bank', accountName: 'BackhaulAI (Pty) Ltd',
    accountNumber: '6284 1920 753', branchCode: '255005',
    reference: bankRef,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label); setTimeout(() => setCopied(''), 2000);
  };

  const currentPlan = mockSubscriptionPlans.find(p => p.id === mockUserSubscription.planId);

  return <div className="space-y-6 max-w-5xl mx-auto">
    <div><h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1><p className="text-gray-500 mt-1">Pay via EFT — monthly billing only.</p></div>

    {/* Current Plan */}
    <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1"><Crown className="w-5 h-5 text-yellow-400" /><h2 className="font-semibold text-lg">Current Plan: {mockUserSubscription.planName}</h2></div>
            <p className="text-blue-200 text-sm mb-2">{formatCurrency(mockUserSubscription.price)}/mo · {mockUserSubscription.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}</p>
            <p className="text-sm text-blue-200">Next billing: {new Date(mockUserSubscription.nextBillingDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })} · Paid via EFT</p>
          </div>
          <Badge status={mockUserSubscription.status} className="bg-white/20 text-white" />
        </div>
      </CardContent>
    </Card>

    {/* Plans Grid */}
    <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {mockSubscriptionPlans.map(plan => <Card key={plan.id} className={`relative ${plan.highlighted ? 'border-blue-500 ring-2 ring-blue-200' : ''} ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
        {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>}
        <CardHeader className="text-center">
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <div className="mt-2"><span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span><span className="text-gray-500 text-sm">/mo</span></div>
          <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{f}</li>)}
          </ul>
          <Button className="w-full mt-4" variant={selectedPlan === plan.id ? 'primary' : 'outline'} onClick={() => { setSelectedPlan(plan.id); setShowEft(true); }}>
            {selectedPlan === plan.id ? 'Current Plan' : 'Pay via EFT'}
          </Button>
        </CardContent>
      </Card>)}
    </div>

    {/* EFT Modal */}
    {showEft && <Card className="border-2 border-blue-400 bg-blue-50/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
          <div><h2 className="text-lg font-bold text-gray-900">Pay via EFT</h2><p className="text-sm text-gray-500">Plan activates once payment is confirmed (1-2 business days)</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
            {[{ label: 'Bank', value: bankDetails.bank }, { label: 'Account Name', value: bankDetails.accountName }, { label: 'Account Number', value: bankDetails.accountNumber }, { label: 'Branch Code', value: bankDetails.branchCode }, { label: 'Payment Reference', value: bankDetails.reference, highlight: true }].map(item => <div key={item.label} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 text-sm border">
              <span className="text-gray-500">{item.label}</span>
              <div className="flex items-center gap-2"><span className={`font-medium ${(item as any).highlight ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>{item.value}</span><button onClick={() => copyToClipboard(item.value, item.label)} className="p-1 hover:bg-gray-100 rounded"><Copy className="w-3.5 h-3.5 text-gray-400" /></button></div>
            </div>)}
            {copied && <p className="text-xs text-green-600">Copied {copied}!</p>}
          </div>
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 text-sm">📋 Instructions</h4>
              <ol className="mt-2 text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Log into your banking app</li>
                <li>Pay via EFT using reference: <strong>{bankRef}</strong></li>
                <li>Send proof to <strong>payments@backhaulai.com</strong></li>
                <li>Plan activates within 24 hours</li>
              </ol>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setShowEft(false)}>I've Made the Payment — Track Status</Button>
          </div>
        </div>
      </CardContent>
    </Card>}
  </div>;
}