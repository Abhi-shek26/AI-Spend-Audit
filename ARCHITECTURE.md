# AI Spend Audit Platform - Architecture Design

**MVP Target:** Startup-focused, production-ready, minimal over-engineering  
**Scale Target:** 10,000 audits/day  
**Tech Stack:** Next.js, TypeScript, Supabase, Claude API, TailwindCSS

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Fill Form          2. Submit              3. View Results│
│  (localStorage)        (API Call)             (Share URL)     │
│         │                    │                     │          │
│         ↓                    ↓                     ↓          │
│    [React Form] ──→ [Audit Engine] ────→ [Report Page]      │
│                          │                        │          │
│                   Deterministic Logic    (Open Graph Meta)   │
│                   (Pure TypeScript)      (SEO Friendly)      │
│                          │                        │          │
│                   [Save to Supabase] ←──────────┘           │
│                                                               │
│  4. Lead Capture (Optional)           5. AI Summary (Async)  │
│    [Email Form] ──→ [Leads Table]     Claude API Call       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Component Architecture

### **Layer 1: Frontend (Client)**

**Files:** `src/components/`, `src/hooks/`, `src/app/(audit)/`

```typescript
// User Flow
[AuditForm Component]
  ├─ useAudit() hook → form state
  ├─ localStorage persistence
  ├─ Multi-step input (tools, team size, spend)
  ├─ Real-time validation
  └─ Submit to /api/audit/evaluate

[ResultsPage Component]
  ├─ Display recommendations
  ├─ Show savings summary
  ├─ Lead capture form
  └─ Share button → copyable URL
```

**Key Decision:** Form state lives in **browser** (`localStorage`), not server. Users can fill form, leave, come back.

### **Layer 2: API (Next.js Route Handler)**

**File:** `src/app/api/audit/evaluate/route.ts`

```typescript
POST /api/audit/evaluate

Request:
{
  tools: AITool[],
  teamSize: string,
  useCases: string[],
  totalMonthlySpend: number
}

Process:
1. Validate input schema
2. Call audit engine (pure TS function)
3. Save to Supabase
4. Trigger Claude summary (async/background)
5. Return result with share URL

Response:
{
  success: true,
  data: {
    id: "audit_...",
    recommendations: [...],
    shareUrl: "https://app.com/reports/audit_..."
  }
}
```

### **Layer 3: Core Engine (Pure TypeScript)**

**Files:** `src/lib/audit/`

This is the brain of the system. Must be:
- ✅ Deterministic (same input = same output)
- ✅ Testable (pure functions, no side effects)
- ✅ Fast (< 100ms for complex audits)
- ✅ Standalone (can run in Node, browser, Workers)

```typescript
// Core function signature
export function evaluate(input: AuditInput): AuditResult {
  // Validate
  validateInput(input);

  // Generate recommendations
  const recommendations = [];
  
  for (const tool of input.tools) {
    // Check each rule
    recommendations.push(
      ...checkUnderutilization(tool),
      ...checkConsolidation(tool, input.tools),
      ...checkTeamSizeMismatch(tool, input.teamSize)
    );
  }

  // Calculate totals
  const totalSavings = sum(recommendations.map(r => r.estimatedSavings));
  
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    input,
    recommendations: sortBySavings(recommendations),
    totalMonthlySavings: totalSavings,
    savingsPercentage: (totalSavings / input.totalMonthlySpend) * 100,
    summary: '' // Filled async by Claude
  };
}
```

### **Layer 4: Pricing Rules Database**

**Location:** `src/lib/audit/rules.ts` + `databases/pricing_rules` table

```typescript
// In-code rules (for MVP)
const TOOL_PRICING = {
  chatgpt: {
    free: { cost: 0, features: 3, requests: 100 },
    pro: { cost: 20, features: 10, requests: infinity },
    team: { cost: 30, features: 15, requests: infinity }
  },
  claude: { /* ... */ },
  // ... more tools
};

// Rule functions
function checkUnderutilization(tool: AITool): Recommendation[] {
  // If used rarely but paying pro → recommend downgrade
  if (tool.usageFrequency === 'rare' && tool.currentPlan === 'pro') {
    return [{
      toolId: tool.id,
      type: 'downgrade',
      reason: `Used ${tool.usageFrequency} but paying for pro`,
      estimatedSavings: TOOL_PRICING[tool.name].pro.cost
    }];
  }
  return [];
}

function checkConsolidation(tool1: AITool, allTools: AITool[]): Recommendation[] {
  // If user has ChatGPT Pro + Claude Pro, suggest consolidation
  // ...
}
```

### **Layer 5: Database (Supabase)**

**Schema:**

