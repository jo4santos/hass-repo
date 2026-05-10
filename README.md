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

Each card / integration / theme is a git subtree pointing at its own GitHub repo. After editing a component locally:

1. Commit the changes on `main` in this repo.
2. Run `./update-subtrees.sh` to push each affected component to its dedicated repo (HACS pulls from there).
3. Bump versions in the component's source where applicable so HACS picks up the new release.

Layout:

```
addons/         — Home Assistant add-ons (served via the repository URL above)
cards/          — Custom Lovelace cards (one subtree per card)
integrations/   — Custom integrations (custom_components)
themes/         — Custom themes
update-subtrees.sh  — pushes every subtree to its dedicated HACS repo
```
