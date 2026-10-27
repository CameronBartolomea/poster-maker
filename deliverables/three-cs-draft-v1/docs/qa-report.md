# QA Report — Three Cs Realtor Infographic

Status: **draft, pending Cameron's explicit approval.** Nothing here
has been sent, posted, or printed.

## Automated checks (all 4 files: front/back x Cameron/Robert)

| File | compliance | copy | layout | artwork_contrast | brand |
|---|---|---|---|---|---|
| front, Cameron | pass | pass | pass | pass | pass |
| front, Robert | pass | pass | pass | pass | pass |
| back, Cameron | pass | pass | pass | pass | pass |
| back, Robert | pass | pass | pass | pass | pass |

Full detail is in `audit/flyer-log.json` in the repo (entries #53-59),
including intermediate failures that were found and fixed, not hidden:
an early front draft failed `compliance` (no NMLS/EHO reference at
all, fixed with a small secondary disclosure line) and an early back
draft failed `brand` (missing the logo entirely, fixed).

## Profile-pair cross-contamination check
`scripts/profile-pair-check.js` confirms zero cross-contamination
between the Cameron and Robert versions on both sides -- no wrong name,
license number, email, phone, QR code, or headshot in either file.

The front intentionally carries only name and NMLS by design (full
contact lives on the back, which the front explicitly points to) --
the checker was extended with a `--owner-fields` flag to validate that
correctly, rather than either forcing unwanted contact clutter onto the
front or skipping the check. The checker's default behavior (used for
every other flyer in the repo) was verified unchanged.

## Print verification
All 4 PDFs confirmed at true 8.5in x 11in (612x792pt) via
`scripts/export.js --pdf`. The merged double-sided PDFs
(`three-cs-cameron-print-ready.pdf`, `three-cs-robert-print-ready.pdf`)
are each 2 pages at the same confirmed dimensions.

## Independent creative review
A separate agent with no exposure to how this was built reviewed the
front and back screenshots fresh and critically. Initial verdict:
front needed a specific fix, back needed specific fixes, neither
needed a rebuild. Four issues were raised:

1. Front: accent-bar colors across the three panels didn't read as a
   deliberate progression. **Fixed** -- rebuilt to escalate in width
   and weight on one color story.
2. Front: dead gap between headline and first panel. **Fixed.**
3. Back: panels 01 and 02 were visually too similar, breaking the
   front's escalating-intensity logic. **Fixed** -- panel 02 is now
   dark charcoal with white text.
4. Back: the exclusive-agreement compliance callout was a dense
   paragraph, the hardest part of the page to scan in a live
   conversation. **Fixed** -- rewritten as a bolded headline plus three
   short lines.

All four fixes were re-verified against the automated pipeline after
the edit (not just visually eyeballed).

## Known, accepted, non-blocking item
`artwork_contrast` reports a low-contrast note on the official SHL
logo's own internal light rose tone in some contexts. This is a color
intrinsic to the genuine brand logo asset, not something this project
alters.

## What a human still needs to check before approval
Automated checks catch mechanical defects (missing disclosures,
banned phrases, clipped or overlapping elements, logo misuse). They do
not and cannot certify: whether the Three Cs copy itself is the right
copy, whether the compliance language is legally sufficient for your
brokerage and state, or whether the overall piece is something you
actually want to hand to real estate agents. That judgment is yours.
