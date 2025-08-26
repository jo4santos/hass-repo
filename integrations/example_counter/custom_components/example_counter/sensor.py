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
    _LOGGER.info("Setting up Example Counter sensor platform")
    async_add_entities([ExampleCounterSensor()], True)


class ExampleCounterSensor(SensorEntity):
    """Representation of an Example Counter sensor."""

    def __init__(self):
        """Initialize the sensor."""
        self._attr_name = "Example Counter"
        self._attr_unique_id = "example_counter_sensor"
        self._attr_entity_id = "sensor.example_counter"
        self._state = 0
        self._attr_icon = "mdi:counter"
        self._available = True

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return "count"

    @property
    def available(self):
        """Return if entity is available."""
        return self._available

    @property
    def device_class(self):
        """Return device class."""
        return None

    def update(self):
        """Update the sensor state."""
        try:
            self._state += 1
            self._available = True
            _LOGGER.debug("Counter updated to: %s", self._state)
        except Exception as ex:
            _LOGGER.error("Error updating sensor: %s", ex)
            self._available = False