# Confirmation Modal Buttons - Standalone CSS

**IGNORE THE THEME** - Use only this CSS file to style your confirmation modal buttons without affecting anything else in your Home Assistant UI.

## What This Does

- 🎯 **ONLY** targets confirmation modal buttons from `tap_action: confirmation:`
- 🔴 **Red Cancel button** (48px height, 45% width)
- 🟢 **Green OK button** (48px height, 45% width)
- ✨ **Hover effects** and better spacing
- ❌ **ZERO changes** to your existing theme/UI

## Installation (No Theme Required)

### Step 1: Download CSS File
Download `confirmation-buttons-only.css` from this repository.

### Step 2: Copy to Home Assistant
Copy the file to `/config/www/confirmation-buttons-only.css`

### Step 3: Add as Lovelace Resource
1. Go to **Settings** → **Dashboards** → **Resources**
2. Click **Add Resource**
3. **URL**: `/local/confirmation-buttons-only.css`
4. **Resource Type**: **Stylesheet**
5. Click **Create**

### Step 4: Restart Home Assistant
Restart Home Assistant to load the CSS resource.

### Step 5: Test
Use any card with confirmation:
```yaml
type: entity
entity: light.example
tap_action:
  action: toggle
  confirmation:
    text: "Are you sure?"
```

## Result
- Your existing theme stays exactly the same
- Only confirmation modal buttons change style
- Red Cancel + Green OK buttons, bigger and better positioned

## Troubleshooting

If buttons don't change:
1. Check the file is in `/config/www/confirmation-buttons-only.css`
2. Verify the resource was added correctly in Dashboard Resources
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check Developer Tools Console for CSS loading errors

## DOM Structure Targeted

This CSS targets the actual DOM structure:
```
/html/body/home-assistant//dialog-box//ha-md-dialog/div[3]/ha-button[1] (Cancel - Red)
/html/body/home-assistant//dialog-box//ha-md-dialog/div[3]/ha-button[2] (OK - Green)
```

CSS Selectors used:
```css
home-assistant dialog-box ha-md-dialog div:nth-child(3) ha-button:first-child     /* Cancel */
home-assistant dialog-box ha-md-dialog div:nth-child(3) ha-button:nth-child(2)   /* OK */
```