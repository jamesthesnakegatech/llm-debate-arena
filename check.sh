#!/bin/bash

echo "=== Verifying and Updating Debate Page ==="
echo ""

# 1. Check if backup exists
if [ -f "pages/debate/[id].tsx.backup" ]; then
    echo "✓ Backup file exists"
    echo "Comparing file sizes:"
    ls -la pages/debate/\[id\].tsx*
else
    echo "✗ No backup found - the update script may not have run"
fi

echo ""
echo "2. Checking for key indicators in current file:"
echo -n "  - Has 'router.reload()': "
grep -q "router.reload()" pages/debate/\[id\].tsx && echo "YES (needs update)" || echo "NO"
echo -n "  - Has 'Auto-continue': "
grep -q "Auto-continue" pages/debate/\[id\].tsx && echo "YES" || echo "NO (needs update)"

echo ""
echo "3. Let's add the auto-continue code directly:"

# Create a temporary file with the auto-continue code to insert
cat > auto_continue_code.tmp << 'EOF'

  // Auto-continue debate
  useEffect(() => {
    if ((debate.status === 'in_progress' || debate.status === 'active') && 
        debate.turns.length > 0 && 
        debate.turns.length < MAX_TURNS && 
        !isGenerating && 
        !showVoting) {
      // Auto-continue after a delay
      const timer = setTimeout(() => {
        continueDebate();
      }, 3000); // 3 seconds between turns
      
      return () => clearTimeout(timer);
    }
  }, [debate.turns.length, debate.status, isGenerating, showVoting]);
EOF

# Now let's update the file properly
echo ""
echo "4. Updating the debate page file..."

# First, let's find where to insert the auto-continue code (after the socket useEffect)
LINE_NUM=$(grep -n "}, \[socket\])" pages/debate/\[id\].tsx | cut -d: -f1)

if [ -n "$LINE_NUM" ]; then
    echo "Found insertion point at line $LINE_NUM"
    
    # Create a new file with the auto-continue code inserted
    head -n $LINE_NUM pages/debate/\[id\].tsx > pages/debate/\[id\].tsx.new
    cat auto_continue_code.tmp >> pages/debate/\[id\].tsx.new
    tail -n +$((LINE_NUM + 1)) pages/debate/\[id\].tsx >> pages/debate/\[id\].tsx.new
    
    # Also fix the router.reload() issue
    sed -i '' 's/router.reload()/\/\/ router.reload() - removed for auto-continue\n        if (data.turn) {\n          setDebate(prev => ({\n            ...prev,\n            status: "in_progress",\n            turns: [data.turn]\n          }));\n        }/' pages/debate/\[id\].tsx.new
    
    # Fix the status display
    sed -i '' 's/debate.status === '\''pending'\''/\(debate.status === '\''created'\'' || debate.status === '\''pending'\''\)/g' pages/debate/\[id\].tsx.new
    sed -i '' 's/debate.status === '\''active'\''/\(debate.status === '\''in_progress'\'' || debate.status === '\''active'\''\)/g' pages/debate/\[id\].tsx.new
    
    # Replace the original file
    mv pages/debate/\[id\].tsx pages/debate/\[id\].tsx.backup2
    mv pages/debate/\[id\].tsx.new pages/debate/\[id\].tsx
    
    echo "✓ File updated successfully!"
else
    echo "✗ Could not find insertion point. Manual update needed."
fi

# Clean up
rm -f auto_continue_code.tmp

echo ""
echo "5. Verifying the update:"
echo -n "  - Has 'Auto-continue': "
grep -q "Auto-continue" pages/debate/\[id\].tsx && echo "YES ✓" || echo "NO ✗"
echo -n "  - Has 'router.reload()': "
grep -q "router.reload()" pages/debate/\[id\].tsx && echo "Found (check if commented)" || echo "NO ✓"

echo ""
echo "Done! Restart your dev server to see the changes."
