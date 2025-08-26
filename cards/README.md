# HACS Lovelace Cards

This directory contains custom Lovelace dashboard cards that can be installed via HACS.

## Structure

Each card should be in its own subdirectory with the following structure:

```
card_name/
├── dist/
│   └── card-name.js (main card file)
├── src/ (optional - source files)
├── README.md
└── hacs.json (optional)
```

## Creating a New Card

1. Create a new directory for your card
2. Develop your custom card following Lovelace card development guidelines
3. Place the compiled JavaScript file in the `dist/` directory
4. Ensure the filename matches the repository name (minus "lovelace-" prefix if present)
5. Add proper documentation in README.md

## Installation

Each card can be added to HACS as a custom repository:

1. Open HACS in Home Assistant
2. Go to Frontend
3. Click the three dots menu → Custom repositories
4. Add the URL: `https://github.com/jo4santos/hass-repo/tree/main/cards/[card_name]`
5. Select category: Lovelace
6. Click Add

## Resources

- [Custom Card Development Guide](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [HACS Plugin Documentation](https://hacs.xyz/docs/publish/plugin/)
- [Card Development Template](https://github.com/custom-cards/boilerplate-card)