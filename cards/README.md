# HACS Lovelace Cards

Custom Lovelace cards. Each card lives in its own subdirectory and is mirrored to a dedicated GitHub repo via git subtree so it can be installed via HACS as a custom repository.

## Cards

| Path | HACS repo | Description |
| --- | --- | --- |
| [`morning_routine_card`](./morning_routine_card) | [`hass-repo-card-morning-routine`](https://github.com/jo4santos/hass-repo-card-morning-routine) | Interactive morning-routine tracker with photos, audio, weather and Bubble Card integration. |
| [`daily_activities_card`](./daily_activities_card) | [`hass-repo-daily-activities-card`](https://github.com/jo4santos/hass-repo-daily-activities-card) | Headerless variant of the Activity Manager card. |
| [`toggle_confirmation_card`](./toggle_confirmation_card) | [`hass-repo-toggle-card`](https://github.com/jo4santos/hass-repo-toggle-card) | Inline red/green confirm/cancel buttons. |
| [`podcast_card`](./podcast_card) | [`hass-repo-card-podcast`](https://github.com/jo4santos/hass-repo-card-podcast) | Grid/list of podcast episodes loaded from `episodes.json`, plays via Music Assistant. |

## Layout

```
card_name/
├── podcast-card.js     ← source (the file HACS serves)
├── dist/               ← compiled copy (kept in sync with source)
│   └── podcast-card.js
├── hacs.json
└── README.md
```

`hacs.json.filename` must match the JS file served from the repository root.

## Creating a new card

1. Create the subdirectory and scaffold the layout above.
2. Implement the card and document it in its `README.md`.
3. Create the matching GitHub repo (`hass-repo-card-<name>`).
4. Add the remote and do the first subtree push:
   ```bash
   git remote add <name>-card-repo git@github.com:jo4santos/hass-repo-card-<name>.git
   git subtree push --prefix=cards/<name>_card <name>-card-repo main
   ```
5. Append the new push line to [`../update-subtrees.sh`](../update-subtrees.sh).
6. Install via HACS → ⋮ → Custom repositories with category **Lovelace**.

## Resources

- [Custom Card Development Guide](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [HACS Plugin Documentation](https://hacs.xyz/docs/publish/plugin/)
- [Card Development Template](https://github.com/custom-cards/boilerplate-card)