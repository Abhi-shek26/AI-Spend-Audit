# Features 5 & 6: Lead Capture + Shareable Results

## Feature 5: Lead Capture + Storage

### Email Capture Form
- **Location**: `src/components/LeadCapture.tsx`
- **Fields**:
  - `email` (required) - with regex validation
  - `companyName` (optional)
  - `role` (optional)
  - `teamSize` (optional) - dropdown: Solo, Small (2-10), Medium (11-50), Large (50+)

### Data Storage
- **Backend**: Supabase (`leads` table)
- **Storage**: Automatic insert on form submission via `/api/leads/save`
- **Columns**:
  - `email` (required)
  - `company_name` (nullable)
  - `role` (nullable)
  - `team_size` (nullable)
  - `audit_id` (required) - links to audit results
  - `savings` (numeric) - monthly savings amount
  - `created_at` (timestamp)

### Transactional Email
- **Service**: Resend (free tier)
- **Trigger**: Automatically sent after lead capture
- **Content**:
  - Confirmation of audit completion
  - Estimated monthly savings
  - Company info (if provided)
  - Message noting high-savings cases get personal outreach
  - Contact CTA
- **Configuration**: `RESEND_API_KEY` required in `.env.local`

### Abuse Protection: hCaptcha ✅

**Why hCaptcha?**
- More privacy-friendly than Google reCAPTCHA (no tracking)
- CAPTCHA v3-equivalent available (invisible option)
- Free tier: 2,000 requests/month
- Better for ethical users in GDPR/privacy-conscious regions
- Actively maintained and industry-standard

**Implementation**:
1. Get free account: https://dashboard.hcaptcha.com
2. Create site key + secret key
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_key
   HCAPTCHA_SECRET_KEY=your_secret
   ```
4. Form automatically loads hCaptcha widget
5. Server validates token before accepting lead

**Rate Limiting (Secondary Layer)**:
- Max 5 submissions per email per hour (in-memory)
- Resets on server restart (development-friendly)
- Works independently of CAPTCHA

### API Endpoint
- **Path**: `POST /api/leads/save`
- **Validation**:
  1. Email format check
  2. Audit ID present
  3. hCaptcha verification (if key configured)
  4. Rate limiting per email
- **Response**: `{ success: true, email: string }` or error

---

## Feature 6: Shareable Result URL

### Unique Public URLs
- **Format**: `/audit/results/{audit_id}`
- **Storage**: Dual-backed
  - **Primary**: Supabase `audit_results` table (persistent)
  - **Fallback**: Browser localStorage (local-only sharing)

### Public Result Page
- **Location**: `src/app/(audit)/results/[id]/page.tsx`
- **Identifying Details Stripped**: ✅
  - ❌ No email shown
  - ❌ No company name shown
  - ✅ Shows tools and savings numbers
  - ✅ Shows recommendations and total savings
- **Data Fetched From**:
  1. Try server-side Supabase fetch
  2. Fallback to client-side localStorage
  3. Show "not found" if neither available

### Open Graph Tags ✅
- **Location**: `src/app/(audit)/results/[id]/metadata.ts`
- **Dynamic Tags**:
  - Title: `$XXX in Monthly Savings - Credex AI Audit`
  - Description: Includes recommendation count and savings amount
  - Image: `og-image.svg` (1200x630px)
  - URL: Full audit result URL

### Twitter Card ✅
- **Card Type**: `summary_large_image`
- **Image**: Same OG image (og-image.svg)
- **Auto-Generated**: Dynamic title/description with savings data

### OG Image
- **File**: `public/og-image.svg`
- **Dimensions**: 1200x630px (standard OG size)
- **Design**: Branding with Credex logo, audit messaging, gradient
- **Format**: SVG (scalable, supports all platforms)
- **Fallback**: Can convert to PNG if needed via `npx sharp`

### Share Flow
1. User completes audit
2. Results shown at `/audit/results` (private, in sessionStorage)
3. User clicks "Create Share Link"
4. Button calls `/api/audit/save` (saves to Supabase)
5. Returns shareable URL: `/audit/results/{audit_id}`
6. Link copied to clipboard
7. User can share on social media → OG tags display preview

---

## Configuration Required

### hCaptcha Setup
```bash
# 1. Go to https://dashboard.hcaptcha.com
# 2. Sign up (free)
# 3. Add new site
# 4. Copy Site Key + Secret Key to .env.local
```

### Supabase Tables
Ensure RLS is disabled or policies allow inserts:
```sql
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results DISABLE ROW LEVEL SECURITY;
```

Or create policies:
```sql
CREATE POLICY "Allow public inserts" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts" ON audit_results FOR INSERT WITH CHECK (true);
```

---

## Testing Checklist

- [ ] Lead form submits with all optional fields
- [ ] hCaptcha widget loads and requires verification
- [ ] Rate limit blocks 6th submission within 1 hour
- [ ] Email sent to test address via Resend
- [ ] Data appears in Supabase `leads` table
- [ ] Share link works and shows results
- [ ] OG preview shows in Twitter/LinkedIn (if public URL)
- [ ] Identifying details (email, company) not visible on public page
- [ ] Savings numbers and recommendations visible on public page
