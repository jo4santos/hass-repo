"""Example Counter sensor platform."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant
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
    """Set up the Example Counter sensor platform."""
    _LOGGER.info("Setting up Example Counter sensor platform")
    async_add_entities([ExampleCounterSensor()], update_before_add=True)


class ExampleCounterSensor(SensorEntity):
    """Representation of an Example Counter sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._attr_name = "Example Counter"
        self._attr_unique_id = "example_counter_sensor"
        self._attr_icon = "mdi:counter"
        self._attr_native_unit_of_measurement = "count"
        self._attr_native_value = 0
        self._attr_available = True

    @property
    def native_value(self) -> int:
        """Return the native value of the sensor."""
        return self._attr_native_value

    def update(self) -> None:
        """Update the sensor state."""
        try:
            self._attr_native_value += 1
            self._attr_available = True
            _LOGGER.debug("Counter updated to: %s", self._attr_native_value)
        except Exception as ex:
            _LOGGER.error("Error updating sensor: %s", ex)
            self._attr_available = False