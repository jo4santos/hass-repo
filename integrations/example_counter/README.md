# Example Counter Integration

A simple Home Assistant custom integration that provides a counter sensor for demonstration purposes.

## Features

- **Counter Sensor**: Provides a sensor that increments every 30 seconds
- **Simple Setup**: Add via configuration.yaml with minimal configuration
- **HACS Compatible**: Can be installed as a custom repository

## Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to Integrations
3. Click the three dots menu → Custom repositories
4. Add this URL: `https://github.com/jo4santos/hass-repo/tree/main/integrations/example_counter`
5. Select category: Integration
6. Click Add
7. Install "Example Counter"
8. Restart Home Assistant

### Manual Installation

1. Download the `custom_components/example_counter` folder
2. Copy it to your Home Assistant `custom_components` directory
3. Restart Home Assistant

## Configuration

Add to your `configuration.yaml`:

```yaml
sensor:
  - platform: example_counter
```

## Entities Created

- `sensor.example_counter` - A counter that increments every 30 seconds

## Usage

Once configured, the integration will create a sensor entity that you can:
- Display on dashboards
- Use in automations
- Monitor in history graphs
- Include in statistics

## Example Automation

```yaml
automation:
  - alias: "Counter Milestone Alert"
    trigger:
      - platform: numeric_state
        entity_id: sensor.example_counter
        above: 100
    action:
      - service: notify.mobile_app_your_phone
        data:
          message: "Counter reached 100!"
```

## Support

This is an example integration for demonstration purposes. For issues or feature requests, visit the [repository](https://github.com/jo4santos/hass-repo).