# Example Button Theme

A minimal Home Assistant theme that focuses only on styling modal confirmation buttons while preserving all other UI elements from your current theme.

## Features

- **Focused Changes**: Only modifies modal dialog buttons (OK/Confirm, Cancel)
- **Theme Inheritance**: Preserves all other styling from your current theme
- **Visual Clarity**: Green confirm buttons, red cancel buttons for better UX
- **Non-Intrusive**: Doesn't override cards, sidebar, or main interface elements

## Button Styling

- **Confirm/OK Buttons**: Green (`#4CAF50`) with white text
- **Cancel/Close Buttons**: Red (`#f44336`) with appropriate contrast
- **Hover Effects**: Darker shades on hover for better feedback
- **Focus States**: Proper accessibility focus indicators

## Installation

### Method 1: Via HACS (Recommended)

1. Install HACS if not already installed
2. Go to HACS → Frontend → ⋮ → Custom repositories  
3. Add this URL: `https://github.com/jo4santos/hass-repo-theme`
4. Select category: Theme → Add → Install
5. Restart Home Assistant
6. Go to Profile → Theme → Select "Example Button Theme"

### Method 2: Manual Installation

1. Download `example_button_theme.yaml`
2. Create a `themes` folder in your Home Assistant config directory if it doesn't exist
3. Copy the theme file to `/config/themes/example_button_theme.yaml`
4. Add to your `configuration.yaml`:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

5. Restart Home Assistant
6. Go to Profile → Theme → Select "Example Button Theme"

### Method 3: Via File Editor Add-on

1. Install the File Editor add-on if not already installed
2. Navigate to `/config/themes/`
3. Create `example_button_theme.yaml` and paste the theme content
4. Add the frontend configuration to `configuration.yaml`
5. Restart Home Assistant

## Configuration

Add this to your `configuration.yaml`:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

Or if you already have themes configured, just restart Home Assistant.

## Usage

1. **Apply Theme**: Profile → Theme → "Example Button Theme"
2. **Test**: Open any modal dialog (delete entity, restart HA, etc.)
3. **Observe**: Confirm buttons will be green, cancel buttons red

## Compatibility

- **Home Assistant Core**: 2023.1+
- **All Themes**: Works as an overlay on any existing theme
- **Components**: Compatible with all modal dialogs, confirmations, forms

## Customization

To modify button colors, edit the theme file:

```yaml
Example Button Theme:
  mdc-theme-primary: "#your-confirm-color"      # Confirm button color
  mdc-theme-secondary: "#your-cancel-color"     # Cancel button color
```

Common color options:
- **Green Confirm**: `#4CAF50`, `#2E7D32`, `#66BB6A`
- **Red Cancel**: `#f44336`, `#D32F2F`, `#EF5350`
- **Blue Confirm**: `#2196F3`, `#1976D2`, `#42A5F5`

## Examples

### Modal Dialogs Affected
- Entity deletion confirmations
- Restart/reload confirmations  
- Configuration save dialogs
- Automation/script execution confirmations
- Add-on installation/removal dialogs

### Visual Impact
- ✅ **Before**: Generic blue buttons
- ✅ **After**: Green confirm + red cancel for clarity

## Reverting

To remove the theme:
1. Go to Profile → Theme → Select your previous theme
2. Or select "Auto" to use Home Assistant default

## Support

This is an example theme for demonstration purposes. For issues or customizations, visit the [repository](https://github.com/jo4santos/hass-repo).