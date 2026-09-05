# Game Library

Personal static game archive.

## Structure

```text
/
├─ index.html
├─ assets/
│  └─ css/
│     └─ common.css
└─ games/
   ├─ ark-survival-ascended/
   │  └─ index.html
   └─ incursion-red-river/
      ├─ index.html
      ├─ ammunition.html
      ├─ attachment-builder.html
      └─ barter-items.html
```

## Convention

- One repository for the whole game library.
- One directory per game: `games/<game-slug>/`
- Each game has its own `index.html`.
- Guides, tools and notes live under that game's directory.
- Shared visual styling lives under `assets/`.
- Add future games by creating a new folder under `games/` and linking it from the root `index.html`.

## Current games

- ARK: Survival Ascended
- Incursion: Red River
