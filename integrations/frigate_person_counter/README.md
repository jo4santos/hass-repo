# Frigate Person Counter Integration

A Home Assistant custom integration that counts the number of times Frigate identifies a known person.

## Features

- **Person Detection Counter**: Counts new person detections from Frigate
- **Event-Driven**: Real-time updates when Frigate detects a person
- **Simple Setup**: Add via configuration.yaml with minimal configuration
- **HACS Compatible**: Can be installed as a custom repository
- **Frigate Integration**: Works seamlessly with your existing Frigate setup

## Installation

### Via HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to Integrations
3. Click the three dots menu → Custom repositories
4. Add this URL: `https://github.com/jo4santos/hass-repo-integration-counter`
5. Select category: Integration
6. Click Add
7. Install "Frigate Person Counter"
8. Restart Home Assistant

### Manual Installation

1. Download the `custom_components/frigate_person_counter` folder
2. Copy it to your Home Assistant `custom_components` directory
3. Restart Home Assistant

## Configuration

Add to your `configuration.yaml`:

```yaml
# Add the integration
frigate_person_counter:

# Add the sensor
sensor:
  - platform: frigate_person_counter
```

## Entities Created

- `sensor.frigate_person_count` - Counts the number of person detections from Frigate

## Requirements

- **Frigate**: This integration requires Frigate to be installed and configured
- **Frigate Integration**: The official Frigate Home Assistant integration should be set up
- **Person Detection**: Frigate should be configured to detect persons in your camera feeds

## Usage

Once configured, the integration will:
- Listen for Frigate person detection events
- Increment the counter when a new person is detected
- Provide real-time updates on your dashboards
- Allow you to track person detection trends over time
- Enable automations based on person detection counts

## Example Automation

```yaml
automation:
  - alias: "High Person Activity Alert"
    trigger:
      - platform: numeric_state
        entity_id: sensor.frigate_person_count
        above: 50
    action:
      - service: notify.mobile_app_your_phone
        data:
          message: "High person activity detected! {{ states('sensor.frigate_person_count') }} people detected today."
          
  - alias: "Reset Person Counter Daily"
    trigger:
      - platform: time
        at: "00:00:00"
    action:
      - service: homeassistant.set_state
        data:
          entity_id: sensor.frigate_person_count
          state: 0
```

## Support

This integration enhances Frigate functionality by providing person detection statistics. For issues or feature requests, visit the [repository](https://github.com/jo4santos/hass-repo).

## How It Works

The integration listens to Frigate's person detection events on the Home Assistant event bus. When Frigate detects a new person (event type: "new"), the counter is incremented. This provides real-time statistics about person detections in your surveillance system.