```sql
-- Audit Results
CREATE TABLE audit_results (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  input JSONB, -- Full audit input
  recommendations JSONB, -- Audit output
  total_monthly_savings DECIMAL,
  savings_percentage INT,
  summary TEXT, -- AI-generated (empty initially)
  share_token TEXT UNIQUE, -- Anonymize public access
  ip_address TEXT, -- Track origin
  user_email TEXT, -- Optional: for follow-up
  ttl_days INT DEFAULT 90 -- Auto-delete after 90 days
);

-- Lead Captures
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  email TEXT NOT NULL,
  company TEXT,
  audit_id TEXT REFERENCES audit_results(id),
  received_summary BOOLEAN DEFAULT false
);

-- Pricing Rules (Admin Panel)
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY,
  tool_name TEXT UNIQUE,
  pricing_data JSONB, -- Tool pricing tiers
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Data Flow (Request → Response)

### **Happy Path: Audit Submission**

```
User fills form (localStorage) 
       ↓
Clicks "Audit My Spending"
       ↓
Browser: POST /api/audit/evaluate with AuditInput
       ↓
Server: Validate input (schema check)
       ↓
Server: Run deterministic engine
       ├─ Load pricing rules from memory (or cache)
       ├─ Check each tool against rules
       ├─ Generate recommendations
       └─ Calculate savings
       ↓
Server: Save result to Supabase
       ├─ Store input, recommendations, savings
       └─ Generate share token (anonymous access)
       ↓
Server: Return result JSON immediately
       ├─ id, recommendations, shareUrl
       └─ savingsPercentage
       ↓
Browser: Display results page
       ├─ Show recommendations
       ├─ Display share URL
       └─ Offer lead capture
       ↓
(Async) Server: Generate AI summary
       ├─ Call Claude API
       ├─ Update Supabase with summary
       └─ No user waiting for this

User shares URL → Public report page
       ↓
Server: Fetch from Supabase by share_token
       ├─ Render report HTML
       ├─ Inject Open Graph meta tags
       └─ Cache for 15 minutes (Redis)
       ↓
Browser: Display shareable report
       ├─ All recommendations visible
       ├─ Savings highlighted
       └─ Lead capture CTA
```

---

## 🎯 Audit Engine: Detailed Architecture

### **Rule-Based Recommendation System**

```typescript
// src/lib/audit/engine.ts
export function evaluate(input: AuditInput): AuditResult {
  const allRecommendations: Recommendation[] = [];

  // Run independent rule checks
  allRecommendations.push(...rules.checkUnderutilization(input.tools));
  allRecommendations.push(...rules.checkConsolidation(input.tools));
  allRecommendations.push(...rules.checkTeamSizeMismatch(input));
  allRecommendations.push(...rules.checkUnusedFeatures(input.tools));
  
  // Deduplicate (same tool shouldn't get 2 recommendations)
  const deduped = deduplicateByTool(allRecommendations);
  
  // Sort by savings
  const sorted = deduped.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  
  // Cap at 10 recommendations (too many is overwhelming)
  const capped = sorted.slice(0, 10);

  return {
    id: generateId(),
    timestamp: now(),
    input,
    recommendations: capped,
    totalMonthlySavings: sum(capped.map(r => r.estimatedSavings)),
    savingsPercentage: calculatePercentage(...),
    summary: '' // Added later by Claude
  };
}
```

### **Recommendation Confidence & Weighting**

```typescript
interface Recommendation {
  toolId: string;
  toolName: string;
  type: 'downgrade' | 'switch' | 'consolidate' | 'eliminate';
  reason: string;
  estimatedSavings: number;
  nextPlan?: string;
  alternative?: string;
  
  // NEW: For weighted sorting
  confidence: 'high' | 'medium' | 'low';
  savingsPercentageOfTool: number;
  riskOfWrongRecommendation: 'low' | 'medium' | 'high';
}

// Rules with confidence levels:
// HIGH CONFIDENCE:
// - "ChatGPT Pro used rarely" → downgrade to free (90% of time safe)
// - "Duplicate tool subscriptions" → consolidate (100% safe)
//
// MEDIUM CONFIDENCE:
// - "Switch to open-source alternative" (depends on features needed)
// - "Team size mismatch" (needs more context)
//
// LOW CONFIDENCE:
// - "You might not need this tool" (too presumptive)
```

---

## 📈 Scaling for 10k Audits/Day

### **Load Calculation**

```
10,000 audits/day
= ~0.12 audits/second (simple)
= ~7,200 audits/hour
= ~300 audits/min concurrent

