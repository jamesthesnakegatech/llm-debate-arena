// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface SearchRequest {
  query: string;
  apiKey: string;
  count?: number;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl?: string;
}

interface SearchResponse {
  results: SearchResult[];
  error?: string;
}

// Rate limiting setup
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count += 1;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      results: [],
      error: 'Method not allowed. Use POST.' 
    });
  }

  // Get client IP for rate limiting
  const clientIp = req.headers['x-forwarded-for'] as string || 
                   req.headers['x-real-ip'] as string || 
                   req.socket.remoteAddress || 
                   'unknown';

  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      results: [],
      error: 'Rate limit exceeded. Please try again later.' 
    });
  }

  const { query, apiKey, count = 5 }: SearchRequest = req.body;

  // Validate inputs
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ 
      results: [],
      error: 'Query parameter is required and must be a string.' 
    });
  }

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ 
      results: [],
      error: 'API key is required.' 
    });
  }

  // Sanitize query
  const sanitizedQuery = query.trim().slice(0, 500); // Limit query length

  try {
    // Option 1: Using Bing Search API
    const bingResults = await searchWithBing(sanitizedQuery, apiKey, count);
    if (bingResults) {
      return res.status(200).json({ results: bingResults });
    }

    // Option 2: Using Google Custom Search API (fallback)
    const googleResults = await searchWithGoogle(sanitizedQuery, apiKey, count);
    if (googleResults) {
      return res.status(200).json({ results: googleResults });
    }

    // If no search service is configured properly
    return res.status(503).json({ 
      results: [],
      error: 'Search service is not properly configured.' 
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    // Don't expose internal error details to client
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    const statusCode = errorMessage.includes('401') ? 401 : 
                      errorMessage.includes('403') ? 403 : 
                      errorMessage.includes('429') ? 429 : 500;
    
    return res.status(statusCode).json({ 
      results: [],
      error: `Search failed: ${statusCode === 401 ? 'Invalid API key' : 
                             statusCode === 403 ? 'Access forbidden' :
                             statusCode === 429 ? 'API rate limit exceeded' :
                             'Internal server error'}` 
    });
  }
}

async function searchWithBing(
  query: string, 
  apiKey: string, 
  count: number
): Promise<SearchResult[] | null> {
  try {
    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${count}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Bing API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract web pages from Bing response
    const results: SearchResult[] = data.webPages?.value?.map((page: any) => ({
      title: page.name,
      url: page.url,
      snippet: page.snippet,
      displayUrl: page.displayUrl
    })) || [];

    return results;
  } catch (error) {
    console.error('Bing search error:', error);
    return null;
  }
}

async function searchWithGoogle(
  query: string, 
  apiKey: string, 
  count: number
): Promise<SearchResult[] | null> {
  // Note: For Google Custom Search, you also need a Search Engine ID (cx)
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!searchEngineId) {
    console.log('Google Search Engine ID not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=${count}`,
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract items from Google response
    const results: SearchResult[] = data.items?.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      displayUrl: item.displayLink
    })) || [];

    return results;
  } catch (error) {
    console.error('Google search error:', error);
    return null;
  }
}

// For Next.js 13+ app directory, use this instead:
/*
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... same logic as above ...
    
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { results: [], error: 'Invalid request' },
      { status: 400 }
    );
  }
}
*/
