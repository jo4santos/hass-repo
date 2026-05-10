# Podcast Card

Custom Lovelace card that renders a podcast as a grid of episode covers loaded from a JSON manifest. Tapping a cover plays the episode on a Music Assistant speaker; a side button enqueues it instead. Search, sort and shuffle are built in.

## Features

- Grid of episodes with cover images (loaded from `/local/podcasts/episodes.json` by default).
- Click a cover to play; small button to enqueue next.
- Search by title/description, sort by number/title/duration, shuffle.
- Single source of truth: refresh `episodes.json` and the card updates — no helpers/scripts to keep in sync.
- Plays via `music_assistant.play_media` with the absolute URL of the audio file.

## Requirements

- Music Assistant integration with at least one player entity (the card calls `music_assistant.play_media`).
- A folder under `www/` containing the audio files, cover images and an `episodes.json` manifest. The companion `download_podcast.py` script (in this repo's adjacent `podcasts/` toolkit) generates the expected layout.

## Manifest format (`episodes.json`)

```json
{
  "podcast": {
    "title": "Vou contar-te uma história",
    "description": "...",
    "image": "https://.../cover.jpg"
  },
  "episodes": [
    {
      "number": 1,
      "title": "Todos de pijama 2019",
      "description": "...",
      "audio_file": "audio/001_todos_de_pijama_2019.m4a",
      "image_file": "images/001_todos_de_pijama_2019.jpg",
      "duration": "24:33",
      "duration_seconds": 1473
    }
  ]
}
```

`audio_file` and `image_file` are relative to `base_path`.

## Installation

### Via HACS (when published)

1. HACS → Frontend → Custom repositories
2. Add `https://github.com/jo4santos/hass-repo-card-podcast` (category: Lovelace)
3. Install **Podcast Card**
4. Add the resource (HACS does this automatically) and use `type: custom:podcast-card`.

### Manual

1. Copy `dist/podcast-card.js` to `/config/www/podcast-card.js`.
2. Add a Lovelace resource: URL `/local/podcast-card.js`, type **JavaScript Module**.
3. Make sure the audio + images + `episodes.json` live under `/config/www/podcasts/` (or change `base_path`).

## Configuration

```yaml
type: custom:podcast-card
media_player: media_player.colunas_casa   # required (Music Assistant entity)
base_path: /local/podcasts                # default
columns: 3                                # grid columns (default 3)
title: Histórias                          # optional override (else uses podcast.title)
show_search: true
show_random: true
enqueue: replace                          # play | replace | next | replace_next | add
sort: number                              # number | number_desc | title | duration
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `media_player` | string | — | **Required.** Music Assistant `media_player.*` entity. |
| `base_path` | string | `/local/podcasts` | Folder containing `episodes.json`, `audio/`, `images/`. |
| `columns` | number | `3` | Grid columns. |
| `title` | string | `podcast.title` | Override displayed title. |
| `show_search` | boolean | `true` | Show search input. |
| `show_random` | boolean | `true` | Show shuffle button. |
| `enqueue` | string | `replace` | Mode used when clicking a cover. |
| `sort` | string | `number` | Initial sort order. |

## Notes

- The card builds the audio URL as `${origin}${base_path}/${episode.audio_file}`. This works on the LAN; if you access HA via Nabu Casa cloud and the speaker can't reach the cloud URL, point `base_path` at a public URL or move to a Music Assistant podcast/RSS provider instead.
- Music Assistant `play_media` is called with `media_type: track` and the configured `enqueue` mode.
