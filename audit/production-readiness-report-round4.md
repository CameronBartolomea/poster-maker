# Round 4 Production-Readiness Report

Covers the six capability-test flyers built to stress-test the flyer
generation system before starting the Three Cs Realtor infographic
project. Written 2026-10-26/27. All six remain **drafts**, not approved
for use.

## Scope

Three new layout families, each rendered for both Cameron and Robert:

| Type | Cameron file | Robert file |
|---|---|---|
| Realtor educational infographic | `posters/_capability-test-realtor-education-infographic-cameron.html` | `-robert.html` |
| Premium residential listing flyer | `posters/_capability-test-premium-listing-flyer-cameron.html` | `-robert.html` |
| Seller concession / allocation explainer | `posters/_capability-test-seller-concession-explainer-cameron.html` | `-robert.html` |

## Current status: all 6 pass clean

As of commit `4e1c9f4`, every one of the 6 files passes all 5 automated
checks (`node scripts/audit-log.js add`) with no warnings:

- `compliance` — NMLS present, Equal Housing badge present, no
  unsourced rate/APR/payment figures
- `copy` — no em/en dashes, no banned clichés, exclamation/emoji limits
  respected
- `layout` — no clipping, no element overlap, no WCAG-AA contrast
  failures (checker hardened this round, see below)
- `artwork_contrast` — logo and icon artwork readable against its
  surroundings
- `brand` — real logo asset used (not recreated as text), correct
  proportions, correct clear space

Also verified, all clean:

- `profile-pair-check.js` — zero cross-contamination across all 3
  Cameron/Robert pairs (name, NMLS, DRE, email, cell, QR, headshot)
- `scripts/export.js --pdf` — all 6 export at true 8.5in x 11in
- QR codes decoded via `pyzbar` to confirm correct per-person vCard data
- Direct visual inspection of every screenshot (not just automated
  pass/fail)

## What this round actually found and fixed

An independent creative review (a fresh agent with no exposure to how
these were built) surfaced three substantive content/design problems,
not just mechanical ones:

1. **seller-concession-explainer implied a credit goes to exactly one
   destination.** The original 3-branch diagram (Rate Buydown / Closing
   Costs / Prepaid Items) read as mutually exclusive, which is
   misleading — a real seller credit is commonly split across more than
   one. Fixed by adding a "combo" strip showing three example
   combinations.
2. **premium-listing-flyer had zero photography on a "premium"
   listing.** Fixed by adding three honestly-labeled photo placeholder
   panels rather than shipping it without photos or faking them.
3. **realtor-education-infographic's headline promised "through closing
   day" but the timeline stopped one step short**, at "Conditions
   Cleared." Fixed by adding a sixth timeline node, "Closing Day."

Making those fixes surfaced three more bugs, found through direct
measurement rather than a casual screenshot glance:

4. **A CSS flexbox height-collapse bug** in premium-listing-flyer: the
   body used `display:flex; flex-direction:column` with a fixed 11in
   height, and once total content exceeded that height, the browser's
   default `flex-shrink:1` silently shrank the hero section below its
   declared CSS height, with no visual warning in a quick look — it
   just clipped the footer. Fixed with `flex-shrink:0` on the fixed-size
   sections plus a real height-budget rebalance.
5. **A disclosure-box/contact-footer overlap** in
   seller-concession-explainer: the disclosure box's text was
   overflowing past its own gray background, and the absolutely
   positioned contact footer's top border was cutting through a
   sentence. `layout-check.js` reported this file clean — it only
   compared elements that directly own text or an image against each
   other, so a footer's border/background (decorative, no direct text)
   was invisible to it. Fixed the overlap by trimming margins across
   the content stack, **and hardened the checker itself** (see below)
   so this class of bug can't pass silently again.
6. **Two logo clear-space intrusions**, caught by `brand-check.js`
   after the margin/layout fixes above shifted other content closer to
   the logo: the seller-concession-explainer headline column was too
   wide, and the premium-listing-flyer's draft-tag watermark sat inside
   the logo's clear-space margin. Both fixed.

## Layout-checker hardening

`scripts/layout-check.js` previously only checked overlap between
elements that directly own visible text or an `<img>`. That's why bug
#5 above slipped through: the contact footer's top border and the
disclosure box's background fill are decoration, not text/image, so
neither was in the comparison set.

Fixed this round: a positioned (`absolute`/`fixed`) element with a
filled background or a drawn border now counts as content for overlap
purposes too — a filled box contributes its full rect, a border-only
element contributes only the thin strip each drawn edge actually
occupies (not its whole bounding box, which would false-positive on any
intentional hairline frame around a card). Two decoration-only elements
overlapping each other is not flagged (legitimate pattern: fanned
cards, watermarks) — only flagged when at least one side is real
text/image content, which is the actual bug class this targets.

Verified with a synthetic repro (a flow paragraph deliberately
overflowing into a bordered absolute footer — correctly fails now) and
a full scan of every poster file in the repo, confirming zero new false
positives against the existing corpus (one pre-existing, unrelated
finding in `_capability-test-hero-asymmetric-b.html` is unchanged
before/after this change).

**Known remaining limitation:** this checker still can't verify design
quality, QR scan size (`design-system/components.md` #6's 0.75in
minimum is not automated — caught by hand this round, see prior
summary), or whether a flagged contrast ratio matters in context (e.g.
a logo's own internal color against a background it was never designed
to sit on). It is a mechanical-defect catcher, not a design reviewer —
every screenshot still needs an actual human look before anything ships.

## Accepted, not fixed

- `artwork_contrast` reports a WARN-level, non-blocking info note on
  the official SHL logo's light rose/mauve interior tone against a
  white/near-white background (1.66-1.72:1) on 2 of the 6 files. This
  is a color internal to the genuine logo asset itself, which the
  project does not alter — it's not something to "fix" without
  changing the actual brand logo. Flagging it here rather than quietly
  passing it.

## Outstanding, not yet automated

- QR code minimum render size (0.75in per `components.md` #6) has no
  automated check — verified by hand this round on all 6 (0.78in).
  Worth adding to the pipeline before the next flyer type ships.

## Bottom line

All 6 capability-test flyers are technically sound: every automated
check passes, every profile pair is clean, exports are correct, and
every issue a fresh-eyes review found has been fixed and re-verified —
not just patched, but confirmed against the specific defect. This
clears the production-system validation gate the Master Execution
Directive set before starting the Three Cs project.
