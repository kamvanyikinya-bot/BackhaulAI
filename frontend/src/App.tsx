import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { ReturnTripFinder } from './pages/ReturnTripFinder';
import { AIDiscover } from './pages/AIDiscover';
import { ExecutionCenter } from './pages/ExecutionCenter';
import { Profile } from './pages/Profile';
import { PricingPage } from './pages/PricingPage';
import { WaitlistPage } from './pages/WaitlistPage';
import { SubscriptionPage } from './pages/SubscriptionPage';

export default function App() {
  return <AuthProvider><BrowserRouter><Layout>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/return-trip" element={<ReturnTripFinder />} />
      <Route path="/ai-discover" element={<AIDiscover />} />
      <Route path="/tracking" element={<ExecutionCenter />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/waitlist" element={<WaitlistPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
    </Routes>
  </Layout></BrowserRouter></AuthProvider>;
}