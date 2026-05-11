# Architecture Quick Reference

## 📌 Key Architectural Decisions at a Glance

### **Three-Layer Architecture**

```
┌─────────────────────━━━━━━━┐
│  CLIENT (React)            │  Form input, localStorage state
│  ────────────────          │
│  - AuditForm component     │
│  - Result display          │
│  - Share buttons           │
└─────────────┬──────────────┘
              │ JSON POST
┌─────────────▼──────────────┐
│  API (Next.js Route)       │  Orchestration, validation, persistence
│  ────────────────────      │
│  - Input validation        │
│  - Response handling       │
│  - Database writes         │
│  - Queue jobs              │
└─────────────┬──────────────┘
              │ Call
┌─────────────▼──────────────┐
│  ENGINE (Pure TS)          │  Core business logic
│  ────────────────          │
│  - evaluate(input)         │
│  - Deterministic rules     │
│  - NO side effects         │
│  - Testable in isolation   │
└────────────────────────────┘
```

---

## 🎯 Design Principles

### **1. Determinism Above All**
- Same input = Same output, always
- No randomness, no timestamps, no external calls
- Enables testing, caching, reproduction

### **2. Separation of Concerns**
- **Engine** = Logic only (pure functions)
- **API** = I/O only (database, external APIs)
- **Component** = UI only (React rendering)

### **3. Async AI, Sync Everything Else**
- Return audit result immediately
- Generate Claude summary in background
- User never waits for AI

### **4. Stateless Servers**
- All state in Supabase
- Can scale horizontally (add workers)
- Cheap to run (managed services)

### **5. Public by Default**
- Reports shareable via URL
- No login needed for viewing
- Anonymous share tokens

---

## 🔄 Data Flow in 4 Steps

```
1️⃣  USER SUBMITS FORM
    [React] → POST /api/audit/evaluate

2️⃣  ENGINE EVALUATES
    [API] → calls evaluate(input)
    [Engine] → deterministic rules → Recommendation[]

3️⃣  SAVE & RESPOND
    [API] → save to Supabase
    [API] → return result immediately
    [API] → queue Claude summary (background)

4️⃣  SHARE & VIEW
    [User] → shares URL → /reports/[id]
    [Server] → fetches from DB
    [Server] → injects Open Graph meta
    [Browser] → renders shareable page
```

---

## 💾 Data Storage Strategy

```
Supabase PostgreSQL:

┌─ audit_results ─────────────┬─ Purpose
├─ id (PK)                   │ Unique result identifier
├─ input (JSONB)             │ Full audit input (for replay)
├─ recommendations (JSONB)    │ All recommendations generated
├─ total_monthly_savings      │ Sum of savings (cached)
├─ savingsResearchPercentage       │ Percentage (cached)
├─ summary (TEXT)            │ AI summary (added async)
├─ share_token (UK)          │ Anonymous public access
├─ expires_at                │ Auto-delete after 90 days
└─ public (BOOL)             │ Allow/disallow public view

┌─ leads ─────────────────────┬─ Purpose
├─ id (PK)                   │ Unique lead
├─ email (TEXT)              │ User email
├─ company (TEXT)            │ Company name (optional)
├─ audit_id (FK)             │ Link to audit result
└─ email_sent_at             │ Track engagement

┌─ pricing_rules ─────────────┬─ Purpose
├─ tool_name (UK)            │ e.g., "ChatGPT"
└─ pricing_data (JSONB)      │ Tiers: free, pro, enterprise
```

---

## ⚡ Request-Response Timeline

```
User clicks "Audit"
       │
       ▼ (instantly)
[Browser] POST /api/audit/evaluate
       │
       ▼ (~50ms)
[Server] validate → evaluate → save
       │
       ├─ Immediate Response (50-100ms)
       │  ✓ id, recommendations, savings
       │  └─> Browser displays results
       │
       └─ Background Job
          [Queue] Generate summary with Claude
          [Wait] AI responds
          [Save] Update Supabase with summary
          [Done] User can refresh to see summary

User shares link
       │
       ▼
[Browser] GET /reports/[id]?token=...
       │
       ▼
[Server] Check Redis cache
       ├─ Cache HIT (< 1ms)
       │  └─> Return cached HTML
       │
       └─ Cache MISS (< 100ms)
          [Fetch] Supabase by share_token
          [Render] HTML with og: tags
          [Cache] Store for 15 minutes
          └─> Return to browser
```

---

## 🧪 Testing Strategy

```
Unit Tests (100% coverage on engine)
├─ evaluate() determinism
├─ Each rule function
├─ Edge cases (empty, zero, large numbers)
└─ Recommendation sorting

Integration Tests (API + DB)
├─ POST /api/audit/evaluate happy path
├─ Invalid input handling
├─ Supabase save/fetch
└─ Share token generation

E2E Tests (Full user journeys)
├─ Fill form → submit → view results
├─ Share link → open → view public page
└─ Lead capture → email saved

Performance Tests (Load testing)
├─ 100 concurrent requests
├─ Average latency < 200ms
├─ Database queries < 50ms
└─ No memory leaks
```

---

## 🚀 MVP vs Scale

