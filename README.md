# VEYRA HTML adaptation

Static HTML/CSS/JavaScript adaptation of the public **VEYRA — Electric, inside out.** reference release.

## Reference

- Upstream: `amirmushichge/veyra-interactive-car`
- Approved reference tag: `v1.0.0`
- This repository is an independent adaptation for a direct HTML runtime.
- Original attribution and license are preserved in `LICENSE`.

## Structure

- `index.html` — semantic page shell
- `styles.css` — reference stylesheet from the approved release
- `app.js` — vanilla-JavaScript state machine, hotspots, hover playback, detail views and appearance controls
- `LICENSE` — upstream license

## Behaviour implemented

- Four image-relative overview points: Drive, Battery, Paint and Wheels
- Sequenced forward/reverse hover previews for Drive and Battery
- Overview → entering → detail → returning → overview state flow
- Drive/Battery detail annotations and list toggles
- Paint and wheel appearance docks
- Escape/back behaviour
- Keyboard focus states and live status
- Responsive 1672:941 media plane
- Reduced-motion handling

## Media

To preserve the approved asset bytes without recompression or regeneration, this HTML adaptation references the immutable raw files pinned to upstream tag `v1.0.0`.

No generated imagery or substitute vehicle assets are used.

## Run locally

Any static HTTP server works. For example:

```sh
python -m http.server 5220
```

Then open `http://127.0.0.1:5220/`.

## Notes

This is an adaptation rather than a byte-identical copy of the original Vite/React application. The visual stylesheet and approved media are pinned to the reference release, while interaction logic is implemented in vanilla JavaScript for direct HTML use.
