#!/bin/bash

echo "=== Cleaning Up Stray Files ==="
echo ""

# List files that shouldn't be in the root directory
echo "Looking for stray debugging files..."

# Remove debugging/temporary files
files_to_remove=(
    "working_vote_section.tsx"
    "vote-test.html"
    "auto-continue-test.html"
    "manual-controller.html"
    "fix_submit_vote.ts"
    "fix_submit_vote_proper.ts"
    "manual_vote_fix.md"
    "fix_create_free.patch"
    "add_autocontinue.patch"
    "test_vote.sh"
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        echo "Removing: $file"
        rm "$file"
    fi
done

# Also clean up any .tsx files that shouldn't be in root
echo ""
echo "Checking for other misplaced .tsx files in root..."
for file in *.tsx; do
    if [ -f "$file" ]; then
        echo "Found: $file - this should probably be in pages/ or components/"
        echo "Moving to backup..."
        mkdir -p backup_files
        mv "$file" backup_files/
    fi
done

# Clean up patch files
echo ""
echo "Cleaning up patch files..."
rm -f *.patch

# Clean up shell scripts we don't need anymore
echo ""
echo "Cleaning up temporary scripts..."
temp_scripts=(
    "debug_*.sh"
    "check_*.sh"
    "test_*.sh"
    "fix_*.sh"
    "see_*.sh"
    "turn.sh"
    "continue.sh"
)

for pattern in "${temp_scripts[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "setup_elo_script.sh" ]; then
            echo "Removing: $file"
            rm "$file"
        fi
    done
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Building again..."
npm run build
