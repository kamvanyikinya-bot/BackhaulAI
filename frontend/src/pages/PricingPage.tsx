import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { CheckCircle, Copy, CreditCard, Building2, ArrowRight, Crown, Zap, Smartphone } from 'lucide-react';

const plans = [
  { id: 'starter', name: 'Starter', price: 3500, desc: 'For small fleet owners and independent operators', features: ['AI return trip matching', 'GPS tracking for active trips', 'Browse and book loads', 'Basic load matching', 'Standard support', 'Up to 5 loads/month'], highlighted: false },
  { id: 'pro', name: 'Pro', price: 9500, desc: 'For growing logistics businesses', features: ['Everything in Starter', 'Unlimited loads', 'Priority load matching', 'AI return trip optimisation', 'Advanced analytics dashboard', 'KYC verification included', 'Premium support'], highlighted: true },
  { id: 'business', name: 'Business', price: 20000, desc: 'For established logistics companies', features: ['Everything in Pro', 'Dedicated account manager', 'Custom API integration', 'Fleet-wide analytics', 'Priority 24/7 support', 'Multi-user access', 'SLA guarantees'], highlighted: false },
  { id: 'enterprise', name: 'Enterprise', price: 35000, desc: 'For large fleet operators', features: ['Everything in Business', 'White-label options', 'Advanced AI tools', 'Demand prediction', 'Pricing intelligence', 'Route optimisation', 'Dedicated infrastructure'], highlighted: false },
  { id: 'enterprise-plus', name: 'Enterprise+', price: 65000, desc: 'For enterprise logistics groups', features: ['Everything in Enterprise', 'Full white-label platform', 'Custom AI model training', 'Dedicated support team', '99.9% uptime SLA', 'Priority feature access', 'Executive account management'], highlighted: false },
];

const bankDetails = {
  bank: 'First National Bank', accountName: 'BackhaulAI (Pty) Ltd',
  accountNumber: '6284 1920 753', branchCode: '255005',
  reference: 'BAI-' + Date.now().toString(36).toUpperCase(),
};

type PaymentStatus = 'selecting' | 'awaiting_payment' | 'confirmed';

export function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('selecting');
  const [copied, setCopied] = useState('');

  const handleSelect = (planId: string) => {
    if (planId === 'free') { setPaymentStatus('confirmed'); return; }
    setSelectedPlan(planId);
    setPaymentStatus('awaiting_payment');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return <div className="space-y-6">
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
      <p className="text-gray-500 mt-2 max-w-xl mx-auto">Pay via EFT — your subscription activates once payment is confirmed. No credit card required.</p>
    </div>

    {/* Plan Cards */}
    <div className="grid md:grid-cols-4 gap-4">
      {plans.map(plan => <Card key={plan.id} className={`relative ${plan.highlighted ? 'border-blue-500 ring-2 ring-blue-200' : ''} ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}>
        {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>}
        <CardHeader className="text-center">
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-900">{plan.price === 0 ? 'Free' : formatCurrency(plan.price)}</span>
            {plan.price > 0 && <span className="text-gray-500 text-sm">/mo</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{f}</li>)}
          </ul>
          <Button className="w-full mt-4" variant={selectedPlan === plan.id ? 'primary' : plan.id === 'free' ? 'secondary' : 'outline'} onClick={() => handleSelect(plan.id)}>
            {plan.price === 0 ? 'Get Started Free' : 'Pay via EFT'}
          </Button>
        </CardContent>
      </Card>)}
    </div>

    {/* EFT Payment Modal */}
    {paymentStatus === 'awaiting_payment' && selectedPlan && (
      <Card className="border-2 border-blue-400 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pay via EFT</h2>
              <p className="text-sm text-gray-500">Your subscription activates once payment is confirmed (1-2 business days)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
              {[
                { label: 'Bank', value: bankDetails.bank },
                { label: 'Account Name', value: bankDetails.accountName },
                { label: 'Account Number', value: bankDetails.accountNumber },
                { label: 'Branch Code', value: bankDetails.branchCode },
                { label: 'Payment Reference', value: bankDetails.reference, highlight: true },
              ].map(item => <div key={item.label} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 text-sm border">
                <span className="text-gray-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${item.highlight ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>{item.value}</span>
                  <button onClick={() => copyToClipboard(item.value, item.label)} className="p-1 hover:bg-gray-100 rounded">
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>)}
              {copied && <p className="text-xs text-green-600">Copied {copied}!</p>}
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Instructions</h4>
                <ol className="mt-2 text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Log into your banking app</li>
                  <li>Pay via EFT to the account shown</li>
                  <li>Use the payment reference <strong>{bankDetails.reference}</strong></li>
                  <li>Send proof of payment to <strong>payments@backhaulai.com</strong></li>
                  <li>Your plan activates within 24 hours</li>
                </ol>
              </div>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Plan</span><span className="font-medium text-gray-900 capitalize">{selectedPlan}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Price</span><span className="font-medium text-gray-900">{formatCurrency(plans.find(p => p.id === selectedPlan)?.price || 0)}/mo</span></div>
                  <div className="border-t pt-2 flex justify-between text-sm"><span className="text-gray-500">Status</span><Badge status="pending" className="bg-yellow-100 text-yellow-700">Awaiting Payment</Badge></div>
                </CardContent>
              </Card>

              <Button className="w-full" variant="outline" onClick={() => setPaymentStatus('confirmed')}>
                <CreditCard className="w-4 h-4 mr-2" /> I've Made the Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Payment Confirmed */}
    {paymentStatus === 'confirmed' && selectedPlan !== 'enterprise' && (
      <Card className="border-2 border-green-400 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {selectedPlan === 'free' ? 'Free Plan Activated!' : 'Payment Recorded!'}
          </h2>
          <p className="text-gray-500">
            {selectedPlan === 'free' ? 'You can now browse and book available loads.' : 'Your subscription will activate once payment is confirmed. You\'ll receive an email within 24 hours.'}
          </p>
        </CardContent>
      </Card>
    )}

    {paymentStatus === 'confirmed' && selectedPlan === 'enterprise' && (
      <Card className="border-2 border-green-400 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">Enterprise Inquiry Submitted</h2>
          <p className="text-gray-500 mt-2">Our team will contact you within 1-2 business days to set up your custom plan.</p>
        </CardContent>
      </Card>
    )}
  </div>;
}