# Concept Comparison — Redesign Round 2

Cameron rejected the round 1 front (three escalating color-block
bands): "This is a typography exercise, not the visually compelling,
professional, artwork-driven resource I originally requested... The
artwork must actively explain the three-step progression."

Round 1's own creative review had evaluated execution quality of the
chosen direction, not whether the direction was ambitious enough as
*artwork*. That's the gap this round addresses.

## Research first

Before sketching anything, reviewed premium editorial infographic
design practice (conceptviz.app and general industry guidance on
illustration-led infographics). The takeaway that mattered most: for
one continuous story, a single illustration that carries the whole
narrative beats a modular card/grid layout. That's exactly round 1's
problem restated: three boxes split one idea into three unrelated
pieces instead of showing it happen.

## Three genuinely different directions, each built and rendered

All three replace color blocks with real vector line art, in the
hand-drawn stroke language already established in
`design-system/icons.svg` (thick rounded strokes, restrained 2-4
color palette, `currentColor`-style line work) — scaled up to be
actual artwork, not bullet-sized icons.

**Concept D — The Open Door.** A single tall doorway frame with the
door leaf drawn at three swing angles (barely cracked, half open,
fully open with a warm glow), like a motion study. Clean and on-theme,
but reads more like an abstract diagram of hinge angles than an
unmistakable "door" at a glance — the weakest of the three on "grasp
it in seconds."

**Concept F — One House.** One house, drawn once, read top to bottom
the way a page is already read top to bottom: a quiet marker at the
roofline (Compliment), one window that gets a soft look inside
(Clarify), and the door swinging open onto a warm lit path
(Contrast). Instantly recognizable as a house with no caption needed,
and it extends Strategic Home Loans' own house-roofline logo motif
instead of reaching for an unrelated metaphor.

**Concept G — The Trust Line.** An abstract flowing line that starts
flat and quiet, gains gentle energy in the middle, and resolves into
a confident bold sweep with a red flourish at the end. The most
"editorial magazine" of the three and genuinely elegant, but more
decorative than explanatory — it requires the labels to carry the
meaning rather than showing it.

Renders of all three: `templates/three-cs-concepts-v2/`.

## Selected: Concept F, "One House"

Chosen because it best satisfies Cameron's explicit bar: a Realtor
should grasp the concept within seconds, and the artwork itself
(not the labels) has to carry the three-step progression. A house is
a near-universal, zero-explanation image in this context, the
three moments are real architectural features of the same house
rather than three separate drawings, and reusing Strategic Home
Loans' own roofline motif ties it to the brand rather than borrowing
someone else's visual language.

Refined from the first F draft: enlarged the illustration
substantially, tightened the whitespace between header/art/footer,
and added thin leader lines from each marker (roofline, window,
door) out to its label — so the piece reads as one annotated
drawing, not two separate columns that happen to be near each other.

## Front copy, reworked

Cameron flagged "Contrast: Only once it's welcome" specifically as
not actionable. All three lines were rewritten to pair the
principle with something to actually do:

| | Before (round 1) | Now (round 2) |
|---|---|---|
| Compliment | "Respect the relationship first." | "Mean it. It costs you nothing." |
| Clarify | "Understand before you offer anything." | "Ask the one question that matters." |
| Contrast | "Only once it's welcome." | "Offer one real difference. Nothing more." |

The "only once it's welcome" / "only once the door's open" condition
didn't disappear — it's now carried by the artwork itself (the door
is drawn literally closed in positions 1 and 2) and restated plainly
on the back, rather than being the entire front-facing instruction on
its own.

## Back: natural conversation, less worksheet

- Rewrote the sample conversation for more natural, contraction-heavy
  phrasing ("Hey, thanks for coming by!" / "Yeah, I hear that a lot.")
  and gave the agent's final line a concrete, specific detail (a
  Friday update habit) instead of a generic claim — which also makes
  Contrast's "one real difference" concrete rather than abstract.
- Collapsed the compliance box from three dense paragraphs (including
  a full inline NAR citation) down to one bolded rule plus one short
  line, moving the full formal citation to the small-print legal line
  at the bottom where it belongs, so it isn't stated twice.
- Opened up vertical spacing throughout (bigger card padding, more
  margin between sections) so the page reads as generously laid out
  rather than packed.

## Known automated-check limitation, documented honestly

`artwork-contrast-check.js` flags the front's SVG illustration as a
contrast FAIL (1.09:1). This is a known limitation of that check's
method for sparse line art, not a real defect: the check averages
color across the element's full bounding box (then a 45% center
crop), and a hand-drawn line illustration is mostly empty page
background by area — the center crop in this specific composition
lands mostly on empty wall, diluting the real ink to near-invisible
in the average. The check's own comments already document this exact
failure mode for thin-stroke icons (raised the size threshold to 72px
for that reason) but hadn't been extended to cover large illustrations
that are *also* mostly negative space by design. Direct visual
inspection of both rendered PNGs (not just this check) confirms
genuinely strong contrast — black and red line work on white, no
legibility problem. Flagging this honestly rather than silently
overriding it; a future hardening pass on that script (sampling ink
pixels specifically, the way `layout-check.js` was hardened earlier
this project) would close the gap properly.

## Status

Not approved. Rendered for both Cameron and Robert, passing all other
automated checks (compliance, copy, layout, brand) and the
cross-contamination check. Awaiting Cameron's visual review of the
improved direction before anything moves toward final print files.
