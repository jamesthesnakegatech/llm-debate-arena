import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { EloRating } from '../../../../lib/elo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { winner, judgeId, reasoning } = req.body;

  if (!winner || !judgeId) {
    return res.status(400).json({ error: 'Winner and judgeId are required' });
  }

  try {
    // Get debate details
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status !== 'completed') {
      return res.status(400).json({ error: 'Debate is not completed yet' });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        debateId: id as string,
        judgeId: judgeId,
      },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this debate' });
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        debateId: id as string,
        judgeId,
        winner,
        reasoning,
      },
    });

    // Get or create LLM ratings
    let llm1Rating = await prisma.lLMRating.findUnique({
      where: { llmName: debate.llm1Name },
    });

    if (!llm1Rating) {
      llm1Rating = await prisma.lLMRating.create({
        data: {
          llmName: debate.llm1Name,
          rating: EloRating.DEFAULT_RATING,
        },
      });
    }

    let llm2Rating = await prisma.lLMRating.findUnique({
      where: { llmName: debate.llm2Name },
    });

    if (!llm2Rating) {
      llm2Rating = await prisma.lLMRating.create({
        data: {
          llmName: debate.llm2Name,
          rating: EloRating.DEFAULT_RATING,
        },
      });
    }

    // Calculate new ratings
    const { scoreA, scoreB } = EloRating.getScores(winner, debate.llm1Name, debate.llm2Name);
    const { newRatingA, newRatingB, changeA, changeB } = EloRating.calculateNewRatings(
      llm1Rating.rating,
      llm2Rating.rating,
      scoreA
    );

    // Update ratings
    await prisma.lLMRating.update({
      where: { llmName: debate.llm1Name },
      data: {
        rating: newRatingA,
        wins: winner === 'llm1' ? { increment: 1 } : undefined,
        losses: winner === 'llm2' ? { increment: 1 } : undefined,
        ties: winner === 'tie' || winner === 'bothBad' ? { increment: 1 } : undefined,
        totalGames: { increment: 1 },
      },
    });

    await prisma.lLMRating.update({
      where: { llmName: debate.llm2Name },
      data: {
        rating: newRatingB,
        wins: winner === 'llm2' ? { increment: 1 } : undefined,
        losses: winner === 'llm1' ? { increment: 1 } : undefined,
        ties: winner === 'tie' || winner === 'bothBad' ? { increment: 1 } : undefined,
        totalGames: { increment: 1 },
      },
    });

    // Record rating history
    await prisma.ratingHistory.createMany({
      data: [
        {
          llmName: debate.llm1Name,
          debateId: debate.id,
          opponent: debate.llm2Name,
          ratingBefore: llm1Rating.rating,
          ratingAfter: newRatingA,
          ratingChange: changeA,
          result: winner === 'llm1' ? 'win' : winner === 'llm2' ? 'loss' : 'tie',
        },
        {
          llmName: debate.llm2Name,
          debateId: debate.id,
          opponent: debate.llm1Name,
          ratingBefore: llm2Rating.rating,
          ratingAfter: newRatingB,
          ratingChange: changeB,
          result: winner === 'llm2' ? 'win' : winner === 'llm1' ? 'loss' : 'tie',
        },
      ],
    });

    // Get updated vote counts
    const votes = await prisma.vote.findMany({
      where: { debateId: id as string },
    });

    const voteCount = {
      llm1: votes.filter(v => v.winner === 'llm1').length,
      llm2: votes.filter(v => v.winner === 'llm2').length,
      tie: votes.filter(v => v.winner === 'tie').length,
      bothBad: votes.filter(v => v.winner === 'bothBad').length,
    };

    res.status(200).json({ 
      success: true, 
      vote, 
      voteCount,
      ratingChanges: {
        [debate.llm1Name]: { 
          before: llm1Rating.rating, 
          after: newRatingA, 
          change: changeA 
        },
        [debate.llm2Name]: { 
          before: llm2Rating.rating, 
          after: newRatingB, 
          change: changeB 
        },
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
}
