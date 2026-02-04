# Instagram Reel After Effects Workflow

Complete toolkit for creating modern Instagram Reel videos in After Effects.

## Files Included

| File | Description |
|------|-------------|
| `InstagramReelWorkflow.jsx` | ExtendScript that auto-generates a complete Reel composition |
| `ISTRUZIONI_ITALIANO.md` | Step-by-step Italian instructions for macOS After Effects UI |
| `expressions-library.jsx` | Copy-paste expressions for animations |

## Quick Start

### Option 1: Use the Script (Fastest)

1. Open After Effects
2. Import your video footage
3. Select the video in Project panel
4. Run: **File > Scripts > Run Script File...**
5. Select `InstagramReelWorkflow.jsx`
6. Done! Customize text and timing as needed

### Option 2: Follow Manual Instructions

See `ISTRUZIONI_ITALIANO.md` for detailed step-by-step instructions in Italian.

## Composition Settings

```
Resolution: 1080 x 1920 px (9:16 vertical)
Frame Rate: 30 fps
Duration: 15 seconds (max for Reels)
```

## Color Palette

| Color | HEX | Use Case |
|-------|-----|----------|
| Primary (Pink/Magenta) | `#FF3366` | Backgrounds, accents |
| Secondary (Cyan) | `#33CCFF` | Subtitles, secondary elements |
| Accent (Yellow/Gold) | `#FFCC33` | CTA, arrows, highlights |
| Text (White) | `#FFFFFF` | Headlines, main text |

## Recommended Fonts

| Type | Font | Size |
|------|------|------|
| Headline | Montserrat Bold / Bebas Neue | 72-96px |
| Subtitle | Montserrat SemiBold | 48-64px |
| Body | Montserrat Medium | 36-48px |
| CTA | Montserrat Bold | 36-48px |

## Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Pop In | 0.25s | Easy Ease + Overshoot |
| Slide In | 0.3s | Easy Ease Out |
| Fade In | 0.2s | Easy Ease |
| Text appear | 0.05s/char | Linear |

## Keyboard Shortcuts (macOS)

| Action | Shortcut |
|--------|----------|
| New Composition | `Cmd+N` |
| Import | `Cmd+I` |
| Duplicate | `Cmd+D` |
| Easy Ease | `F9` |
| Show Position | `P` |
| Show Scale | `S` |
| Show Opacity | `T` |
| Preview | `Spacebar` or `0` |

## Export Settings

```
Format: H.264
Resolution: 1080x1920
Frame Rate: 30fps
Bitrate: 15-20 Mbps (VBR)
Audio: AAC 320kbps
```

## Layer Structure (Top to Bottom)

1. Color Grading (Adjustment Layer)
2. Text Layers (Headline, Subtitle, CTA)
3. Graphics (Boxes, Arrows, Icons)
4. Main Video (Sharp subject)
5. Background (Blurred + Scaled)

## Tips for Instagram Reels

- Keep text on screen for minimum 2-3 seconds
- Use high contrast for readability
- Stay within safe zones (100px from edges)
- Max 5-7 words per screen
- First 3 seconds are crucial for retention
- Add captions for accessibility
