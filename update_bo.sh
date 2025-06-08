#!/bin/bash

echo "=== Updating Index Page for ELO Leaderboard ==="
echo ""

# Update the import in index.tsx
sed -i '' "s/import Leaderboard from '..\/components\/Leaderboard'/import EloLeaderboard from '..\/components\/EloLeaderboard'/" pages/index.tsx

# Update the component usage
sed -i '' 's/<Leaderboard \/>/<EloLeaderboard \/>/' pages/index.tsx

echo "✅ Index page updated!"
echo ""
echo "Final steps:"
echo "1. Run: npx prisma db push"
echo "2. Restart your dev server"
echo "3. Vote on some debates to see ELO ratings in action!"
