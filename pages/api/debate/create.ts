// pages/api/debate/create.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { topic, llm1, llm2 } = req.body

  // Validate inputs
  if (!topic || !llm1 || !llm2) {
    return res.status(400).json({ 
      error: 'Missing required fields: topic, llm1, and llm2' 
    })
  }

  // Basic topic validation - just check it's not too short or too long
  if (topic.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Topic must be at least 10 characters long' 
    })
  }

  if (topic.length > 200) {
    return res.status(400).json({ 
      error: 'Topic must be less than 200 characters' 
    })
  }

  // Check if LLMs are different
  if (llm1 === llm2) {
    return res.status(400).json({ 
      error: 'Please select two different LLMs' 
    })
  }

  try {
    // Randomly assign positions
    const positions = ['pro', 'con']
    const shuffled = positions.sort(() => Math.random() - 0.5)

    // Create the debate
    const debate = await prisma.debate.create({
      data: {
        topic,
        llm1Name: llm1,
        llm2Name: llm2,
        llm1Position: shuffled[0],
        llm2Position: shuffled[1],
        status: 'pending'
      }
    })

    res.status(200).json({ 
      success: true, 
      debateId: debate.id,
      positions: {
        [llm1]: shuffled[0],
        [llm2]: shuffled[1]
      }
    })

  } catch (error) {
    console.error('Error creating debate:', error)
    res.status(500).json({ 
      error: 'Failed to create debate' 
    })
  }
}
