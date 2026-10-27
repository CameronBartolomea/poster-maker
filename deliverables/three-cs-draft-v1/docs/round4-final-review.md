# Three Cs — Round 4 (Final) — Technical QA and Creative Review

This round replaces the round-3 flowchart front end to end, per Cameron's
direct feedback that (a) the visual quality still read as a procedural
worksheet rather than professional design, and (b) the decision logic
was ordered wrong.

## 1. Logic fix

Cameron's words: *"The current flowchart incorrectly places the
representation decision before Clarify. Correct this."*

Round 3 order (wrong): Compliment → decision ("signed, exclusive
agreement in place?") → STOP or continue → Clarify → decision ("do they
want to hear more?") → Contrast.

Round 4 order (as specified): **01 Compliment → 02 Clarify (the
representation question itself) → Representation Checkpoint (exclusive →
respect/stop; unclear → get a straight answer before continuing) → 03
Contrast (only once confirmed unrepresented and receptive).**

The Clarify step's quoted line IS the representation question now —
there's no separate, earlier decision asking the same thing a different
way. The checkpoint reads the answer Clarify just got. Contrast is
explicitly gated on both conditions (unrepresented and receptive) in one
line, not a second branching diamond.

NAR Code of Ethics Article 16, Standards of Practice 16-9 and 16-13,
re-verified directly against nar.realtor for this round (fourth time
across the project): 16-9 requires reasonable efforts to determine
whether a prospect is subject to a current exclusive agreement before
providing substantive services; 16-13 requires asking prospects directly
whether they're a party to an exclusive agreement, and bars knowingly
providing substantive services to a represented prospect except with
their representative's consent or at the prospect's own initiative. Both
are cited on the back, in one paragraph, below the tactical content —
not dominating the page.

## 2. What changed visually, and why

The round-3 flowchart (dashed decision diamonds, branch arrows,
rounded-rect step boxes) is gone. It's replaced with one continuous
device: a single vertical rail with four numbered nodes (gray → black →
red-exclamation → red), each tied directly to a step. The checkpoint is
a full-width dark band off the rail, not a diamond with two arrows — a
gate, not another node in a chain of identical shapes.

Checked against the reference set
(`deliverables/three-cs-draft-v1/docs/reference-analysis.md`):

- **One dominant graphic, not several small ones.** The rail is the only
  graphic device on the page. No icons, no separate arrow/arrowhead
  elements, no dashed boxes.
- **Clear visual progression.** The rail itself changes color and weight
  step by step (outlined gray → solid black → red checkpoint → solid
  red), so the escalation toward "this is the moment that matters" is
  visible without reading a word of copy.
- **Minimal front wording.** Each step is one short quoted line (under
  15 words) plus a four-to-seven-word note. The checkpoint band is the
  longest copy block on the page and it's two sentences.
- **A hook that reads in seconds**, borrowed in spirit from the
  references' own strongest move (the struck-through rate number): the
  objection itself, struck through, answered in three words directly
  below it.
- **Color used for meaning, not decoration.** Gray = routine, black =
  pivotal question, red = compliance gate and the payoff step. Same
  three brand colors throughout, no new colors introduced.

What it's still not trying to be: a single-stat hero like the
percentage-callout references. This piece teaches a four-part sequence,
not one number, so a short vertical progression is the honest structure
for the content — forcing it into a single giant statistic would
misrepresent what the piece is for.

## 3. Content fixes

- Front quotes shortened to the shortest real thing an agent would
  actually say — no instructional framing sentences.
- Back's Clarify card and sample conversation now use the same "signed
  and exclusive" phrasing as the front, replacing "a signed thing" and
  the earlier "official... like you've signed with them" phrasing.
- Removed the unverified blanket "every Friday" update claim (round 2
  issue; stayed removed).
- "Respect the Relationship" callout renamed "Representation Checkpoint"
  on the back to match the front's new vocabulary exactly.
- No invented promises about how either Cameron or Robert runs their
  business — the one personal line ("staying in touch is something I
  take seriously") is a value statement, not an operational commitment.

## 4. Technical QA

All four rendered files (`audit/flyer-log.json` entries #71–#74) pass
all five automated checks: compliance, copy-lint (no em/en dashes, no
banned clichés, no stray exclamation points), layout (no clipped or
overlapping elements), artwork-contrast, and brand (real SHL logo asset,
correct proportions, clear space).

One real defect was caught and fixed in this round by visual inspection,
not by the linters: the back's legal disclosure paragraph was colliding
with the contact card at the bottom of the page after the Clarify/Contrast
copy changed length. Vertical spacing was tightened across the back's
conversation, checkpoint, objections, and legal blocks to restore clean
separation, then re-screenshotted and re-verified.

`profile-pair-check.js` passed clean on both the front pair and the back
pair — no cross-contaminated name, NMLS, DRE, email, cell, or QR code
between Cameron's and Robert's files.

Merged, print-ready PDFs verified via `pypdf`: both
`three-cs-cameron-print-ready-v4.pdf` and
`three-cs-robert-print-ready-v4.pdf` are exactly 2 pages, 8.5in × 11in
per page.

## 5. Outstanding item

This package is marked **Pending Cameron's Approval**. Nothing has been
sent, posted, printed, or distributed. Separately, Strategic Home Loans'
own brokerage compliance review (if Cameron's brokerage requires sign-off
on agent-facing marketing/education pieces before use) has not happened
and isn't something this tool can perform — that's Cameron's own process
to route this through before any real-world use.
