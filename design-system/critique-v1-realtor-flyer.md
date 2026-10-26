# Diagnostic: why the v1 realtor-partner flyer reads as generic

`posters/shl-realtor-partner-flyer.html`, as it stands, is a legitimate
negative reference. This is a root-cause analysis, not a "make it
prettier" pass — the goal is to find what in the *system* produced this
result, so the next flyer isn't just this one with different colors.

## What's actually wrong with it

1. **It has no artwork.** Every element on the page is either text or a
   flat-colored rectangle (the header band, the chips, the contact
   card). There is nothing on the page that required a design decision
   beyond "put text in a box." A left red border standing in for an
   icon is not visual communication, it's a bullet point wearing a
   costume.

2. **It's one layout family, and the system only had one.**
   `design-system/components.md` (v1) defined exactly one composition:
   header band → headline → 2x2 text grid → chip row → contact card.
   Every section is a horizontal stripe, stacked top to bottom, same
   margin, same rhythm. There was never a second layout family to pull
   from, so there was never a decision point where a different
   structure got considered and rejected. It wasn't chosen over
   alternatives. It was the only thing the system could produce.

3. **Hierarchy is doing font-weight's job, not composition's job.** The
   only tool used to signal "this matters more" was bumping font-size
   and bolding. Scale jumps 40px, 17.5px, 13.3px, 12px, done. Real
   editorial hierarchy uses position, scale contrast that's actually
   dramatic (not 40 vs 17), white space as a signal, and asymmetry. The
   v1 flyer is symmetric and evenly paced almost everywhere, which
   reads as safe/template rather than art-directed.

4. **The "infographic-first" rule in `templates/flyer-schema.md` existed
   on paper and was never applied.** I wrote the rule, then built a
   flyer that is four text paragraphs with numbers in front of them. A
   number is not an infographic. Nothing on the page can be understood
   faster by looking than by reading — which is the opposite of what
   that rule asks for.

5. **I generated one direction and shipped it.** The actual process
   that was supposed to happen (`templates/flyer-schema.md`, "process
   for a new/substantial flyer request," step 1: draft 2-3 materially
   different concepts) never happened on the first build. I went
   straight to a single HTML file and then iterated on *bugs* in that
   one direction (overlapping chips, clipped email), not on whether the
   direction itself was right. Bug-fixing a mediocre layout produces a
   bug-free mediocre layout.

6. **The absolute claim problem.** "Closes on time, every time" is
   stated as fact with no support. Unrelated to the visual critique,
   but worth flagging: absolute performance claims in mortgage
   marketing are a compliance risk independent of whether they're true,
   and the compliance linter doesn't catch this class of claim (it only
   catches missing disclosures and rate numbers, not overclaiming). Noted
   as a gap below.

## What the system was missing (not just this flyer)

- **No artwork/iconography capability at all.** Nothing to draw with
  besides text, flat rects, and CSS gradients.
- **No enforcement that a flyer use more than one layout family.** The
  rule existed in prose; nothing checked it.
- **No actual concept-comparison step.** The process doc described one;
  it was never run.
- **No check for absolute/overclaiming language** in the compliance or
  copy linter.

## What this diagnostic changes

See `design-system/components.md` v2 additions (icon-driven components,
two new layout families) and `design-system/icons.svg` (the actual
artwork capability that didn't exist before). Three structurally
different test compositions built against the same content brief as
this flyer are in `posters/concept-*.html` — explicitly test/diagnostic
pieces, not approved designs and not the Three Cs project.
