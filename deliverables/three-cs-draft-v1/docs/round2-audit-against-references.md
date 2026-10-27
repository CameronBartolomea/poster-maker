# Honest Audit: Round 2 ("One House") Against the Reference Bar

Cameron's call is correct. Laid directly against the reference
patterns in `reference-analysis.md`, here is where round 2 falls
short, specifically:

1. **The graphic doesn't encode the content — it stands in for it.**
   Every reference's dominant visual either *is* a piece of real
   content (a rate, a percentage, a quoted line) or is a genuine
   structural diagram (the benefit wheel). The house is neither: it's
   a drawing that requires a caption to explain what it means
   ("the roof over the relationship"). None of the references need
   that kind of translation — their graphic states the point directly.

2. **Weak focal point, misplaced dominant element.** In every
   reference, the single biggest, boldest thing on the page is the
   actual payoff (a stat, a quoted claim, a table). On the round 2
   front, the biggest element is a line drawing of a house; the actual
   payoff — what to say — is pushed into small 14.5px tags off to the
   side. The hierarchy is backwards.

3. **Density too low to be useful.** The references are confident
   with real content: rate tables, 5-wedge wheels, 5-row lists.
   Round 2's front carries exactly 9 words of actionable instruction
   across the whole page ("Mean it," "Ask the one question," "Offer
   one real difference") — nowhere near enough for a Realtor to
   actually know what to say, which the brief calls out directly: "a
   Realtor must know what to SAY, when to proceed, and when to stop."
   None of that is answerable from the front alone right now.

4. **Large dead areas instead of purposeful whitespace.** The
   references leave whitespace *around* dense, useful content (margins
   framing a table, breathing room between wedges). Round 2 leaves
   whitespace *instead of* content — most of the lower third of the
   illustration zone is empty page.

5. **No color-to-meaning system.** The references use 1-2 accents
   consistently to mean something (green = savings, a single brand hue
   per variant, red only for the "cost" side of a comparison). Round
   2's gray-to-red progression is a *mood* gradient (quiet to bold),
   not a meaning system tied to actual content the way "green bar =
   dollars saved" is.

6. **No instructive device for the one thing that matters most: when
   to stop.** The references that deal with any kind of decision
   (even implicitly, like the rate-vs-buydown comparison) show the
   comparison directly. Round 2 buries the represented-client
   boundary entirely on the back, in a compliance box — the front
   gives no visual signal at all for "stop here if they're already
   under contract," despite that being the single highest-stakes piece
   of guidance on the whole piece.

7. **Metaphor requiring explanation, which the brief specifically
   rules out.** "Roof over the relationship" and "one window gets a
   look inside" are not phrases a Realtor would ever say or think:
   they only make sense once you already know they're metaphors for
   Compliment and Clarify. A reference-quality graphic doesn't need
   that decoder step.

## What carries forward unchanged

Everything the production system actually verifies stays as-is: the
dual-profile data source (`data/people.json`), the official brand
assets, the QR codes, the NMLS/DRE numbers, the automated QA pipeline,
and the independently-verified NAR citations. The problem was never
the infrastructure. It's specifically the front's graphic and
information design, which is what this round rebuilds from scratch.
