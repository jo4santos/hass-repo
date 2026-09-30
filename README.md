# Jose Santos Home Assistant Repository

Custom Home Assistant add-ons, integrations, Lovelace cards and themes. Each component lives in its own subdirectory; cards/integrations/themes are mirrored to dedicated GitHub repos so they can be installed via HACS as custom repositories.

## 🔧 Add-ons

**Add-on repository URL:** `https://github.com/jo4santos/hass-repo`

[![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fjo4santos%2Fhass-repo)

| Add-on | Path | Description |
| --- | --- | --- |
| **Cérebro-Pi Admin** | [`addons/cerebro_pi_admin`](./addons/cerebro_pi_admin) | Ingress panel that proxies the admin UI of the Cérebro-Pi (Raspberry Pi) via nginx. |

## 🧩 Integrations (HACS)

| Integration | HACS repo | Description |
| --- | --- | --- |
| **Morning Routine** | [`hass-repo-integration-morning-routine`](https://github.com/jo4santos/hass-repo-integration-morning-routine) | Gamified morning-routine tracker (points, achievements, Google Drive uploads, per-child activities). |

## 🎴 Lovelace Cards (HACS)

| Card | HACS repo | Description |
| --- | --- | --- |
| **Morning Routine Card** | [`hass-repo-card-morning-routine`](https://github.com/jo4santos/hass-repo-card-morning-routine) | Interactive card for tracking morning activities (photos, audio, live weather, Bubble Card integration). |
| **Daily Activities Card** | [`hass-repo-daily-activities-card`](https://github.com/jo4santos/hass-repo-daily-activities-card) | Headerless variant of the Activity Manager card focused on the items themselves. |
| **Toggle Confirmation Card** | [`hass-repo-toggle-card`](https://github.com/jo4santos/hass-repo-toggle-card) | Inline red/green confirm/cancel buttons that replace modal confirmation dialogs. |
| **Podcast Card** | [`hass-repo-card-podcast`](https://github.com/jo4santos/hass-repo-card-podcast) | Grid/list of podcast episodes loaded from a JSON manifest; plays via Music Assistant. |

## 🎨 Themes (HACS)

| Theme | HACS repo | Description |
| --- | --- | --- |
| **Example Button Theme** | [`hass-repo-theme`](https://github.com/jo4santos/hass-repo-theme) | Minimal theme that restyles modal confirmation buttons without overriding the rest of the UI. |

## 📦 Installation

- **Add-ons** — In Supervisor → Add-on Store → ⋮ → Repositories, paste `https://github.com/jo4santos/hass-repo`, then install from the list.
- **HACS components** — In HACS → ⋮ → Custom repositories, paste the individual HACS repo URL from the tables above with the matching category (Integration / Lovelace / Theme), then install.

## 🛠 Working on this repo

Each card / integration / theme is a git subtree pointing at its own GitHub repo. Publishing is automatic:

1. Edit the component and commit on `main` in this repo. Only ever edit here, never directly in the dedicated repos (that breaks the subtree fast-forward).
2. The `Sync HACS subtrees` GitHub Action (`.github/workflows/sync-subtrees.yaml`) pushes every subtree to its dedicated repo on each push to `main`.
3. Components in **release** mode (Daily Activities Card, Morning Routine integration, Morning Routine Card) are only updated in HACS through GitHub releases. Bump the version in the source (`manifest.json` for integrations, the version string at the top of the card `.js` for cards) and the Action creates the `vX.Y.Z` release automatically, using the commit message as release notes. No version bump = no HACS update.
4. Components in **branch** mode (everything else) are updated in HACS on every push, no version bump needed.

`./update-subtrees.sh` still works for a manual push if the Action is unavailable. The Action needs the `SUBTREE_PUSH_TOKEN` secret (fine-grained PAT, Contents: read/write on the dedicated repos); when it expires, generate a new one and run `gh secret set SUBTREE_PUSH_TOKEN -R jo4santos/hass-repo`.

Layout:

```
addons/         — Home Assistant add-ons (served via the repository URL above)
cards/          — Custom Lovelace cards (one subtree per card)
integrations/   — Custom integrations (custom_components)
themes/         — Custom themes
update-subtrees.sh  — manual fallback: pushes every subtree to its dedicated HACS repo
.github/workflows/sync-subtrees.yaml — automatic subtree push + HACS releases
```
