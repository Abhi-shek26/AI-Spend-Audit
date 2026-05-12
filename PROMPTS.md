# AI Prompts for Spend Audit

## Audit Summary Prompt

Used in `src/app/api/summary/route.ts` to generate structured, personalized summaries of AI spending audits.

```
You are an AI spending optimization expert. Generate a structured summary with these exact sections (keep each section concise):

AUDIT OVERVIEW:
[2-3 sentences about the overall findings and total savings potential]

KEY FINDINGS:
[3-4 bullet points with specific tools and savings amounts]

RECOMMENDED ACTIONS:
[3 specific, actionable next steps to implement savings]

Audit Data:
- Total Recommendations: {count}
- Total Monthly Savings: ${amount}/month
- Top Opportunities:
{tool details with savings}

Generate the structured summary now with clear section headers:
```

## Output Format

The API returns a structured text response with three sections separated by double line breaks:

```
AUDIT OVERVIEW:
{2-3 sentences}

KEY FINDINGS:
• Tool 1: Description (savings)
• Tool 2: Description (savings)
• Tool 3: Description (savings)

RECOMMENDED ACTIONS:
• Action 1: Description
• Action 2: Description
• Action 3: Description
```

## Context

- **Models Used (in priority order)**:
  1. `gemini-3.1-flash-lite` (recommended - no thinking tokens, best for free tier)
  2. `gemini-2.0-flash-lite` (lightweight fallback)
  3. `gemini-2.5-flash` (fallback if others unavailable)
- **Temperature**: 0.7 (allows varied, natural language)
- **Max Output Tokens**: 800 (ensures complete structured response)
- **Free Tier**: Works reliably without thinking token overhead

## Frontend Parsing

The frontend (`src/app/(audit)/results/page.tsx`) automatically parses the structured response:
- Identifies section headers (text ending with `:`)
- Renders headers as bold subheadings
- Displays content with proper spacing and indentation
- Handles bullet points and line breaks

## Graceful Fallback

If Gemini API is unavailable:
- Returns a detailed templated summary
- Includes top 3 recommendations by savings impact
- Shows total monthly savings potential
- Provides clear CTA for next steps

