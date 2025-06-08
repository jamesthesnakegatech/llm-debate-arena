#!/bin/bash

echo "=== Comprehensive Vote Debug ==="
echo ""

# First, let's check if the vote API file exists and what it contains
echo "1. Checking vote API file:"
if [ -f "pages/api/debate/[id]/vote.ts" ]; then
    echo "✓ File exists"
    echo "First few lines of vote handler:"
    head -20 "pages/api/debate/[id]/vote.ts"
else
    echo "✗ Vote API file not found!"
fi

echo ""
echo "2. Let's add debugging to the vote API:"

# Create a debug version of the vote API
cat > "pages/api/debate/[id]/vote.debug.ts" << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== Vote API Debug ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { winner, judgeId, reasoning } = req.body;
  
  console.log('Parsed values:');
  console.log('- Debate ID:', id);
  console.log('- Winner:', winner);
  console.log('- Judge ID:', judgeId);
  console.log('- Reasoning:', reasoning);
  console.log('- Winner type:', typeof winner);
  console.log('- JudgeId type:', typeof judgeId);

  if (!winner || !judgeId) {
    console.log('Missing required fields!');
    console.log('Winner present?', !!winner);
    console.log('JudgeId present?', !!judgeId);
    return res.status(400).json({ 
      error: 'Winner and judgeId are required',
      received: { winner, judgeId },
      bodyType: typeof req.body,
      body: req.body 
    });
  }

  // Rest of your vote logic...
  res.status(200).json({ 
    success: true, 
    message: 'Debug vote received',
    received: { winner, judgeId, reasoning }
  });
}
EOF

echo ""
echo "3. Let's also check the debate page for the vote submission:"
echo ""
echo "Searching for submitVote function:"
grep -n "submitVote" "pages/debate/[id].tsx" | head -5

echo ""
echo "4. Creating a test script to manually test the vote endpoint:"
cat > test_vote.sh << 'EOF'
#!/bin/bash

DEBATE_ID="cmbmw79iz0000l6qesfzbzk3h"
echo "Testing vote endpoint for debate: $DEBATE_ID"

curl -X POST "http://localhost:3000/api/debate/$DEBATE_ID/vote" \
  -H "Content-Type: application/json" \
  -d '{
    "winner": "llm1",
    "judgeId": "test-user-123",
    "reasoning": "Test vote"
  }' \
  -v
EOF

chmod +x test_vote.sh

echo ""
echo "✅ Debug files created!"
echo ""
echo "Next steps:"
echo "1. Replace pages/api/debate/[id]/vote.ts with vote.debug.ts temporarily"
echo "2. Check server console for detailed debug output when voting"
echo "3. Or run: ./test_vote.sh to test the endpoint directly"
echo ""
echo "The debug output will show exactly what the API is receiving."
