"""Frigate Person Counter sensor platform."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, Event, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(seconds=30)


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the Frigate Person Counter sensor platform (YAML config)."""
    _LOGGER.info("Setting up Frigate Person Counter sensor platform from YAML")
    async_add_entities([FrigatePersonCounterSensor(hass)], update_before_add=True)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Frigate Person Counter sensor from config entry (UI)."""
    _LOGGER.info("Setting up Frigate Person Counter sensor from config entry")
    async_add_entities([FrigatePersonCounterSensor(hass)], update_before_add=True)


class FrigatePersonCounterSensor(SensorEntity):
    """Representation of a Frigate Person Counter sensor."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the sensor."""
        self._hass = hass
        self._attr_name = "Frigate Person Count"
        self._attr_unique_id = "frigate_person_counter_sensor"
        self._attr_icon = "mdi:account-multiple"
        self._attr_native_unit_of_measurement = "detections"
        self._attr_native_value = 0
        self._attr_available = True
        self._remove_listener = None

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Listen for Frigate person events
        self._remove_listener = self._hass.bus.async_listen(
            "frigate/person", self._handle_frigate_event
        )
        _LOGGER.info("Started listening for Frigate person events")

    async def async_will_remove_from_hass(self) -> None:
        """Run when entity will be removed from hass."""
        if self._remove_listener:
            self._remove_listener()
        await super().async_will_remove_from_hass()

    @callback
    def _handle_frigate_event(self, event: Event) -> None:
        """Handle Frigate person detection event."""
        try:
            event_data = event.data
            event_type = event_data.get("type")
            
            # Only count 'new' person events (when person first appears)
            if event_type == "new":
                label = event_data.get("after", {}).get("label")
                if label == "person":
                    self._attr_native_value += 1
                    self.async_write_ha_state()
                    _LOGGER.info("Frigate person detected. Count: %s", self._attr_native_value)
                    
        except Exception as ex:
            _LOGGER.error("Error handling Frigate event: %s", ex)
            self._attr_available = False
            self.async_write_ha_state()

    @property
    def native_value(self) -> int:
        """Return the native value of the sensor."""
        return self._attr_native_value

    @property
    def extra_state_attributes(self) -> dict:
        """Return additional state attributes."""
        return {
            "integration": "frigate_person_counter",
            "event_type": "frigate/person",
            "description": "Counts new person detections from Frigate"
        }

    def update(self) -> None:
        """Update the sensor state (not used for event-driven updates)."""
        # This sensor is event-driven, so no regular updates needed
        pass