### MVP (100/day)
```
Setup Effort:    1 week
Infrastructure:  Vercel + Supabase (free tier)
Cost:           $0 (free tier)
Performance:    10-50ms per audit
Database:       Single Postgres instance
Queue:          setTimeout() in Node
Cache:          None needed
```

### Scale Phase 1 (1k/day)
```
Setup Effort:    1 day (add caching)
Infrastructure:  Vercel + Supabase + Redis
Cost:           $25-50/month
Changes:        Add Redis for share pages
Database:       Add indexes on high-query fields
Queue:          Still setTimeout (fine for 1 req/sec)
```

### Scale Phase 2 (10k/day)
```
Setup Effort:    3 days (add queue system)
Infrastructure:  Same + Bull.js queue
Cost:           $50-100/month
Changes:        Move Claude summary to job queue
Database:       Add read replicas
Queue:          Bull.js + Redis
Cache:          Redis cluster
Rate Limiter:   Track Claude API calls
```

---

## 🔐 Security Checklist

| Concern | Solution |
|---------|----------|
| **API Keys Exposed** | Never send to client, server-only environment variables |
| **Pricing Rules Manipulated** | Stored in Supabase, validated server-side |
| **Public Reports Leaked** | Share tokens (not expose raw IDs), auto-expire after 90 days |
| **Lead Data Breached** | Supabase provides encryption, RLS policies |
| **Claude API Abused** | Rate limit calls, track per audit, alerts on spikes |
| **SQL Injection** | Use Supabase client library, parameterized queries |
| **XSS in Summary** | Sanitize Claude output before rendering |

---

## 📊 Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| **Audit Latency** | < 100ms | Pure TS engine, no I/O |
| **API Response Time** | < 200ms | Async summary, immediate return |
| **Share Page Load** | < 500ms | Redis cache at 15min TTL |
| **Database Query** | < 50ms | Indexes on share_token, created_at |
| **Concurrent Users** | 100+ | Stateless APIs, managed DB |
| **Claude Summary** | < 5s | Background job, user doesn't wait |

---

## 📁 Key Files

| Path | Purpose | Responsibility |
|------|---------|-----------------|
| `src/lib/audit/engine.ts` | Core evaluation logic | Pure deterministic function |
| `src/lib/audit/rules.ts` | Recommendation rules | Each rule is independent |
| `src/app/api/audit/evaluate/route.ts` | API entry point | Validate, call engine, save |
| `src/components/audit/AuditForm.tsx` | User input form | Collect data, localStorage persist |
| `src/app/reports/[id]/page.tsx` | Share page | Fetch DB, render, Open Graph |
| `src/lib/ai/claude.ts` | AI integration | Claude API calls only |
| `src/lib/db/client.ts` | Database layer | Supabase queries |

---

## 🔧 Common Patterns

### **Pattern 1: Pure Function Testing**
```typescript
// Test engine in isolation, no mocks needed
const result = evaluate(testInput);
expect(result.recommendations).toContainEqual({...});
```

### **Pattern 2: Async Side Effects**
```typescript
// Return immediately, do async work later
generateSummaryInBackground(auditId, result)
  .catch(err => console.error(err)); // Fire and forget
```

### **Pattern 3: Immutable Data**
```typescript
// Don't mutate, return new arrays
const filtered = recommendations.filter(...);
const sorted = [...filtered].sort(...);
```

### **Pattern 4: Database as Cache**
```typescript
// Audit results serve as cache
// Same input stored → can replay same output
```

### **Pattern 5: Public Sharing**
```typescript
// Generate anonymous tokens, separate from IDs
const shareToken = crypto.randomUUID();
// Users see /reports/[token], not /reports/[id]
```

---

## ❓ FAQ

**Q: Why not REST endpoints for each rule?**  
A: Monolithic engine is simpler for MVP. Split later if rules become independent services (unlikely).

**Q: Why localStorage instead of database for form state?**  
A: No auth needed, works offline, users can save drafts naturally. Upside down: users lose state on logout.

**Q: Why generate summaries async?**  
A: AI is slow (2-5s). Better UX to show results immediately, add summary when ready.

**Q: Why not cache engine results?**  
A: Engine runs in < 50ms. Caching adds complexity for minimal gain. Worth revisiting at 10k/day.

**Q: How do we handle new AI tools?**  
A: Add to `pricing_rules` table, update rules.ts accordingly. No code deploy needed for new tools.

**Q: Can we use ML instead of rules?**  
A: Eventually, yes. Rules are MVP: interpretable, fast, reliable. ML is future enhancement.

**Q: What if Claude API is down?**  
A: Summary stays empty, user still sees recommendations. System degrades gracefully.

**Q: How long to implement?**  
A: Engine + API: 2-3 days  
Form + share page: 3-4 days  
Claude integration: 1 day  
Tests: 2-3 days  
**Total MVP: 1-2 weeks**

---

## 🎓 Key Takeaway

> **The engine is the product.** Everything else (form, share, lead capture) is delivery mechanism. Invest in making the engine deterministic, testable, and correct. The rest scales naturally.

---

**Last Updated:** May 6, 2026  
**Architecture Version:** 1.0 (MVP)
