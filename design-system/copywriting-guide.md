# SHL Copywriting Guide

Standing rules for all marketing copy on SHL flyers. Enforced partly by
`scripts/copy-lint.js`, partly by human/AI judgment at review time (the
linter catches mechanical violations; it can't judge whether copy
"sounds generic" — that's a review step, not a pass/fail check).

## Hard rules (the linter checks these)

- **No em dashes (—) or en dashes (–) in marketing prose.** Rewrite with
  a period, comma, or "instead of" / "which means" construction. Hyphens
  in legitimate compound words or identifiers (e.g. "first-time",
  "co-branded") are fine and not flagged.
- **No banned clichés**, including but not limited to: "unlock your
  potential", "navigate today's market", "your trusted partner", "your
  journey starts here", "take the next step", "turn your dreams into
  reality", "look no further", "in today's world". Full list lives in
  `scripts/copy-lint.js` — add to it as new ones show up.
- **No more than one exclamation point per flyer**, and only if it earns
  its place (default to zero).
- **No emojis** unless explicitly requested for that piece.

## Judgment rules (review, not auto-enforced)

- Every sentence should have a practical purpose. If a line could be
  deleted without losing information, delete it.
- Avoid corporate buzzwords ("synergy", "leverage" as a verb,
  "solutions", "best-in-class") and excessive adjectives.
- Avoid repetitive sentence structure (three sentences in a row starting
  the same way reads as template filler).
- Avoid vague claims about service quality ("exceptional",
  "unparalleled", "world-class") — replace with a specific, concrete
  claim or cut it.
- Write like an experienced mortgage professional talking to a realtor
  or a client, not like an ad. Confident, plain, conversational.

## SHL-specific language choices

- Prefer **"elevated"** over "rising" or "higher" when describing the
  current mortgage rate environment.
- When explaining financing choices to consumers, **lead with the
  monthly payment**, not the headline rate, unless the piece is
  specifically about rates.
- **Avoid aggressive rate advertising** unless Cameron explicitly asks
  for a rate-forward piece, and even then only with that day's actual
  rate sheet.
- Plain English. Avoid unneeded industry jargon (if a realtor-facing
  piece uses a term a first-time homebuyer wouldn't know, define it in
  three words or cut it).
- Keep consumer-facing explanations concise. A flyer is not the place
  for a full underwriting explainer.
- These mortgage-specific language rules apply to mortgage-product copy.
  They don't apply to unrelated realtor education content (e.g. a
  flyer about open-house staging tips) where they'd just be noise.

## Geographic framing

Default service area, when a flyer references where SHL works: Ventura
County, Conejo Valley, Westlake Village, Thousand Oaks, Simi Valley,
Moorpark, Newbury Park, Agoura Hills, and surrounding western Los
Angeles County. Don't claim a broader footprint than this without
Cameron confirming it.

## What the linter can't do

It cannot judge voice, tone, or whether copy "sounds AI-generated"
beyond the mechanical checks above. That's a human read. When in doubt,
read the copy out loud: if it doesn't sound like something a person
would actually say to a colleague, rewrite it.