Next.js can easily handle this at ~30ms per request
Bottleneck will be: Database writes + Claude API calls
```

### **Optimization Strategy**

**Phase 1 (Current - MVP):**
- ✅ Synchronous API: engine runs in-request
- ✅ Supabase writes directly
- ⏱️ Claude summary: Background job (setTimeout)
- 📊 No caching needed

**Phase 2 (When hitting bottleneck):**
- ✅ Move Claude summary to job queue
  ```typescript
  // Use Bull.js or Inngest
  await summaryQueue.add({ auditId, result });
  
  // Job worker
  summaryWorker.process(async (job) => {
    const { auditId, result } = job.data;
    const summary = await generateSummary(result);
    await db.updateAudit(auditId, { summary });
  });
  ```

- ✅ Add Redis cache for share pages
  ```typescript
  const cacheKey = `report:${shareToken}`;
  let report = await redis.get(cacheKey);
  
  if (!report) {
    report = await db.getReport(shareToken);
    await redis.set(cacheKey, report, 'EX', 900); // 15 min
  }
  
  return report;
  ```

- ✅ Database connection pooling (Supabase handles this)

**Phase 3 (High scale):**
- ✅ Separate Claude API into dedicated microservice
- ✅ Rate limit Claude calls (20 requests/min max)
- ✅ Queue audit summary jobs
- ✅ Consider edge caching (Vercel Edge Config)

### **Database Optimization**

```sql
-- Indexes for fast queries
CREATE INDEX idx_audit_results_created_at ON audit_results(created_at DESC);
CREATE INDEX idx_audit_results_share_token ON audit_results(share_token);
CREATE INDEX idx_leads_email ON leads(email);

-- Archival
ALTER TABLE audit_results ADD COLUMN
  archived_at TIMESTAMP DEFAULT NULL
  DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days');
  
-- Auto-delete old results
-- (Supabase: Setup retention policy or cron job)
```

### **Cost Estimation (10k audits/day)**

| Component | Cost | Notes |
|-----------|------|-------|
| Vercel Hosting | $20-80/month | Functions + bandwidth included |
| Supabase | $25-100/month | 500k rows = ~$25, adjust for growth |
| Claude API | $50-200/month | ~$0.005 per summary (10k × 30 summaries) |
| **Total Monthly** | **$95-380** | Highly scalable, no fixed infra |

---

## 🧩 Modularity & Testability

### **1. Audit Engine is Completely Independent**

```typescript
// src/lib/audit/engine.ts
// ✅ Zero dependencies on React, Next.js, or DB
// ✅ Can be tested in isolation
// ✅ Can be ported to API, Lambda, Worker, CLI

import { evaluate } from '@/lib/audit/engine';

const result = evaluate({
  tools: [...],
  teamSize: 'small',
  useCases: ['Development'],
  totalMonthlySpend: 150
});

// Works everywhere:
// - Unit test: npm test
// - In browser: <script src="engine.js">
// - In API: POST /api/audit/evaluate
// - In CLI: node audit-cli.js
// - In Lambda: AWS Lambda handler
```

### **2. Clear Boundary Between Logic & Side Effects**

```typescript
// ✅ PURE (testable)
function evaluate(input: AuditInput): AuditResult {
  // Only math, no I/O
  return { id, recommendations, savings };
}

function checkUnderutilization(tool: AITool): Recommendation[] {
  // Only rule logic
  if (tool.usageFrequency === 'rare' && tool.currentPlan === 'pro') {
    return [{...}];
  }
  return [];
}

// ✅ IMPURE (isolated)
async function handleAuditRequest(request: Request) {
  // Only I/O operations
  const input = await request.json();
  const result = evaluate(input); // Call pure function
  await db.saveResult(result); // Do I/O
  const summary = await claude.summarize(result);
  await db.updateResult(result.id, { summary });
  return { shareUrl: buildShareUrl(result.id) };
}
```

### **3. Test Structure**

```
tests/
├── unit/
│   ├── audit.engine.test.ts      # Core logic (100% coverage)
│   ├── audit.rules.test.ts       # Each rule tested
│   └── utils.test.ts             # Validation, formatting
│
├── integration/
│   ├── api.test.ts               # POST /api/audit/evaluate
│   └── db.test.ts                # Supabase saves
│
└── e2e/
    └── user.flow.test.ts         # Full happy path
