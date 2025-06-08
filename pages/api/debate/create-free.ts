import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
// Free LLM models available
const FREE_AVAILABLE_LLMS = [
  { name: "Gemini Pro (Free)", value: "gemini-pro" },
  { name: "Llama 2 (Free)", value: "llama-2-70b" },
  { name: "Mixtral (Free)", value: "mixtral-8x7b" },
];

const DEBATE_TOPICS = [
  "Artificial Intelligence development should be heavily regulated by governments",
  "Remote work is more productive than office work for most jobs", 
  "Social media platforms should ban users under 16 years old",
  "Nuclear energy is the best solution to combat climate change",
  "Universal Basic Income should be implemented in developed countries"
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic, llm1, llm2 } = req.body

    // Validate inputs
    if (!topic || !llm1 || !llm2) {
      return res.status(400).json({ 
        error: 'Missing required fields: topic, llm1, llm2' 
      })
    }

    if (!DEBATE_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        error: 'Invalid topic. Must be one of the predefined topics.' 
      })
    }

    if (!FREE_AVAILABLE_LLMS[llm1] || !FREE_AVAILABLE_LLMS[llm2]) {
      return res.status(400).json({ 
        error: 'Invalid LLM selection' 
      })
    }

    // Randomly assign pro/con positions
    const isLlm1Pro = Math.random() > 0.5
    
    const debate = await prisma.debate.create({
      data: {
        topic,
        llm1Name: FREE_AVAILABLE_LLMS[llm1].name,
        llm2Name: FREE_AVAILABLE_LLMS[llm2].name,
        llm1Position: isLlm1Pro ? 'pro' : 'con',
        llm2Position: isLlm1Pro ? 'con' : 'pro',
        status: 'pending'
      }
    })

    res.status(201).json({ 
      success: true, 
      debate: {
        id: debate.id,
        topic: debate.topic,
        llm1: { name: debate.llm1Name, position: debate.llm1Position },
        llm2: { name: debate.llm2Name, position: debate.llm2Position },
        status: debate.status
      }
    })

  } catch (error) {
    console.error('Error creating debate:', error)
    res.status(500).json({ 
      error: 'Failed to create debate' 
    })
  }
}
