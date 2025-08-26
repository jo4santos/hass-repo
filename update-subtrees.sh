#!/bin/bash
# Helper script to update git subtrees after making changes
# Run this script whenever you make changes to integrations or cards

echo "Updating HACS repositories via git subtree..."

echo "Pushing integration subtree..."
git subtree push --prefix=integrations/example_counter integration-repo main

echo "Pushing card subtree..."
git subtree push --prefix=cards/example_counter_card card-repo main

echo "✅ All subtrees updated successfully!"
echo ""
echo "HACS URLs:"
echo "Integration: https://github.com/jo4santos/hass-repo-integration-counter"
echo "Card: https://github.com/jo4santos/hass-repo-card-counter"