# Print Specifications

- **Trim size:** 8.5in x 11in (letter), portrait, both sides
- **Bleed:** none required -- no element bleeds to the page edge on
  either side; all content sits within a consistent safe margin
  (0.6-0.75in depending on section)
- **Color:** CSS color values only, no embedded ICC profile; this is a
  digital-first draft. If Cameron proceeds to offset or professional
  print, a print shop should confirm CMYK conversion of the brand red
  (#c72108) and charcoal (#474747) against a physical proof before a
  print run, since on-screen and printed red can shift noticeably.
- **Fonts:** Outfit, loaded from Google Fonts at render/export time
  and rasterized into the PDF by the Chromium print pipeline (not
  embedded as live font data) -- standard for this project's existing
  posters, verified readable in the exported PDFs.
- **Resolution:** PDFs are exported directly from the live HTML/CSS at
  true page size via Chromium's print engine (vector text and vector
  shapes throughout, not a rasterized image placed on a page) --
  effectively resolution-independent for text and the flat color
  shapes that make up the front's artwork. The PNG previews are
  rendered at 2x (192 DPI equivalent at 8.5x11in) for on-screen review
  and digital sharing.
- **Double-sided setup:** `three-cs-<person>-print-ready.pdf` is a
  2-page PDF, page 1 = front, page 2 = back, built by merging the two
  single-page exports with `qpdf` (both already confirmed at identical
  8.5x11in dimensions before merging). For physical printing, this
  maps directly to a duplex (long-edge flip) print job, since both
  pages share the same portrait orientation and the content on each
  side reads correctly right-side-up when flipped on the long edge.
