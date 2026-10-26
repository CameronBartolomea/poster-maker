# Concept comparison: 3 test compositions vs. the v1 realtor flyer

This is an honest design comparison, not a certified or objective score.
"Better" below means judged against the specific failures named in
`critique-v1-realtor-flyer.md` — it is a subjective visual read, written
down so the reasoning is checkable, not a quantified result. All three
concepts use the exact same content brief as
`posters/shl-realtor-partner-flyer.html` (same four value props, same
loan programs, same contact facts) so the comparison isolates
composition and art direction, not copy.

All three are test/diagnostic pieces. None are approved. None is the
Three Cs flyer.

## The baseline (v1 flyer)

One layout family (stacked horizontal bands), no artwork, hierarchy by
font-size alone, an unsupported absolute claim in the headline ("closes
on time, every time" — removed in all three concepts below and replaced
with a claim the business rules actually support).

## Concept A — `concept-a-split-stack.html`

**Structure:** asymmetric diagonal split. A dark 40%-width column with a
clipped diagonal edge holds the four value props as a vertical stat
stack with oversized red numerals; a white 60%-width column holds the
headline, loan programs, and contact.

**What's actually different from v1:** the diagonal clip-path is a real
geometric decision, not a rectangle with a colored background — it's
the first time this system has produced a non-rectangular composition.
The numerals (46px, weight 900) do real hierarchy work instead of just
being a small label next to a heading. The large pale partnership-icon
watermark in the lower right is new too — it's decorative, but it's
documented as fill for a layout gap rather than invented to pad the
page, and it ties back to the icon system instead of being a random
graphic.

**What's not better:** it's the most text-dense of the three despite
the diagonal — the stat stack is still four paragraphs, just
redistributed. The icon system is barely used here (one watermark); this
concept gets its improvement from geometry and type scale, not from the
artwork capability the critique specifically flagged as missing.

**A real bug this caught:** the first draft transplanted the v1 flyer's
three-part contact bar (name block + phone/email block + QR, side by
side) directly into this column without checking whether it fit. It
didn't — the column here is ~1.5in narrower than where that component
was designed, and the QR code rendered off the page edge.
`layout-check.js` caught it (`clipping` failure on both the QR image and
its label) before this ever reached a screenshot review. Fixed by
restructuring the contact block to stack vertically instead of
assuming the original's proportions.

## Concept B — `concept-b-icon-rail.html`

**Structure:** full-height dark sidebar (programs + contact, vertical)
on the right; a 2x2 icon-led grid as the main content on the left, icons
at 68px — real visual weight, not bullet decoration.

**What's actually different from v1:** this is the one that most
directly answers the "no artwork at all" finding. Four hand-drawn icons
sit at real size as the primary visual element of each value prop, not
a colored rule standing in for one. The full-height rail is a different
structural idea than a horizontal band — content fills the page
vertically instead of stacking in horizontal stripes top to bottom,
which was the exact failure mode item #2 in the critique names ("every
section is a horizontal stripe").

**What's not better:** there's a real whitespace gap below the icon
grid (roughly from the bottom of row two to the footer) that reads as
acceptable breathing room next to the dense rail, but is close to the
same "ran out of content" problem Concept A had before the fix — it's
tolerable here because the rail is visually busy enough to balance it,
but it's a judgment call, not a solved problem, and a longer brief might
expose it.

## Concept C — `concept-c-timeline.html`

**Structure:** single-column vertical process timeline. A connecting
line runs top to bottom; each value prop is a circular icon node on the
line; the contact block is the timeline's fifth and final node (styled
dark, using the partnership icon), not a separate component bolted onto
the bottom.

**What's actually different from v1:** this is the only one of the
three where the contact information is structurally integrated into
the page's narrative instead of being a separate "card" dropped at the
bottom — the headline reframes the whole page as a sequence ("what
happens when you refer a client"), and the layout follows that
sequence literally. It's also the only concept where an icon
(partnership) is doing double duty as both a value-prop marker and the
visual anchor for the call-to-action node. Of the three, this one
relies least on text alone for hierarchy — position on the line carries
real meaning.

**What's not better:** the connecting-line device is the most
"infographic-template-coded" move of the three — it's a recognizable
pattern (process timeline) rather than something genuinely bespoke to
mortgage lending, so it's a smaller creative swing than Concept A's
diagonal or Concept B's icon-grid-as-hero, even though it reads the
cleanest of the three as a composition.

## Honest overall read

All three pass `compliance-check.js`, `copy-lint.js`, and
`layout-check.js` cleanly (Concept A only after the contact-bar bug
above was fixed). All three are structurally distinct from each other
and from v1 — different grid logic, different placement of the contact
information, different use (or non-use) of the icon system — which is
the thing v1 never had: a second layout family to be chosen over.

If forced to rank for "closest to what the creative brief is actually
asking for" (bold typography, oversized purposeful graphic elements,
restrained whitespace, no fake data visualizations): **B and C are
stronger than A.** A's diagonal is a genuine structural idea but leans
on type scale more than artwork; B and C both make the icon system load
-bearing, which is the specific capability this diagnostic exercise was
built to prove out. This is a design opinion, not a test result — it
should be checked against Cameron's own reaction to the three
screenshots, not treated as settled by this document.

## What this does and doesn't prove

It proves the system can now produce three genuinely different
compositions from one content brief, that two of the three put the new
artwork system to real work, and that the automated layout checker
catches real structural bugs (not just the deliberate-breakage tests
run earlier) when a component gets reused somewhere it doesn't fit.

It does not prove these specific three layouts are the right ones for
a production flyer, and it does not replace Cameron's own visual
judgment on the actual screenshots.
