# SHL Flyer Content Model

Every flyer type below lists its **required fields** (the flyer isn't
complete without them) and **optional fields** (include when relevant).
This is what keeps output consistent across dozens of flyers and what
`scripts/compliance-check.js` partially enforces automatically.

Use this as the brief when asking for a new flyer: give the fields, not
just a vibe, and generation is faster and the result is predictable.

---

## 1. Realtor Partner / Referral Handout
**Required:** headline/value prop, 3-5 differentiators, loan programs list,
point-of-contact (name, title, NMLS, DRE, cell, office, email), company
NMLS/DRE, Equal Housing badge.
**Optional:** QR vCard, headshot, specific stat/testimonial (only if real
and approved), second contact (e.g. Robert as broker).
**No rate numbers** — referral flyers sell the relationship, not pricing.

## 2. Open House / Listing Flyer
**Required:** property address, date/time, agent of record (name + DRE,
this is the realtor's flyer, SHL is often co-branded, not primary), SHL
loan officer contact block, Equal Housing badge, NMLS numbers.
**Optional:** property photo(s), estimated payment example (ONLY from
that day's actual rate sheet — never estimate; if no rate sheet provided,
omit pricing entirely and say "contact for current rates"), QR to listing
or scheduling link (use `scripts/make-qr.js` to generate a fresh one).
**Never:** a guessed or stale interest rate, payment, or APR.

## 3. Loan Program Flyer (FHA, VA, Jumbo, Refi, etc.)
**Required:** program name, 3-4 bullet eligibility/benefit points, contact
block, NMLS/DRE numbers, Equal Housing badge.
**Optional:** comparison table vs. another program, rate example (sourced
from current rate sheet only, dated on the flyer, e.g. "as of 10/26").
**Never:** rate/APR without an explicit current rate sheet for that date.

## 4. Social Media Post (Instagram Story/Square)
**Required:** one clear message/hook, SHL logo (compact), handle/website.
**Optional:** NMLS in small print (recommended even on social), headshot,
QR.
**Format:** `story` (1080x1920) or `square` (1080x1080). Min 24px text per
Instagram safe-zone rules in the poster-maker CLAUDE.md.

## 5. Team / Co-Branded Flyer (Cameron + Robert)
**Required:** both headshots, both names/titles/NMLS/DRE, shared company
NMLS/DRE, Equal Housing badge, single shared contact path (office line)
or two QR codes (one per person).
**Optional:** "who to call for what" split (e.g. Robert = broker
questions, Cameron = day-to-day loan processing).

## 6. Business Card (print, 3.5x2in)
**Required:** name, title, NMLS, DRE, cell, office, email, logo
(compact), QR vCard.
**Optional:** Equal Housing badge (small, if room — not always feasible
at business-card scale; check with compliance before omitting).

---

## Standing rules (apply to every flyer type)
1. Never include a rate, APR, or payment estimate unless it's sourced
   from that day's actual rate sheet — flag it with the date, never
   present it as evergreen. See `design-system/business-rules.md`.
2. Always include at minimum one NMLS number and the Equal Housing
   Opportunity badge, unless the piece genuinely isn't an advertisement
   for loan products (e.g. a pure "thank you" card) — when in doubt,
   include them.
3. Draft only. Nothing gets sent, posted, printed, or published without
   Cameron's explicit approval — see `audit/flyer-log.json`.
4. One sans-serif font family per design (`design-system/tokens.css`),
   two brand colors + black/white, no em/en dashes in copy — see
   `design-system/copywriting-guide.md`.
5. Pull layout patterns from `design-system/components.md` instead of
   rebuilding from scratch — extend the library with genuinely new
   patterns rather than one-off variations of the same layout.

## Process for a new/substantial flyer request

For anything beyond a trivial tweak to an existing flyer, work through
this before calling something finished:

1. **Draft 2-3 materially different concepts** (not three nearly
   identical templates) — vary information architecture, layout family,
   or typographic hierarchy, not just color. For a simple, well-defined
   request (e.g. "update the phone number"), skip this — it's for
   substantial new pieces.
2. **Evaluate them** against: visual quality, clarity, audience fit,
   brand consistency, practical usefulness. Write the evaluation down
   (this goes in the audit log's `evaluation_notes`).
3. **Build the chosen direction** using the component library and
   design tokens.
4. **Run the automated checks**: `node scripts/audit-log.js add
   posters/<file>.html --type <type> --variants "..." --evaluation
   "..."` — this runs compliance, copy, and layout checks together and
   records everything.
5. **Visually review the actual rendered screenshot** — a passing
   automated check is not a design review. Read the PNG. Check
   hierarchy at full size and at a shrunk preview size.
6. **Fix and re-run** until clean, then present to Cameron. Nothing is
   "approved" until he says so — see `scripts/audit-log.js approve`.
