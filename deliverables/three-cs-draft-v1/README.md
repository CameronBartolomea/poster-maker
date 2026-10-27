# Three Cs Realtor Infographic — Delivery Package

**Status: DRAFT. Pending Cameron's explicit approval. Nothing in this
package has been sent, posted, or printed.**

A two-sided, 8.5x11in educational handout for real estate agents on
handling "I already have an agent," built around the Compliment /
Clarify / Contrast framework. It is a goodwill educational resource,
not primarily a mortgage advertisement.

## What's in here

```
cameron/
  three-cs-front-cameron.png        High-res front preview
  three-cs-back-cameron.png         High-res back preview
  three-cs-front-cameron.html       Editable source (final, rendered)
  three-cs-back-cameron.html        Editable source (final, rendered)
  three-cs-cameron-print-ready.pdf  2-page double-sided PDF, true 8.5x11in

robert/
  (same five files, Robert's version)

source/
  three-cs-front.template.html      Token template (edit this, not the
                                     per-person files above, then
                                     re-render with
                                     scripts/render-person-flyer.js)
  three-cs-back.template.html
  three-cs-concepts/                The 3 concept drafts compared
                                     before selecting the final direction

docs/
  research-and-sources.md           Framework attribution and legal
                                     research, independently verified
  concept-comparison.md             Why this concept over the other 2
  qa-report.md                      Full QA results, including what
                                     failed along the way and was fixed
  compliance-checklist.md           20-point-style checklist, with the
                                     2 items that are genuinely not
                                     done flagged honestly
  asset-manifest.md                 Every brand asset, color, font used
  audit-history.md                  Entry-by-entry record from the
                                     project's own audit log
  print-specs.md                    Trim size, bleed, color, fonts,
                                     resolution, duplex setup
  commit-references.md              Every commit this project touched
```

## The two things that are genuinely not done
1. **Cameron's approval.** Every file carries a visible "Draft /
   Pending Approval" tag.
2. **Brokerage/compliance sign-off** on whether this specific piece,
   including its summary of NAR Code of Ethics Article 16, is
   sufficient for his brokerage and California specifically. The
   underlying citation was independently verified as accurate; that is
   not the same as brokerage clearance. See `docs/compliance-checklist.md`.

## If you want to make a change
Edit the templates in `source/`, then from the repo run:

```
node scripts/render-person-flyer.js templates/three-cs-front.template.html --person cameron --out posters/_three-cs-front-cameron.html
node scripts/render-person-flyer.js templates/three-cs-front.template.html --person robert --out posters/_three-cs-front-robert.html
```

(same pattern for the back template), then re-run the QA pipeline
(`scripts/audit-log.js add`, `scripts/profile-pair-check.js`,
`scripts/export.js --pdf`) before considering it ready again.
