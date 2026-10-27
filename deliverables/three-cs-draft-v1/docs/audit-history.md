# Audit History — Three Cs Project

Full machine-readable record lives in `audit/flyer-log.json` in the
repo (entries #50-59). Summary:

| # | File | What happened |
|---|---|---|
| 50 | back, Cameron | Initial build |
| 51 | front, Cameron | Initial build; fixed an accent-bar/numeral overlap found by the layout checker before this entry |
| 52 | back, Cameron | Fixed: logo was missing entirely (brand-check caught it) |
| 53 | front, Cameron | Fixed: no NMLS/EHO anywhere (compliance-check caught it); added small secondary disclosure line |
| 54 | front, Robert | Built, matching Cameron's fixed version |
| 55 | back, Robert | Built, matching Cameron's fixed version |
| 56 | front, Cameron | Independent creative review fixes: accent-bar escalation, headline gap |
| 57 | front, Robert | Same fixes applied |
| 58 | back, Cameron | Independent creative review fixes: panel contrast, compliance box rewrite, fixed a bounding-box false-positive overlap |
| 59 | back, Robert | Same fixes applied |

Every entry from #50 on records the result of all 5 automated checks
(compliance, copy, layout, artwork_contrast, brand) at that point in
time -- including the failures, not just the final passing state. The
full qa_detail text for each is in `audit/flyer-log.json`.

This is the honest history of the work, not a cleaned-up summary:
three real defects were caught by the automated pipeline during
development (a numeral overlap, a missing logo, a missing compliance
disclosure), and four more were caught by the independent creative
review after the pipeline was already green, because automated checks
catch mechanical defects, not design or communication quality.
