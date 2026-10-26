# SHL Component Library

Reusable layout patterns, extracted from built flyers. Since posters are
single self-contained HTML files (no shared includes), these aren't
literal imports — copy the markup + CSS block you need into the new
poster and adjust content. Each component lists its spacing/sizing rules
so instances stay consistent across different flyers.

All components assume `design-system/tokens.css` values are in scope
(copy the relevant `--shl-*` variables into the poster, or inline the
raw values).

---

## 1. Editorial Headline System

Eyebrow label (small caps, letter-spaced, brand red) → large headline
(Outfit 800, one phrase in brand red for emphasis) → supporting
paragraph (regular weight, muted body color, max-width capped so lines
don't run too long).

```html
<div class="eyebrow">Section Label</div>
<h1>Plain statement with <em>the one phrase</em> that matters most.</h1>
<p class="sub">One or two sentences of support. Keep it concrete, not promotional.</p>
```
```css
.eyebrow { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: var(--shl-red); font-weight: 600; }
h1 { font-weight: 800; font-size: 40px; line-height: 1.08; color: var(--shl-near-black); letter-spacing: -0.5px; }
h1 em { font-style: normal; color: var(--shl-red); }
.sub { font-size: 15.5px; line-height: 1.55; color: var(--shl-body-muted); max-width: 6.6in; }
```
**Rule:** exactly one phrase in brand red per headline, not every other
word. Restraint is what makes the emphasis read.

## 2. Numbered Value-Prop Grid (2x2 or 1x4)

Four (or fewer) short benefit statements, each with a number tag, bold
sub-head, one-sentence support. Left border in brand red marks each
entry instead of a bounding box (avoids the "too many boxes" problem).

```html
<div class="props">
  <div class="prop">
    <div class="num">01</div>
    <h3>Short Benefit Title</h3>
    <p>One sentence explaining it concretely.</p>
  </div>
  <!-- repeat -->
</div>
```
```css
.props { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2in 0.4in; }
.prop { border-left: 3px solid var(--shl-red); padding: 2px 0 2px 16px; }
.prop .num { font-size: 12px; letter-spacing: 2px; color: var(--shl-red); font-weight: 600; margin-bottom: 4px; }
.prop h3 { font-size: 17.5px; font-weight: 600; color: var(--shl-near-black); margin-bottom: 4px; }
.prop p { font-size: 13.3px; line-height: 1.5; color: var(--shl-body-muted); }
```

## 3. Chip List (programs, tags, eligibility items)

Use for an unordered list of short terms (loan programs, eligibility
criteria). Not a decorative badge system, just a label pattern.

```html
<div class="chips">
  <div class="chip">Conventional</div>
  <div class="chip">FHA</div>
</div>
```
```css
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { font-size: 13px; font-weight: 500; color: var(--shl-charcoal); background: var(--shl-charcoal-tint-2); border: 1px solid var(--shl-charcoal-tint-3); padding: 7px 14px; border-radius: var(--shl-radius-sm); }
```

## 4. Contact Footer Card

Dark card (near-black), contact name/title/license numbers on the left,
phone/office/email on the right, QR vCard on the far right. This is the
standard closer for any flyer with a named point of contact.

See `posters/shl-realtor-partner-flyer.html` `.contact` block for the
full implementation (handles 3-column flex layout without overlap —
this took two iterations to get right, don't rebuild from scratch, copy
it).

**Rule:** always pull the QR from `assets/brand/qr/` (existing vCards)
rather than regenerating one for a person's own contact info.

## 5. Compliance Disclosure Footer

Small Equal Housing badge + address/website line, centered, below the
contact card or at the page bottom. This is NOT optional — see
`scripts/compliance-check.js`.

```html
<div class="footer-note">
  <img class="eho-badge" src="../assets/brand/badges/equal-housing-opportunity.png" alt="Equal Housing Opportunity">
  <span>2555 Townsgate Rd, Suite 200, Westlake Village, CA 91361 &middot; strategichomeloans.com</span>
</div>
```
```css
.footer-note { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 9.5px; color: var(--shl-charcoal-tint-1); text-align: center; }
.footer-note .eho-badge { width: 20px; height: 20px; flex-shrink: 0; }
```

## 6. QR Module

Small white-padded square with a one-line caption underneath, sized
~0.85in for print legibility at arm's length.

```html
<div class="qr-module">
  <img src="../assets/brand/qr/qr-cameron-vcard.png" alt="Scan to save contact">
  <div class="qr-caption">Scan to save<br>my contact</div>
</div>
```
```css
.qr-module img { width: 0.85in; height: 0.85in; background: #fff; padding: 4px; border-radius: var(--shl-radius-sm); }
.qr-caption { font-size: 9px; color: var(--shl-charcoal-tint-1); text-align: center; line-height: 1.3; }
```
**Rule:** QR must render at least 0.75in square in print to stay
reliably scannable at arm's length — don't shrink it to fit a layout.

## 7. Comparison Table (not yet built — planned)

For "Program A vs Program B" flyers (e.g. FHA vs Conventional). Two or
three columns, row labels on the left, brand-red highlight on the
recommended/featured column. Build on first real use, then promote the
pattern here.

## 8. Vertical Timeline / Process Flow

Built and tested in `posters/concept-c-timeline.html`. A single
continuous connecting line runs down the page; each step is an icon in
a circular node sitting on the line, with its heading/body to the
right. The final node can be styled as the call-to-action/contact
block (dark fill) rather than bolting a separate contact card onto the
bottom — the contact becomes the timeline's last stop, not an
afterthought.

```html
<div class="timeline">
  <div class="node">
    <div class="dot"><svg class="icon"><use href="#icon-name"/></svg></div>
    <div class="ntxt"><h3>Step title</h3><p>One sentence.</p></div>
  </div>
  <!-- repeat, last node can use .node.final for a dark CTA/contact style -->
</div>
```
```css
.timeline { position: relative; }
.timeline::before { content: ""; position: absolute; left: 34px; top: 10px; bottom: 10px; width: 2px; background: var(--shl-charcoal-tint-3); }
.node { position: relative; display: flex; gap: 0.28in; padding: 0.18in 0; align-items: flex-start; }
.node .dot { flex-shrink: 0; width: 68px; height: 68px; border-radius: 50%; background: #fff; border: 2.5px solid var(--shl-red); color: var(--shl-red); display: flex; align-items: center; justify-content: center; z-index: 1; }
.node .dot svg.icon { width: 36px; height: 36px; }
```
**Rule:** the dot size (≥60px) and icon size (≥32px) inside it must stay
large enough to read as the real visual anchor of each row, not a small
bullet. Use for "how it works," "what happens when you refer a client,"
and other sequential/process content.

## 9. Icon-Driven Grid

Built and tested in `posters/concept-b-icon-rail.html`. Large (56px+)
hand-drawn icons from `design-system/icons.svg` are the primary visual
element of each grid cell — the icon sits above the heading, not beside
it as a small accent. Pair with a full-height sidebar rail (see below)
rather than a horizontal content band, so the page reads as two real
zones instead of stacked stripes.

```html
<div class="icongrid">
  <div class="icard">
    <svg class="icon"><use href="#icon-name"/></svg>
    <h3>Benefit title</h3>
    <p>One sentence.</p>
  </div>
  <!-- repeat -->
</div>
```
```css
.icongrid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35in 0.4in; }
.icard svg.icon { width: 68px; height: 68px; color: var(--shl-red); }
```
**Rule:** this component only exists because `design-system/icons.svg`
exists — don't fall back to a colored-border bullet (component #2)
just because it's faster to copy. If a flyer's content is genuinely
icon-able (a short, concrete benefit), use the icon; component #2 is
for when it isn't.

## 10. Full-Height Sidebar Rail

Built and tested in `posters/concept-b-icon-rail.html`. A dark column
running the full height of the page (not a band at top or bottom)
holding secondary content — loan programs list, contact block, QR —
so the main content area isn't forced into horizontal stripes. This is
the direct alternative to component #4 + #3 stacked at the page bottom.

**Rule:** when using this, the contact block inside the rail must be
sized for the rail's actual width (usually 2–2.5in) — don't copy
component #4's three-column flex layout at full size into a narrower
column; stack name/title, then phone/email rows, then QR vertically
instead. (This is a real bug `layout-check.js` caught during the
concept-a/b/c build: a contact component reused at its original width
inside a narrower column pushed the QR code off the page.)

## 11b. Real Logo Mark (use instead of recreating the wordmark)

**This supersedes every earlier instance of typing "STRATEGIC HOME
LOANS" as styled text.** An audit of every flyer built in this repo so
far (the realtor-partner flyer and all three round-1 concepts) found
that none of them use the actual logo file — all of them recreate the
wordmark in CSS, which means none of them show the real house+puzzle-
piece icon or the "Financing that fits perfectly" tagline at all. Use
the real asset:

```html
<img src="../assets/brand/logo/shl-logo-full-color.png" alt="Strategic Home Loans">
```

- `shl-logo-full-color.png` (1248x556px) — default, light backgrounds.
- `shl-logo-compact.png` (306x306px) — square icon+wordmark, small
  placements.
- `shl-logo-wordmark-red.png` — text-only, when the house icon is
  already present elsewhere on the page.
- On a dark background, `filter: brightness(0) invert(1)` renders it
  white — tested and works for this logo (it's a solid black/red
  shape with no internal gradient), but check visually before assuming
  the same trick holds for a different asset.
- Never recreate the wordmark, icon, or tagline in CSS text. If a
  placement genuinely needs just text (e.g. it's too small for the
  icon to read), use `shl-logo-wordmark-red.png`, not hand-typed text.

## 11c. Hero-Scale Asymmetric Composition

Built and tested in `posters/_capability-test-hero-asymmetric-a.html`
(portrait) and `_capability-test-hero-asymmetric-b.html` (landscape —
a genuinely different print dimension, not the same page rotated).
The alternative to "three equal boxes": one illustration is given real
dominant scale (bleeding off one or more edges), and everything else
in the composition is sized in relation to it rather than matched to
it.

**Core moves, each tested:**
- **Scale as narrative.** A sequence doesn't have to be three equal
  panels — showing it as small-then-larger-then-hero-scale (concept A)
  makes scale itself carry the "building toward something" idea.
- **Diagonal placement.** Rotating/offsetting the hero art off the
  page's horizontal-vertical grid (concept B, -8deg) reads as more
  art-directed than anything squared to the frame.
- **Typography as a graphic layer, not just a label.** An oversized
  numeral or word, rendered at several hundred px and placed behind
  the artwork (not beside it, not small), does real visual work.
  Letting it bleed off a page edge is a legitimate intentional crop,
  not a bug — but note it explicitly wherever it's used, because
  `layout-check.js` will correctly flag it as clipping and someone
  reviewing the audit log needs to know it's deliberate.
- **Curved/diagonal connective paths** instead of a straight arrowed
  row, when showing a sequence (concept B's dashed arc).

**Rule: hero art at this scale must be vector, not the raw raster
illustration.** Testing (see
`design-system/artwork-capability-audit.md`, Round 2) found a
Canva-generated illustration (200x200px source) visibly softens above
roughly 2.5-3in at 300dpi. For anything larger, trace it to a vector
silhouette first (see the vectorization workflow below) rather than
stretching the raster.

## 11d. AI-Illustration-to-Vector Workflow (for hero-scale artwork)

Tested and working (`design-system/artwork-capability-audit.md`,
Round 2). Converts a Canva-generated raster illustration into a
resolution-independent vector silhouette, for any placement larger
than the raster's safe size (~2.5-3in at 300dpi from a 200px source).

```bash
# 1. Generate the illustration (mcp__Canva__generate-image), save the
#    real file to assets/ — confirm it's a real file, not just a preview.
# 2. Threshold to pure black/white:
convert assets/path/to/illustration.png -colorspace gray -threshold 50% /tmp/trace-input.pbm
# 3. Trace to true vector SVG:
potrace /tmp/trace-input.pbm -s -o /tmp/traced.svg
# 4. Copy the <g transform=...>...</g> block (NOT the whole file) into
#    the poster's own inline <svg viewBox="0 0 200 200">, recolored
#    with `color: var(--shl-red)` (or charcoal) via `fill="currentColor"`.
```

**Hard rule: never hand-edit the path's numeric coordinates.** A
mistake made building concept B (documented in the audit doc) came
from manually multiplying path coordinates to rescale them into a
different viewBox — a transcription error that silently produces
garbled artwork. Copy the `<g>` block verbatim and change the `viewBox`
to match its native `0 0 200 200` coordinate space; scale the artwork
with CSS (`width`/`height` on the wrapping `<svg>`), never by rewriting
numbers inside the path data. If a different coordinate space is
genuinely needed, do the transform with a script, not by hand.

**Trade-off to state every time this is used:** the trace is a single-
color silhouette, not the illustration's original flat-color palette.
Use the raster illustration (at safe size) when color detail matters;
use the vector trace when scale and crispness matter more than color.
A visually busy source image (fine detail like soil texture or roots)
produces a noisier trace with more small stray sub-paths than a
cleaner source — simpler illustrations trace better.

## 12. Full-Color Vector Illustration Workflow

Tested and working (`design-system/artwork-capability-audit.md`,
Round 3). The round-2 silhouette trace (#11d) is a single color. This
is the full-color alternative: `scripts/vectorize-color.py` separates
a raster illustration's foreground from its background by color
distance, clusters the foreground into N flat color regions (k-means),
traces each region separately with potrace, and recombines them into
one multi-color SVG.

```bash
python3 scripts/vectorize-color.py assets/path/to/illustration.png assets/path/to/illustration-color.svg \
  --colors 5 --turdsize 6
```

Reference it like any other image: `<img src="...-color.svg">`. Do
NOT hand-edit or inline-paste its path data — reference the file
directly, or if it must be inlined, do so with a script that copies
the content verbatim, never by typing or retyping path coordinates.
(A hand-transcription of this exact SVG content into a poster during
Round 3 silently truncated and corrupted several of the color layers
— caught before shipping by a script that diffed the inlined path
data against the source file byte-for-byte, not by eye. That check is
cheap and worth re-running any time vector path data is copied by
hand instead of referenced as a file.)

**Honest trade-off, state every time this is used:** this posterizes
— a source with smooth gradient shading becomes flat color bands, and
the resulting colors come from whatever the source image actually
contains, not from `tokens.css`. It is not a substitute for a real
illustration set designed in the brand's two colors; it is a tested
way to get genuine multi-color vector art (not a silhouette) out of a
flat-style source. Use the silhouette trace (#11d) when a single
brand-color mark is wanted; use this when the illustration's own
color is part of what it communicates.

**Scale discipline:** full color does not excuse oversized decoration.
Round 3 exists specifically because a round-2 hero illustration was
rejected for being large without communicating anything beyond its
own size. Cap illustration size to a fraction of the page (see
`_capability-test-color-feature.html`, capped at 30% of page width)
and pair it with content that is actually about what it depicts, not
generic copy next to a picture.

## 13. Artwork Contrast & Brand Checks (automated QA, not a layout component)

Not a visual pattern — a required QA step. `scripts/artwork-
contrast-check.js` and `scripts/brand-check.js` run automatically as
part of `scripts/audit-log.js add` (alongside the pre-existing
compliance/copy/layout checks) and should never be skipped or run in
isolation as a substitute for that. artwork-contrast-check samples the
real rendered pixels around every `<img>`/`<svg>` above a minimum size
and flags artwork that reads as nearly invisible or muddy against its
background — built specifically because a dark illustration on a dark
background (round 2) passed every prior check silently. brand-check
verifies a real logo file is used (not recreated as styled text), its
rendered proportions match the source, and nothing intrudes on its
clear space. See `design-system/artwork-capability-audit.md` Round 3
for what each one actually catches and its honest limitations (both
are severity signals from a geometric/pixel heuristic, not a
certification of good design — a human/AI visual read of the actual
screenshot is still required before anything ships).

## 11. Watermark / Fill Graphic

Built and tested in `posters/concept-a-split-stack.html`. When a layout
has a real empty zone that composition and copy don't naturally fill
(not decorative padding — an actual structural gap), a single icon from
`icons.svg` enlarged to 3in+ at low opacity (0.04–0.08, brand color) can
fill it intentionally. This is a last resort, not a default: the first
choice is always to fix the underlying proportions (more generous type,
rebalanced columns, added real content) rather than paper over empty
space with decoration.

```css
.markwrap { width: 3.3in; height: 3.3in; opacity: 0.055; color: var(--shl-red); }
```
**Rule:** never use this to avoid rethinking a layout that's genuinely
unbalanced — it's for the rare case where whitespace is structurally
unavoidable and would otherwise look like a bug, not a design choice.

---

## Layout families

Don't reuse the same single-column stacked layout for every flyer type.
Four families now exist with real built-and-QA'd examples (not just
descriptions):

- **Stacked editorial** (`posters/shl-realtor-partner-flyer.html`) —
  header band, headline, grid, footer, all horizontal stripes. Good for
  a quick value-prop flyer, but this was the ONLY family that existed
  before this diagnostic pass, and it's the weakest of the four for
  anything meant to look art-directed rather than templated — see
  `critique-v1-realtor-flyer.md`.
- **Split diagonal / stat-stack** (`posters/concept-a-split-stack.html`)
  — asymmetric non-rectangular column split, oversized numerals doing
  hierarchy work. Good when there's a clean 4-part breakdown and you
  want a geometric, editorial feel.
- **Icon grid + full-height rail** (`posters/concept-b-icon-rail.html`)
  — see components #9 and #10. Good for value-prop / partner flyers
  where the icon system should be the dominant visual, not text.
- **Vertical timeline** (`posters/concept-c-timeline.html`) — see
  component #8. Good for "how it works" / process / "what happens
  when you refer a client" content, and for Realtor education pieces
  per the infographic-first rule in `templates/flyer-schema.md`.
- **Hero-scale asymmetric** (`posters/_capability-test-hero-asymmetric-
  a.html` portrait, `_capability-test-hero-asymmetric-b.html`
  landscape) — see components #11c/#11d. One illustration given real
  dominant scale instead of equal-sized panels; use for anything where
  a single strong visual idea should carry the piece (a hero concept,
  a single key benefit, an educational piece built around one central
  metaphor) rather than a list of several equal items. **Caution:**
  both example files in this family were explicitly rejected by
  Cameron in round 3 — composition A for oversized art that didn't
  communicate, composition B for a contrast failure. They remain here
  as the documented reference for what NOT to do at this scale, not
  as approved examples to copy. See the color-vector feature column
  family below for the corrected version of this same idea.
- **Color-vector editorial list** (`posters/_capability-test-color-
  editorial.html`) — see component #12. A full-color vector
  illustration at a fixed, modest size (around 1.1-1.2in) replaces the
  numeral/bullet for each item in a list, directly integrated with its
  paragraph rather than floating as separate decoration. Good for a
  short numbered sequence (stages, steps, benefits) where the art
  should do real identification work without taking over the page.
- **Color-vector feature column** (`posters/_capability-test-color-
  feature.html`) — see component #12. One full-color illustration
  capped at roughly 30% of page width, paired directly with a callout
  specifically about what it depicts, plus a small muted strip showing
  the rest of a sequence for context. This is the corrected version of
  the hero-scale-asymmetric idea above: real visual presence for one
  illustration, without either of the two mistakes (no content tied to
  the art, or insufficient contrast) that got the original rejected.

**Enforcement, not just this list:** `scripts/audit-log.js add` takes
an optional `--layout-family <name>` flag. When passed, it checks the
new flyer's family against the most recently APPROVED flyer of the
same `--type` and prints a visible warning if they match — a nudge to
confirm the reuse is a deliberate choice, not the default fallback to
whichever layout is fastest to copy-paste. It's a flag, not a block
(consistent with how `compliance-check.js` flags rather than
certifies) — see `scripts/audit-log.js` usage comment for details. Pass
`--layout-family` on every `add` going forward so this has data to
check against.
