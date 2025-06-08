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
