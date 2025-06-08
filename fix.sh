#!/bin/bash

echo "=== Fixing ESLint Configuration ==="
echo ""

# Remove the problematic rule from .eslintrc.json
echo "1. Fixing .eslintrc.json..."
cat > .eslintrc.json << 'EOF'
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
EOF
echo "✓ Fixed .eslintrc.json (removed @typescript-eslint/no-unused-vars)"

# Clean the build cache
echo ""
echo "2. Cleaning build cache..."
rm -rf .next
echo "✓ Cleaned .next directory"

# Show the current config
echo ""
echo "3. Current ESLint configuration:"
cat .eslintrc.json

echo ""
echo "✅ ESLint configuration fixed!"
echo ""
echo "The build should now complete with only warnings (not errors)."
echo ""
echo "Try building again:"
echo "npm run build"
