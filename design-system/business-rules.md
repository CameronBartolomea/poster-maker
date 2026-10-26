# Strategic Home Loans — Business Rules

Facts and standing decisions that every flyer should be consistent
with. This is the reference for "what do we say" questions; see
`design-system/copywriting-guide.md` for "how do we say it".

## Company & licensing

| Entity | Role | NMLS | CA DRE |
|---|---|---|---|
| Strategic Home Loans, Inc. | Company | #340445 | #01311775 |
| Cameron Bartolomea | Mortgage Loan Officer | #2777999 | #02279518 |
| Robert Bartolomea | President \| Mortgage Consultant | #275047 | #00987918 |

- Office: 2555 Townsgate Rd, Suite 200, Westlake Village, CA 91361
- Company main line: 805 496 7500
- Cameron: cell 818 857 9675, cameron@strategichomeloans.com
- Robert: cell 818 917 5839, robert@strategichomeloans.com
- Web: strategichomeloans.com

**Never invent, guess, or modify any of the above.** If a flyer needs a
number not listed here, ask Cameron rather than estimating.

## Geographic focus

Default service area when a flyer references where SHL works: Ventura
County, Conejo Valley, Westlake Village, Thousand Oaks, Simi Valley,
Moorpark, Newbury Park, Agoura Hills, and surrounding western Los
Angeles County. Don't imply a broader (e.g. statewide or national)
footprint without Cameron confirming it for that piece.

## Who's on which material

Preserve the distinction between materials branded for Cameron, for
Robert, or for the company generally:
- A flyer about day-to-day loan origination / processing → Cameron is
  the point of contact.
- A flyer about brokerage leadership, partnership terms, or anything
  "ask the broker" → Robert is the point of contact.
- A flyer with no individual angle (e.g. a company-wide open house
  sponsorship) → company NMLS only, no individual QR/headshot unless
  asked.

Never guess which of them should be the contact on a given piece — ask
if it's not obvious from the request.

## Standing rule: individual-branded material always ships as two versions

**Permanent rule, established by Cameron, built into the generation
architecture itself — not a preference to remember from a
conversation.** Whenever a flyer is branded for an individual loan
officer (their own contact info, NMLS/DRE, headshot, and/or personal
QR code), it is ALWAYS produced as two separate final versions:

1. A Cameron Bartolomea version — his verified contact info, licensing,
   headshot (when the flyer calls for one), and personal QR code.
2. A Robert Bartolomea version — his verified contact info, licensing,
   headshot (when the flyer calls for one), and personal QR code.

Both versions share the same core design, educational content, and
SHL branding — only the person-specific fields differ. Never combine
Cameron and Robert into a single piece unless explicitly asked to.

This is not something to remember to do by hand. It is implemented as
actual infrastructure:

- `data/people.json` — the single verified source for both people's
  contact info, licensing numbers, headshot paths, and QR code paths.
  Cross-checked against the table above by `scripts/validate-profiles.js`
  (run it any time this file or `data/people.json` changes — the two
  must never drift apart).
- A flyer meant for an individual is authored ONCE as a template with
  `{{person.field}}` / `{{company.field}}` placeholders (see
  `scripts/render-person-flyer.js` for the exact token syntax), not
  hand-duplicated per person. `scripts/render-person-flyer.js
  <template.html> --person cameron --out posters/<name>-cameron.html`
  and the same with `--person robert` produce both final versions from
  the identical template and the identical substitution code path.
- `scripts/profile-pair-check.js <cameron-file> <robert-file>` checks
  the actual rendered output of a pair: each file must contain its own
  owner's name, NMLS, DRE, email, cell, and QR code, and must NOT
  contain the other person's name, NMLS, DRE, email, cell, QR code, or
  headshot anywhere. Run this on every individual-branded pair before
  presenting it — this is what actually enforces "never mixed," not a
  promise to be careful.
- Company-only material (no individual angle) continues to use company
  NMLS only, per the "who's on which material" rule above — it does
  not need the two-version treatment.

## Rate and pricing rule (critical, repeated from CLAUDE.md on purpose)

Never put a rate, APR, discount point, or payment estimate on a flyer
unless it's sourced from the actual rate sheet/matrix Cameron provides
in that day's conversation. Never estimate, never reuse a number from
an earlier conversation, never present a "hypothetical" rate as if it
were current. If no current rate sheet is available, the flyer either
omits pricing entirely or says something like "contact for current
rates and programs."

## Default geography/compliance footer

Unless a flyer calls for something different, the standard disclosure
line is:

> 2555 Townsgate Rd, Suite 200, Westlake Village, CA 91361 ·
> strategichomeloans.com

paired with the Equal Housing Opportunity badge and at least one NMLS
number (see `design-system/components.md` #5).
