#!/bin/bash
# Helper script to update git subtrees after making changes
# Run this script whenever you make changes to integrations, cards, or themes

echo "Updating HACS repositories via git subtree..."

echo "Pushing integration subtree..."
git subtree push --prefix=integrations/example_counter integration-repo main

echo "Pushing example counter card subtree..."
git subtree push --prefix=cards/example_counter_card card-repo main

echo "Pushing toggle confirmation card subtree..."
git subtree push --prefix=cards/toggle_confirmation_card toggle-card-repo main

echo "Pushing theme subtree..."
git subtree push --prefix=themes/example_button_theme theme-repo main

echo "✅ All subtrees updated successfully!"
echo ""
echo "HACS URLs:"
echo "Integration: https://github.com/jo4santos/hass-repo-integration-counter"
echo "Counter Card: https://github.com/jo4santos/hass-repo-card-counter"
echo "Toggle Card: https://github.com/jo4santos/hass-repo-toggle-card"
echo "Theme: https://github.com/jo4santos/hass-repo-theme"