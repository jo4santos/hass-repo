# HACS Custom Integrations

This directory contains custom Home Assistant integrations that can be installed via HACS.

## Structure

Each integration should be in its own subdirectory with the following structure:

```
integration_name/
├── custom_components/
│   └── integration_name/
│       ├── __init__.py
│       ├── manifest.json
│       └── ... (other integration files)
├── README.md
└── hacs.json (optional)
```

## Creating a New Integration

1. Create a new directory for your integration
2. Follow the Home Assistant integration development guidelines
3. Ensure your `manifest.json` is properly configured
4. Add a `hacs.json` file if needed for HACS-specific configuration
5. Test your integration thoroughly

## Installation

Each integration can be added to HACS as a custom repository:

1. Open HACS in Home Assistant
2. Go to Integrations
3. Click the three dots menu → Custom repositories  
4. Add the URL: `https://github.com/jo4santos/hass-repo/tree/main/integrations/[integration_name]`
5. Select category: Integration
6. Click Add

## Resources

- [Home Assistant Integration Development](https://developers.home-assistant.io/docs/creating_integration_index/)
- [HACS Integration Documentation](https://hacs.xyz/docs/publish/integration/)