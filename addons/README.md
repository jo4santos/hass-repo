# Home Assistant Add-ons

This directory contains Home Assistant add-ons for this repository.

## Repository Configuration

The `repository.yaml` file configures this directory as a Home Assistant add-on repository.

## Add-on Structure

Each add-on should be in its own subdirectory with the following required files:

```
addon_name/
├── config.yaml      # Add-on configuration
├── Dockerfile       # Container build instructions
├── README.md        # Add-on documentation
├── DOCS.md          # Detailed documentation
├── CHANGELOG.md     # Version history
├── icon.png         # Add-on icon
├── logo.png         # Add-on logo
└── rootfs/          # Add-on file system
```

## Available Add-ons

- **example** - Template add-on for development reference

## Adding This Repository

To add this add-on repository to your Home Assistant instance:

1. Go to **Supervisor** → **Add-on Store**
2. Click the **⋮** menu → **Repositories**
3. Add this URL: `https://github.com/jo4santos/hass-repo`
4. Click **Add** → **Close**

The add-ons will appear in your add-on store under "Jose Santos add-on repository".

## Development

- Comment out the `image` key in `config.yaml` during development to build locally
- Update version numbers in `config.yaml` when releasing
- Keep `CHANGELOG.md` updated with changes
- Ensure proper architecture support badges in documentation