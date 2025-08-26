# Jose Santos Home Assistant Repository

This repository contains custom Home Assistant add-ons, integrations, and Lovelace cards.

## Repository Structure

```
├── example/          # Home Assistant Add-ons (root level)
├── integrations/     # HACS Custom Integrations  
├── cards/           # HACS Lovelace Cards
├── themes/          # Home Assistant Themes
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

- [Example Counter](./integrations/example_counter) - Simple counter sensor that increments every 30 seconds

## HACS Lovelace Cards

Custom dashboard cards that can be installed via HACS.

### Available Cards

- [Example Counter Card](./cards/example_counter_card) - Stylish card to display counter values

## Home Assistant Themes

Custom themes that enhance specific UI elements without overriding the entire interface.

### Available Themes

- [Example Button Theme](./themes/example_button_theme) - Modifies only modal confirmation buttons for better UX

## Installation Instructions

### Add-ons
1. In Home Assistant, go to **Supervisor** → **Add-on Store**
2. Click **⋮** → **Repositories** → Add `https://github.com/jo4santos/hass-repo`
3. Install desired add-ons from the store

### HACS Integrations
1. Install HACS if not already installed
2. Go to HACS → Integrations → ⋮ → Custom repositories
3. Add integration URL (e.g., `https://github.com/jo4santos/hass-repo/tree/main/integrations/example_counter`)
4. Select category: Integration → Add → Install

### HACS Cards
1. Install HACS if not already installed  
2. Go to HACS → Frontend → ⋮ → Custom repositories
3. Add card URL (e.g., `https://github.com/jo4santos/hass-repo/tree/main/cards/example_counter_card`)
4. Select category: Lovelace → Add → Install

### Themes
1. Download the theme YAML file from the desired theme directory
2. Copy to `/config/themes/` in your Home Assistant installation
3. Add to `configuration.yaml`: 
   ```yaml
   frontend:
     themes: !include_dir_merge_named themes
   ```
4. Restart Home Assistant → Profile → Theme → Select theme

## Development

This repository uses a devcontainer for consistent development environment. Open in VS Code with the Dev Containers extension for the best experience.

## License

See [LICENSE](LICENSE) file for details.