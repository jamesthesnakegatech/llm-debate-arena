import { NextApiRequest, NextApiResponse } from 'next';
import { factCheckService } from '../../lib/fact-check-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { claim, claims, text, context, debug } = req.body;

  try {
    // Enable debug logging
    if (debug) {
      console.log('Fact-check request:', { claim, claims, text, context });
    }

    if (claim) {
      const result = await factCheckService.checkClaim(claim, context);
      if (debug) {
        console.log('Fact-check result:', result);
      }
      return res.status(200).json({ success: true, result });
    }

    if (claims && Array.isArray(claims)) {
      const results = await factCheckService.checkMultipleClaims(claims, context);
      return res.status(200).json({ success: true, results });
    }

    if (text) {
      const extractedClaims = factCheckService.extractClaimsFromText(text);
      const results = await factCheckService.checkMultipleClaims(extractedClaims, context);
      return res.status(200).json({ 
        success: true, 
        extractedClaims,
        results 
      });
    }

    return res.status(400).json({ 
      error: 'Please provide either: claim (string), claims (array), or text (string)' 
    });
  } catch (error) {
    console.error('Fact-check API error:', error);
    res.status(500).json({ error: 'Failed to check facts' });
  }
}
