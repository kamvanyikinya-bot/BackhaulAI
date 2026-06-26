# BackhaulAI Conversion Optimisation Report

**Generated:** 2026-06-25T12:49:06.985038
**Target:** 3-step wizard at /onboarding → first value in <60 seconds

---

## Current Funnel Analysis

| Stage | Visitors | Conversion Rate | Drop-Off |
|-------|----------|----------------|----------|
| Landing Page | 10,000 | 100.0% | — |
| Sign Up Started | 3,500 | 35.0% | 65% |
| KYC Submitted | 2,100 | 21.0% | 40% |
| KYC Verified | 1,680 | 16.8% | 20% |
| Preferences Set | 1,260 | 12.6% | 25% |
| First Load Viewed | 1,008 | 10.1% | 20% |
| First Load Booked | 504 | 5.0% | 50% |
| First Trip Completed | 403 | 4.0% | 20% |

**Overall conversion from landing to first trip:** 4.0%

**Biggest bottleneck:** Sign Up Started (65% drop-off)

---

## Key Drop-Off Points & Recommendations

### 1. Sign Up Started (65% drop)
- **Problem:** Too many required fields — email, phone, password, company name
- **Recommendation:** Reduce to phone number only; add WhatsApp OTP
- **Expected impact:** +20% completion rate → 4,200 signups/month

### 2. KYC Submission (40% drop)
- **Problem:** Users don't have documents ready; takes too long
- **Recommendation:** Allow progressive KYC — start matching immediately, verify later
- **Expected impact:** +15% completion rate → 2,415 KYC submissions/month

### 3. First Load Booking (50% drop)
- **Problem:** Users see loads but don't know which to pick; analysis paralysis
- **Recommendation:** Show 3 AI-matched loads ("Best Match", "Highest Paying", "Shortest Route") with estimated profit
- **Expected impact:** +25% booking rate → 630 bookings/month

---

## UX Improvements for <60 Second First Value

| # | Improvement | Effort | Impact | Time Saved |
|---|-----------|--------|--------|------------|
| 1 | WhatsApp-only signup (no email/password) | Low | High | 30s |
| 2 | Show 3 pre-matched loads immediately after signup | Medium | High | 45s |
| 3 | Deferred KYC — match first, verify later | Medium | High | 60s |
| 4 | One-tap booking with AI-recommended load | Medium | High | 20s |
| 5 | Progress bar with "3 steps to your first load" | Low | Medium | — |

**Target funnel after improvements:**

| Stage | Before | After | Improvement |
|-------|--------|-------|-------------|
| Landing → Sign Up | 35% | 55% (+WhatsApp OTP) | +57% |
| Sign Up → KYC | 60% | 75% (+progressive KYC) | +25% |
| KYC → First Load | 50% | 70% (+AI matching) | +40% |
| **Overall** | **4.0%** | **13.3%** | **+232%** |

---

## A/B Test Hypotheses

### Hypothesis 1: WhatsApp Signup
- **Test:** Standard email form vs phone-only + WhatsApp OTP
- **Metric:** Sign-up completion rate
- **Duration:** 14 days, 5000 visitors per variant
- **Expected:** +15-25% completion

### Hypothesis 2: AI Pre-Matched Loads
- **Test:** Show all loads vs show 3 AI-recommended loads first
- **Metric:** First load booking rate
- **Duration:** 14 days, 3000 visitors per variant
- **Expected:** +20-30% booking rate

### Hypothesis 3: Progressive KYC
- **Test:** Full KYC before matching vs match-first/verify-later
- **Metric:** Time-to-first-value, KYC completion rate
- **Duration:** 21 days, 2000 visitors per variant
- **Expected:** -60% time to first value, +15% KYC completion

---

## Priority Action Items (Ranked)

1. **Implement WhatsApp signup** — Highest impact, lowest effort
2. **Show AI-matched loads on dashboard** — Users need guidance
3. **Defer KYC to after first booking** — Reduce initial friction
4. **Add progress indicator** — Show users how close they are to first load
5. **One-tap booking** — Remove analysis paralysis
