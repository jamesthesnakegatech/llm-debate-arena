#!/bin/bash

echo "🔧 Fixing TypingIndicator usage..."

# Create a Node.js script to fix the TypingIndicator
cat > fix_typing_indicator.js << 'ENDOFFILE'
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/debate/[id].tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the color prop from TypingIndicator
const typingIndicatorPattern = /<TypingIndicator\s+llmName=\{[^}]+\}\s+color=\{[^}]+\}\s*\/>/g;

content = content.replace(typingIndicatorPattern, (match) => {
  // Extract just the llmName prop
  const llmNameMatch = match.match(/llmName=\{([^}]+)\}/);
  if (llmNameMatch) {
    return `<TypingIndicator
                      llmName={${llmNameMatch[1]}}
                    />`;
  }
  return match;
});

// Alternative simpler approach - just remove the color line
content = content.replace(
  /color=\{safeTurns\.length % 2 === 0 \? 'blue' : 'red'\}\s*/g,
  ''
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ TypingIndicator fixed!');
ENDOFFILE

# Run the fix
node fix_typing_indicator.js

# Clean up
rm -f fix_typing_indicator.js

echo "
✅ TypingIndicator usage fixed!

The color prop has been removed from TypingIndicator component.

Try building again:
  npm run build
"
