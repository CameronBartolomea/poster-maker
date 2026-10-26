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

## 8. Process / Timeline (not yet built — planned)

For "how it works" or "steps to close" educational flyers. Horizontal
numbered steps with connecting line, or vertical for narrower formats.
Build on first real use, then promote the pattern here.

---

## Layout families

Don't reuse the same single-column stacked layout for every flyer type.
At minimum, vary by:
- **Stacked editorial** (what's built so far — header band, headline,
  grid, footer) — good for value-prop / partner flyers.
- **Split hero** — large image or stat on one side, copy on the other —
  good for listing/open-house flyers with a property photo.
- **Infographic grid** — the whole page is the visual (numbered steps,
  icons, big numbers) with minimal paragraph text — good for Realtor
  education pieces per the infographic-first rule.