```

### **Sample Tests**

```typescript
// tests/unit/audit.engine.test.ts
describe('Audit Engine', () => {
  it('should be deterministic', () => {
    const input = { tools: [...], teamSize: 'solo', ... };
    const result1 = evaluate(input);
    const result2 = evaluate(input);
    
    // Same recommendations
    expect(result1.recommendations).toEqual(result2.recommendations);
    // Same savings
    expect(result1.totalMonthlySavings).toEqual(result2.totalMonthlySavings);
  });

  it('should rank recommendations by savings', () => {
    const result = evaluate(mockInput);
    for (let i = 1; i < result.recommendations.length; i++) {
      expect(result.recommendations[i - 1].estimatedSavings)
        .toBeGreaterThanOrEqual(result.recommendations[i].estimatedSavings);
    }
  });

  it('should handle edge cases gracefully', () => {
    const edgeCases = [
      { tools: [], teamSize: 'solo', ... }, // Empty
      { tools: [...], totalMonthlySpend: 0, ... }, // Zero spend
      { tools: [...], tools: 100, ... }, // Many tools
    ];

    edgeCases.forEach(input => {
      expect(() => evaluate(input)).not.toThrow();
      const result = evaluate(input);
      expect(result.recommendations).toBeArray();
    });
  });
});
```

---

## 🔐 Frontend vs Backend Separation

### **What Lives Client-Side:**
- ✅ Form data entry
- ✅ Form state persistence (localStorage)
- ✅ Real-time validation feedback
- ✅ UI/UX (animations, loading states)
- ✅ Route navigation

```typescript
// src/components/audit/AuditForm.tsx
export function AuditForm() {
  const { input, addTool, updateTool } = useAudit();
  // ✅ Client logic only
  
  const handleSubmit = async () => {
    // Send to server
    const response = await fetch('/api/audit/evaluate', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    const result = await response.json();
    // Handle response
  };
}
```

### **What Lives Server-Side:**
- ✅ Audit engine execution
- ✅ Pricing rules lookup
- ✅ Database writes
- ✅ Claude API calls
- ✅ Share token generation
- ✅ Public report rendering

```typescript
// src/app/api/audit/evaluate/route.ts
export async function POST(request: Request) {
  const input = await request.json();
  
  // All business logic here
  const result = evaluate(input); // Pure TS
  await db.saveResult(result); // Side effect
  const shareUrl = buildShareUrl(result.id);
  
  return NextResponse.json({
    data: result,
    shareUrl
  });
}
```

### **What Cannot Go to Client:**
- ❌ Pricing rules (users could manipulate savings estimates)
- ❌ API keys (Claude, Supabase)
- ❌ Database credentials
- ❌ Admin controls
- ❌ Sensitive metrics

```typescript
// ❌ WRONG
export const PRICING_RULES = { /* exposed to browser */ };

// ✅ RIGHT
// Keep in src/lib/audit/rules.ts (server-only)
// OR in Supabase (fetch server-side only)
```

---

## 🎓 Design Principles (Why These Choices)

| Decision | Why | Tradeoff |
|----------|-----|----------|
| **Deterministic engine** | Reproducible, testable, predictable | Can't use ML for scoring |
| **localStorage for form** | No auth needed, works offline | Data lost on logout |
| **Supabase over custom API** | Lower ops overhead, free tier works | Vendor lock-in |
| **Async Claude summaries** | Fast initial response, better UX | Eventual consistency |
| **Public share tokens** | No auth needed for viewing | Anyone with link sees report |
| **Redis optional (not MVP)** | Simple MVP state, clear upgrade path | Higher latency for share page |
| **Rule-based not ML** | Deterministic, debuggable, costs low | Can't adapt to new tools automatically |

---

## 📋 Implementation Checklist

### **Phase 1: MVP (Week 1-2)**
- [ ] Implement 3-5 core rules in `src/lib/audit/rules.ts`
- [ ] Build multi-step form component
- [ ] Create `/api/audit/evaluate` route
- [ ] Set up Supabase schema
- [ ] Create share page with public access
- [ ] Add Open Graph meta tags
- [ ] Unit tests for engine (aim for 80% coverage)

### **Phase 2: Polish (Week 2-3)**
- [ ] Claude integration for summaries
- [ ] Lead capture form
- [ ] Email verification via Supabase Auth
- [ ] Admin panel to update pricing rules
- [ ] Error handling & edge cases
- [ ] E2E tests

### **Phase 3: Scale (Week 3+)**
- [ ] Add Redis caching
- [ ] Set up job queue for Claude
- [ ] Database indexing & archival
- [ ] Analytics on audit patterns
- [ ] A/B test lead capture wording
- [ ] Load testing (k6 or Artillery)

---

## 🚀 Quick Start

```bash
# Core files to create first
src/lib/audit/
├── engine.ts         # Main evaluation function
├── rules.ts          # Specific recommendations
├── types.ts          # Type definitions
└── utils.ts          # Helpers

src/components/audit/
├── AuditForm.tsx     # Multi-step form
└── Results.tsx       # Display results

src/app/
├── api/audit/evaluate/route.ts  # API
└── reports/[id]/page.tsx        # Share page
```

This architecture is:
- ✅ **Lean:** No unnecessary complexity
- ✅ **Testable:** Pure functions, clear separation
- ✅ **Scalable:** Ready for 10k+/day with simple optimizations
- ✅ **Maintainable:** Clear responsibilities for each layer
- ✅ **Startup-friendly:** Low ops overhead, uses managed services

Ready to implement? Start with the audit engine tests—that's the core value.
