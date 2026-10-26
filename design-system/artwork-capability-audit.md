# Artwork capability audit — original illustration, infographics, and editorial composition

Written in response to direct feedback that the 3 layout-family concepts
(`concept-a/b/c`, see `concept-comparison-v1.md`) still read as
corporate flyers with basic icons and unused space — a fair
assessment. Those three proved the system could vary *structure*. They
did not prove it could produce *original artwork*, because the only
artwork capability that existed was the hand-drawn line-icon set in
`icons.svg` — clean, but simple single-color line marks, not
illustration. This document is an honest audit of what was actually
missing, what was tested this round, what works, and what still falls
short. Every capability below is marked tested or untested — nothing
here is claimed as working without a test actually run in this session.

## What existed before this audit

- **Hand-drawn SVG line icons** (`design-system/icons.svg`, 7 marks).
  Good for a small visual anchor (a checkmark, a pin, a clock) at
  consistent weight and color. Not capable of illustration, narrative,
  texture, depth, or anything a viewer would call "artwork" rather
  than "a UI icon."
- **CSS-only composition**: geometry (diagonal clips, grids, flex
  layouts), type, color, and those line icons. No raster images, no
  illustration, no photography in any built flyer to date except the
  brand headshots/logos/QR codes under `assets/`.
- **No image-generation integration of any kind.** This is the actual
  gap behind "generic AI-looking flyers" — there was no way to produce
  a real illustrated visual, only ways to arrange text and simple
  shapes.

## What was tested this round

### 1. Canva AI image generation (`mcp__Canva__generate-image`) — TESTED, WORKS

This Claude session has a Canva connector available. I generated three
images in a deliberate narrative sequence (a seed, a young rooted
sprout, a full bloom) using detailed prompts that pin down style (flat
vector, bold outlines, geometric, no realism, no clipart, no gradient)
and a brand-adjacent palette (brick red / charcoal / green). All three
generated successfully and were retrievable as real local PNG files
(confirmed by reading them off disk, not just viewing a preview), which
means they can be committed to `assets/` and referenced from a
self-contained poster HTML file exactly like any other brand asset.

**What this actually buys the system:** genuinely illustrated,
editorial-style artwork — the thing `icons.svg` cannot produce — as a
real, composable asset in the existing git-tracked, self-contained-HTML
workflow. This is the single biggest capability gap this audit found,
and it's now closed, not just diagnosed.

**Tested limitations, not assumed ones:**
- **Resolution.** Every generated image came back at 200x200px. That's
  fine for a screen/digital composition or a smaller supporting
  illustration, but far short of what an 8.5x11in flyer needs at
  print-ready 300dpi (which wants roughly 2550x3300px for a full-bleed
  image, or still several hundred px even for a 3in illustration panel
  at good resolution). This needs a real fix — either a higher-
  resolution export path from Canva (not yet found/tested) or
  committing to using generated illustrations only as moderate-sized
  supporting elements, never full-bleed hero art, until resolution is
  solved. Flagging this rather than quietly shipping soft print output.
