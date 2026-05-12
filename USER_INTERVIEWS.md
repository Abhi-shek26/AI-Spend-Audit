# User Interviews

## Quick intro you can use
> "I’m building a small tool that shows where AI spend is getting wasted and what can be cut or consolidated. Can I ask you a few quick questions?"

## Interview 1: Piyush
- Name: Piyush
- Role: SDE intern
- How you found them: IIT Indore friend

### What to ask
- What AI tools do you actually use in a normal week?
- Do you pay for any of them yourself, or is it all team access?
- What feels annoying, wasteful, or overkill?
- If a tool said “you can save money here,” what would make you believe it?

### Direct quotes
- "Mostly Copilot, ChatGPT, and sometimes Claude when I need better long-form responses."
- "Honestly yes. Some months I pay for two tools but use one 80% of the time."
- "Show me exact usage pattern logic, not just generic advice. Like “you used tool B only twice this month."

### Most surprising thing he said
- he don’t need 10 recommendations. Even 2 clear and high-confidence cuts are enough for me to act.

### What it changed about the design
- Reduced recommendation overload and prioritize top actions that need to be done
- Added clearer reasoning text under each recommendation.
---

## Interview 2: Shreeyut
- Name: Shreeyut
- Role: ML intern
- How you found them: IIT Indore friend

### What to ask
- Do you think people overpay for AI subscriptions?
- Is cost the main thing, or do you care more about quality and speed?
- What would make this kind of audit feel legit instead of random?
- Would you actually use something like this yourself?

### Direct quotes
- "Definitely. Teams stack tools without checking overlap."
- "Quality first for model work, but for repetitive tasks I care more about price."
- " It should show confidence and assumptions. Don’t pretend exact precision if it’s estimated."

### Most surprising thing he said
- Without assumptions shown, an audit looks like guesswork

### What it changed about the design
- Improved benchmark section to explain when keeping a higher-tier tool is justified.
- Made recommendations less “cost-only” and more context-driven.

---

## Interview 3: Praveen
- Name: Praveen
- Role: Senior  Product Manager professional
- How you found them: IIT Indore Alumni Connections

### What to ask
- If someone on your team showed you this, what would you check first?
- Where do tools like this usually fall apart in real life?
- What would a recommendation need to include before you trust it?

### Direct quotes
- "Is this whole setup working on the real economic perspective or just joing on to the code logics"
- " If recommendations are obvious fluff or if I can’t verify logic quickly, I can't trust it"

### Most surprising thing he said
- I would only forward this if the output looks decision-ready for finance in one glance.

### What it changed about the design
- Improved summary format for decision-makers: monthly + annual savings, top actions, risk note.
- Made share output cleaner and more presentation-ready (for manager/finance handoff).
- Emphasized concise, executive-style output instead of technical detail-heavy output.

---
