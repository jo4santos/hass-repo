# Home Assistant Themes

This directory contains custom Home Assistant themes that modify specific UI elements without completely overriding the interface.

## Philosophy

These themes follow a **minimal intervention** approach:
- Target specific UI elements only
- Preserve existing theme aesthetics  
- Enhance usability without disrupting workflows
- Focus on accessibility and visual clarity

## Available Themes

- **[Example Button Theme](./example_button_theme)** - Modifies only modal confirmation buttons for better UX

## Installation

### General Setup

1. **Enable themes** in your `configuration.yaml`:
```yaml
frontend:
  themes: !include_dir_merge_named themes
```

2. **Copy theme files** to your `/config/themes/` directory

3. **Restart Home Assistant**

4. **Apply theme**: Profile → Theme → Select desired theme

### Directory Structure

```
/config/themes/
├── theme_name.yaml
└── another_theme.yaml
```

Or organized in subdirectories:
```
/config/themes/
├── theme_name/
│   ├── theme_name.yaml
│   └── README.md
└── another_theme/
    ├── another_theme.yaml
    └── README.md
```

## Creating Custom Themes

### Basic Structure

```yaml
Theme Name:
  # CSS custom properties that Home Assistant uses
  primary-color: "#1976d2"
  text-primary-color: "#ffffff"
  # ... other variables
```

### Minimal Themes

For themes that only modify specific elements:

1. **Identify target variables** using browser dev tools
2. **Override only necessary properties**
3. **Use `var()` references** to inherit other values
4. **Test across different components**

### CSS Variables Reference

Common Home Assistant theme variables:
- `primary-color` - Main accent color
- `text-primary-color` - Primary text color
- `card-background-color` - Card backgrounds
- `primary-background-color` - Main background
- `mdc-theme-primary` - Material Design primary color
- `mdc-theme-secondary` - Material Design secondary color

## Testing Themes

1. **Apply theme** in profile settings
2. **Test modal dialogs** - delete entities, restart dialogs
3. **Check cards** - ensure readability is maintained
4. **Test mobile** - verify responsive behavior
5. **Check accessibility** - ensure sufficient contrast ratios

## Best Practices

- **Document changes** - explain what each theme modifies
- **Provide screenshots** - show before/after examples  
- **Test thoroughly** - across different components and screen sizes
- **Consider accessibility** - maintain proper contrast ratios
- **Keep it focused** - avoid unnecessary overrides

## Resources

- [Home Assistant Theme Documentation](https://www.home-assistant.io/integrations/frontend/#defining-themes)
- [Material Design Color System](https://material.io/design/color/)
- [CSS Custom Properties Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)