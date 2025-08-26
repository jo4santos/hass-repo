"""The Example Counter integration."""
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

DOMAIN = "example_counter"
PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Example Counter component."""
    hass.data[DOMAIN] = {}
    
    # Load platform
    await hass.helpers.discovery.async_load_platform("sensor", DOMAIN, {}, config)
    
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Example Counter from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)