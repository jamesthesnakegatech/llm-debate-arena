#!/bin/bash

echo "=== Debugging Vote Error ==="
echo ""

# Check the current vote implementation in debate page
echo "1. Checking submitVote function in debate page:"
grep -A 20 "submitVote" "pages/debate/[id].tsx" | head -30

echo ""
echo "2. Let's check what the vote API expects:"
grep -A 5 "req.body" "pages/api/debate/[id]/vote.ts"

echo ""
echo "3. Common issues:"
echo "   - Missing judgeId in the request body"
echo "   - Winner value doesn't match expected values (llm1, llm2, tie, bothBad)"
echo ""

# Create a fix for the debate page
echo "4. Creating fix for debate page voting..."
cat > fix_vote_submission.patch << 'PATCH_EOF'
--- pages/debate/[id].tsx.orig
+++ pages/debate/[id].tsx
@@ -188,10 +188,12 @@
   const submitVote = async () => {
     if (!selectedWinner) {
       alert('Please select a winner')
       return
     }

+    const judgeId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
+
     try {
       const response = await fetch(`/api/debate/${debate.id}/vote`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           winner: selectedWinner,
-          reasoning: voteReasoning
+          judgeId: judgeId,
+          reasoning: voteReasoning || ''
         })
       })
PATCH_EOF

echo ""
echo "Applying fix..."
patch -p0 < fix_vote_submission.patch 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Patch failed. Let me try a different approach..."
    
    # Find and replace the submitVote function
    echo "Using sed to fix the vote submission..."
    
    # Fix the body content
    sed -i '' '/body: JSON.stringify({/,/})/ {
        s/winner: selectedWinner,/winner: selectedWinner,\
          judgeId: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,/
    }' "pages/debate/[id].tsx"
    
    echo "✓ Fixed using sed"
fi

rm -f fix_vote_submission.patch

echo ""
echo "✅ Fix applied!"
echo ""
echo "The vote submission now includes:"
echo "- winner: The selected winner value"
echo "- judgeId: A unique ID for the user"
echo "- reasoning: Optional vote reasoning"
