# Implementation contract

This repository follows the supplied VEYRA interaction contract while adapting the runtime to static HTML/CSS/JavaScript.

## State model

`overview -> entering -> detail -> returning -> overview`

Appearance mode is exclusive and prevents unrelated hotspots while active.

## Shared media plane

The exterior, hover canvas, detail stills and hotspots share one nominal 1672:941 coordinate plane. Hotspot positions remain image-relative.

## Accessibility

Native buttons are used for all controls. Focus remains visible, Escape returns from detail/appearance modes, and an ARIA live region reports state changes.

## Motion

Hover previews finish their authored forward/reverse clips before the next system transition. The currently decoded frame is retained on the canvas during detail entry. Reduced-motion removes non-essential animated travel.

## Performance

The page has no framework runtime. Critical stills preload first; appearance alternatives are loaded on demand. Media bytes are not recompressed or regenerated.
