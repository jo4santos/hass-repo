# HACS Custom Integrations

Custom Home Assistant integrations. Each integration lives in its own subdirectory and is mirrored to a dedicated GitHub repo via git subtree so it can be installed via HACS as a custom repository.

## Integrations

| Path | HACS repo | Description |
| --- | --- | --- |
| [`morning_routine`](./morning_routine) | [`hass-repo-integration-morning-routine`](https://github.com/jo4santos/hass-repo-integration-morning-routine) | Gamified morning-routine tracker (points, achievements, per-child activities, Google Drive uploads). |

## Layout

```
integration_name/
├── custom_components/
│   └── integration_name/
│       ├── __init__.py
│       ├── manifest.json
│       └── ... (other integration files)
├── hacs.json
└── README.md
```

## Creating a new integration

1. Create the subdirectory and scaffold the layout above (see [Home Assistant integration docs](https://developers.home-assistant.io/docs/creating_integration_index/)).
2. Create the matching GitHub repo (`hass-repo-integration-<name>`).
3. Add the remote and push the subtree:
   ```bash
   git remote add <name>-integration-repo git@github.com:jo4santos/hass-repo-integration-<name>.git
   git subtree push --prefix=integrations/<name> <name>-integration-repo main
   ```
4. Append the push line to [`../update-subtrees.sh`](../update-subtrees.sh).
5. Install via HACS → ⋮ → Custom repositories with category **Integration**.

## Resources

- [Home Assistant Integration Development](https://developers.home-assistant.io/docs/creating_integration_index/)
- [HACS Integration Documentation](https://hacs.xyz/docs/publish/integration/)