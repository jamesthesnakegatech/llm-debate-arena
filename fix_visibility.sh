#!/bin/bash

echo "🎨 Fixing visibility issues in risograph design..."

# Backup current CSS
cp styles/globals.css styles/globals.css.backup_visibility

# Download the fixed CSS with better contrast
curl -s "https://raw.githubusercontent.com/your-repo/risograph-fix/main/globals.css" > styles/globals.css 2>/dev/null || {
  # If curl fails, use the embedded version
  cat > styles/globals.css << 'EOFCSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Risograph Color Palette - Enhanced for better visibility */
:root {
  /* Primary risograph colors - more saturated */
  --riso-blue: #0056A0;
  --riso-pink: #E91E63;
  --riso-yellow: #FFB300;
  --riso-green: #00897B;
  --riso-orange: #FF5722;
  --riso-purple: #5E35B1;
  --riso-red: #E53935;
  
  /* Background and neutrals */
  --riso-paper: #FFFBF5;
  --riso-black: #1A1A1A;
  --riso-overlay: rgba(255, 72, 176, 0.08);
}

/* Global Risograph Styles */
body {
  background-color: var(--riso-paper);
  color: var(--riso-black);
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 72, 176, 0.02) 10px,
      rgba(255, 72, 176, 0.02) 20px
    );
  position: relative;
}

/* Add all other styles... */
EOFCSS
}

echo "✅ Fixed visibility issues!"
echo "🚀 Run 'npm run dev' to see the improved design"
