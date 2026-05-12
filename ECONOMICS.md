# Economics

**CONFIDENTIAL**

This document should be filled with rough but explicit numbers. Use estimates if needed, but show the math.

## 1. Value of one converted lead
Estimate how much a converted lead is worth to Credex.

Template:
- Average credit purchase value: $2,500
- Gross margin: 70%
- Repeat purchase rate: 35%
- Average lifetime value per converted lead: $2,250

Show reasoning:
- Example: If 1 in 4 booked consultations becomes a credit purchase, and the average purchase is $2,500, then expected value per booked lead is $625 before repeat purchases. If 35% of buyers purchase again once, lifetime value rises to about $2,250 per converted lead.

## 2. CAC by channel
Estimate CAC for each GTM channel from `GTM.md`.

| Channel | Time / cost input | Expected conversion | CAC |
|---|---:|---:|---:|
| Cold DM | 20-30 minutes per qualified lead | 5% reply, 25% book | $18 |
| Community posting | 1-2 hours per post + follow-up | 2-4% to booked call | $12 |
| Founder referrals | 10 minutes per intro | 20% to booked call | $6 |
| Partner co-marketing | 1-2 hours coordination | 10-15% to booked call | $10 |

## 3. Funnel math
Model the full funnel from audit completion to purchase.
- Audit completed → consultation booked: 22%
- Consultation booked → credit purchase: 28%
- Purchase value: $2,500
- Blended conversion rate: 6.16%

Formula:
- `Expected revenue per audit = completed_audit_rate * booked_call_rate * purchase_rate * average_purchase_value`

Approximation:
- If 35 completed audits happen in a month, then 35 * 0.22 = 7.7 booked consultations.
- 7.7 * 0.28 = 2.16 credit purchases.
- 2.16 * $2,500 = about $5,400 monthly revenue from that cohort before repeat purchases.

## 4. What must be true for $1M ARR in 18 months
Show the math.
- Required ARR: $1,000,000
- Monthly recurring revenue target: $83,333
- Average monthly revenue per customer: $2,500
- Required paying customers: 34
- Monthly audit volume needed: 550-650 audited accounts per month
- Monthly completed-audit-to-customer conversion: 5-7%

Math:
- $83,333 / $2,500 = 33.3, so about 34 active customers at the target spend.
- If 6% of completed audits become paying customers, Credex would need roughly 567 completed audits per month to reach 34 new or retained customers at that spend level.

## 5. Sensitivity assumptions
Add 3 scenarios.
- Conservative: CAC rises to $25 and purchase rate drops to 12%, making the channel only marginally profitable unless repeat purchases are strong.
- Base case: CAC stays around $10-18 and 20-30% of booked consultations buy, producing healthy unit economics.
- Upside case: warm intro and partner channels drive CAC under $8 and repeat purchase rate pushes LTV above $3,000.

## 6. Decision note
State plainly whether the economics look viable, and what assumption is most fragile.

Based on these assumptions, the model looks viable if Credex can keep CAC below $20 and convert at least 1 in 4 consultations into a credit purchase. The most fragile assumption is the consultation-to-purchase conversion rate, because it depends on sales follow-up quality and how urgent the lead's problem actually is.
