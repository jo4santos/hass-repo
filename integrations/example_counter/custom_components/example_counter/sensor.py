"""Example Counter sensor platform."""
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
    async_add_entities([ExampleCounterSensor()])


class ExampleCounterSensor(SensorEntity):
    """Representation of an Example Counter sensor."""

    def __init__(self):
        """Initialize the sensor."""
        self._attr_name = "Example Counter"
        self._attr_unique_id = "example_counter_sensor"
        self._state = 0
        self._attr_icon = "mdi:counter"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return "count"

    def update(self):
        """Update the sensor state."""
        self._state += 1
        _LOGGER.debug("Counter updated to: %s", self._state)