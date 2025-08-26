"""The Example Counter integration."""
from homeassistant.core import HomeAssistant

DOMAIN = "example_counter"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Example Counter component from configuration.yaml."""
    if DOMAIN not in config:
        return True
        
    hass.data[DOMAIN] = {}
    
    # Load the sensor platform if configured
    if "sensor" in config:
        for sensor_config in config["sensor"]:
            if sensor_config.get("platform") == DOMAIN:
                await hass.helpers.discovery.async_load_platform(
                    "sensor", DOMAIN, sensor_config, config
                )
    
    return True