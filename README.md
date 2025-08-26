# Jose Santos Home Assistant Repository

This repository contains custom Home Assistant add-ons, integrations, and Lovelace cards.

## Repository Structure

```
├── example/          # Home Assistant Add-ons (root level)
├── integrations/     # HACS Custom Integrations  
├── cards/           # HACS Lovelace Cards
└── repository.yaml   # Add-on repository configuration
```

## Add-ons

Home Assistant add-ons extend the functionality of your Home Assistant installation.

**Add-on Repository URL:** `https://github.com/jo4santos/hass-repo`

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fjo4santos%2Fhass-repo)

### Available Add-ons

- [Example Add-on](./example) - Example add-on template

## HACS Integrations

Custom integrations that can be installed via HACS (Home Assistant Community Store).

### Available Integrations

*No integrations available yet*

## HACS Lovelace Cards

Custom dashboard cards that can be installed via HACS.

### Available Cards

*No cards available yet*

## Installation Instructions

### Add-ons
1. In Home Assistant, go to **Supervisor** → **Add-on Store**
2. Click **⋮** → **Repositories** → Add `https://github.com/jo4santos/hass-repo`
3. Install desired add-ons from the store

### HACS Integrations/Cards
1. Install HACS if not already installed
2. Add custom repositories for individual integrations/cards
3. Install via HACS interface

## Development

This repository uses a devcontainer for consistent development environment. Open in VS Code with the Dev Containers extension for the best experience.

## License

See [LICENSE](LICENSE) file for details.