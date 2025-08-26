# Example Counter Card

A simple custom Lovelace card that displays counter values with nice styling for demonstration purposes.

## Features

- **Clean Design**: Modern card styling that matches Home Assistant themes
- **Entity Display**: Shows entity state with customizable name
- **Unit Support**: Displays unit of measurement if available
- **Error Handling**: Shows unavailable state with different styling
- **Visual Editor**: Includes configuration editor in the UI

## Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to Frontend
3. Click the three dots menu → Custom repositories
4. Add this URL: `https://github.com/jo4santos/hass-repo-card-counter`
5. Select category: Lovelace
6. Click Add
7. Install "Example Counter Card"
8. Add the card resource to your dashboard

### Manual Installation

1. Download `example-counter-card.js` from the `dist/` folder
2. Copy it to `/config/www/` in your Home Assistant installation
3. Add the resource to your dashboard:
   - Go to Settings → Dashboards → Resources
   - Add `/local/example-counter-card.js` as a JavaScript Module

## Configuration

### Basic Configuration

```yaml
type: custom:example-counter-card
entity: sensor.example_counter
```

**Note**: Make sure you have the Example Counter integration installed and configured first:

```yaml
# configuration.yaml
example_counter:

sensor:
  - platform: example_counter
```

### Advanced Configuration

```yaml
type: custom:example-counter-card
entity: sensor.example_counter
name: "My Custom Counter"
```

## Configuration Options

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `entity` | string | Yes | - | Entity ID to display |
| `name` | string | No | Entity friendly name | Custom name for the card |

## Example Usage

Perfect for displaying:
- Counter sensors
- Step counters
- Event counters
- Statistics
- Any numeric sensor with incremental values

## Visual Editor

This card includes a visual configuration editor that appears when you add the card through the Home Assistant UI.

## Styling

The card automatically adapts to your Home Assistant theme and supports:
- Light and dark themes
- Custom accent colors
- Responsive design
- Accessibility features

## Compatibility

- Home Assistant 2023.1+
- Modern browsers with ES6 support
- All Home Assistant themes

## Support

This is an example card for demonstration purposes. For issues or feature requests, visit the [repository](https://github.com/jo4santos/hass-repo).