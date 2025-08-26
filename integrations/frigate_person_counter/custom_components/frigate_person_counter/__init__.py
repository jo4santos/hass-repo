"""The Frigate Person Counter integration."""
from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

DOMAIN = "frigate_person_counter"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Frigate Person Counter component from configuration.yaml."""
    # Initialize integration data
    hass.data[DOMAIN] = {}
    
    # The sensor platform will be loaded automatically when configured
    # in configuration.yaml under sensor: - platform: frigate_person_counter
    return True