- **Style consistency across a series.** Three prompts built to match
  (explicitly referencing "same visual style as a seedling-sprout
  illustration in the same series") produced images that are
  recognizably one family but not pixel-consistent — outline weight,
  exact palette saturation, and especially background tone drifted
  slightly between images (visible as a faint box around the middle
  image before I corrected it with a matched background wrapper in
  CSS). Hand-drawn SVG icons don't have this problem because they're
  authored, not generated. For a single hero illustration this is a
  non-issue; for a matched set (like this 3-step test), it needs either
  tighter prompt engineering, background removal (see below), or
  accepting hand-authored SVG for anything that must be pixel-exact
  across a series.
- **Not an editable vector.** These are raster PNGs. They can't be
  recolored, re-stroked, or resized without quality loss the way
  `icons.svg` symbols can. For anything that needs to adapt to
  different brand colors or scale from a business card to a poster,
  the hand-drawn SVG approach is still the right tool — AI illustration
  and hand-drawn vector icons are complementary, not a replacement for
  each other.

### 2. Background removal for clean compositing (`scripts/remove-bg.py`, rembg) — TESTED, PARTIAL

To fix the background-tone mismatch above properly (not just paper
over it with a matching CSS wrapper), I tried `rembg` background
removal, which was already in the repo as a documented but
never-actually-run capability. `pip install` and the model download
(1.02GB from a GitHub release) both completed successfully, which at
least confirms the network path and package work. The actual background-removal inference was killed by the OS (exit
code 137 — out-of-memory, not a timeout) partway through, both run in
the foreground and backgrounded. So this is a **confirmed non-working
capability in this environment**, not just an untested one: the
package installs and the 1GB model downloads fine, but the model
appears too large to actually run in this session's memory budget.
Reporting it as failed rather than quietly dropping it, since
`scripts/remove-bg.py` already existed as a documented capability and
this is the first time it's actually been exercised end-to-end.
Fixing the background-tone mismatch in the meantime relies on the CSS
background-matching wrapper used in the proof of concept below, or on
tighter prompt-level background control (e.g. explicitly requesting a
specific flat background color rather than "warm off-white").

### 3. Canva `create-design` / `generate-design-structured` — NOT TESTED (deliberately)

These generate a complete, editable design hosted inside Canva, not an
asset file. I did not test them as the primary path for SHL flyers
because they're a structural mismatch with how this repo works: every
flyer here is a self-contained, git-tracked HTML file that runs
through `compliance-check.js` / `copy-lint.js` / `layout-check.js` /
`audit-log.js` automatically. A design generated and living inside
Canva sits outside all of that — no compliance flagging, no copy lint,
no layout-geometry check, no entry in `audit/flyer-log.json`. Using
`generate-image` for individual illustration assets and keeping
composition/layout in hand-written HTML/CSS preserves the whole QA and
audit pipeline; using `create-design` for the whole flyer would mean
rebuilding that pipeline around Canva's format, or losing it. Not
ruling it out permanently, but it's a bigger structural decision than
this audit's scope, and I'm not going to claim I tested something I
deliberately didn't run.

## Proof of concept

`posters/_capability-test-seed-sprout-bloom.html` — a neutral 3-step
brief ("seed → growth → bloom," chosen specifically because it has
nothing to do with mortgage content, so this stays clearly a system
capability test, not a flyer) built using the three generated
illustrations above, composed with:
- An editorial headline and a flow of three large (3in) illustrations
  connected by a simple directional arrow motif
- Oversized numerals as the only "data," no body paragraphs anywhere
- One-word labels (Seed / Growth / Bloom), not sentences
- A visible "capability test, not a deliverable" banner so it can never
  be mistaken for approved work if it's ever found outside this chat

This passes `layout-check.js` cleanly (confirmed; the first draft had
a real whitespace gap between the headline and the image row, fixed by
tightening vertical spacing rather than leaving it). See
`audit/flyer-log.json` for the logged entry (`--type capability-test`).

## Honest comparison to professional design references

Judged against what separates premium editorial/infographic work from
a template (concrete use of scale and asymmetry for hierarchy,
bespoke/non-stock imagery, restraint in what's on the page, a
composition that couldn't be swapped for any other brand's without
losing meaning):

**What actually improved:** the artwork itself. A generated illustration
of a rooted sprout with visible roots in cutaway soil is doing real
visual communication that no line icon in this system could do before.
This is a genuine capability gain, not a cosmetic one.

**What did not improve, and should be named rather than glossed over:**
the *composition* of the proof-of-concept is still a conventional
"three equal boxes connected by arrows" infographic pattern — one of
the most common infographic templates that exists. Swapping generic
line icons for AI-generated illustrations inside that same template
closes the artwork gap but does not, by itself, close the editorial-
composition gap the original critique also named (bold asymmetry,
oversized purposeful elements, restrained but intentional whitespace).
A genuinely premium version of this same content might break the
three panels out of equal-sized boxes entirely, let one illustration
dominate at a different scale than the other two, or run the sequence
diagonally instead of left-to-right. That's the next thing to test,
not something this proof of concept already solved.

## What this proves and doesn't

**Proves:** the system can now produce genuine illustrated artwork
(tested, working, with real limitations documented rather than
assumed), that it can be composited into the existing self-contained-
HTML / git-tracked / automated-QA workflow without breaking any of it,
and that a 3-step idea can be told almost entirely through art direction
instead of paragraphs.

**Does not prove:** that resolution is print-ready (it isn't yet, at
200x200px per image), that style consistency across a multi-image set
is solved (background removal is the likely fix, installed but not yet
confirmed working), or that composition itself has reached the
"couldn't be any other brand's flyer" bar — that's a design-direction
problem, not a tooling problem, and swapping in better artwork doesn't
automatically solve it.
