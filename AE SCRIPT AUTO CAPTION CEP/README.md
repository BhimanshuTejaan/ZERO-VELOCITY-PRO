# Zero Velocity CEP

This is the new CEP extension foundation for Zero Velocity.

The original JSX project remains the stable reference implementation and should not be moved, renamed, or edited as part of the CEP migration.

## Development Install

Copy or symlink this folder into the Adobe CEP extensions directory:

```text
C:\Users\<USER>\AppData\Roaming\Adobe\CEP\extensions\AE SCRIPT AUTO CAPTION CEP
```

For unsigned development extensions, enable debug mode:

```text
HKEY_CURRENT_USER\Software\Adobe\CSXS.9
PlayerDebugMode = 1
```

After Effects 2020 uses CEP/CSXS 9. Restart After Effects after installing or changing the manifest.

## Current Status

This foundation intentionally contains no After Effects generation logic yet.

Current browser-side workspace:

- Header
- Import SRT button
- Caption Block List
- Live Preview Area
- Layout Controls with preview-only sliders
- Word Selection chips
- Apply button

## Browser-Side Modules

- `js/captionModel.js`: source of truth for demo caption data, selected hero/accent words, and layout control values.
- `js/srtParser.js`: browser-only one-word SRT parser that preserves each entry's timing and creates preview blocks.
- `js/previewLayoutEngine.js`: recalculates the browser preview layout whenever the caption model changes.
- `js/previewRenderer.js`: receives preview data and renders HTML only.
- `js/captionBlockList.js`: renders and selects parsed caption blocks.
- `js/layoutControls.js`: binds slider controls to the caption model.
- `js/wordSelection.js`: binds hero/accent mode buttons and word chips to the caption model.
- `js/aeBridge.js`: browser-side CEP bridge wrapper for host JSX calls.
- `js/actionController.js`: owns Generate Captions and Apply Changes button behavior.
- `js/main.js`: bootstraps the panel and connects browser-side modules.

`Generate Captions` and `Apply Changes` now communicate with `jsx/host.jsx` through CEP.
The host adapter loads and reuses the stable JSX engine from the original sibling project.
