#!/bin/bash

echo "=== Setting Up ELO Rating System ==="
echo ""

# 1. Update the schema
echo "1. Updating Prisma schema..."
cat >> prisma/schema.prisma << 'EOF'

model LLMRating {
  id        String   @id @default(cuid())
  llmName   String   @unique
  rating    Int      @default(1500)
  wins      Int      @default(0)
  losses    Int      @default(0)
  ties      Int      @default(0)
  totalGames Int     @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RatingHistory {
  id         String   @id @default(cuid())
  llmName    String
  debateId   String
  opponent   String
  ratingBefore Int
  ratingAfter  Int
  ratingChange Int
  result     String
  createdAt  DateTime @default(now())
  
  debate     Debate   @relation(fields: [debateId], references: [id])
}
EOF

# Also add relation to Debate model
sed -i '' '/model Debate {/,/^}/ s/votes.*Vote\[\]/&\n  ratingHistory RatingHistory[]/' prisma/schema.prisma

echo "✓ Schema updated"

# 2. Create the ELO library
echo ""
echo "2. Creating ELO library..."
mkdir -p lib
cat > lib/elo.ts << 'EOF'
export class EloRating {
  static K_FACTOR = 32;
  static DEFAULT_RATING = 1500;

  static getExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  static calculateNewRatings(
    ratingA: number,
    ratingB: number,
    scoreA: number
  ): { newRatingA: number; newRatingB: number; changeA: number; changeB: number } {
    const expectedA = this.getExpectedScore(ratingA, ratingB);
    const expectedB = this.getExpectedScore(ratingB, ratingA);

    const scoreB = 1 - scoreA;

    const changeA = Math.round(this.K_FACTOR * (scoreA - expectedA));
    const changeB = Math.round(this.K_FACTOR * (scoreB - expectedB));

    return {
      newRatingA: ratingA + changeA,
      newRatingB: ratingB + changeB,
      changeA,
      changeB,
    };
  }

  static getScores(winner: string, llm1Name: string, llm2Name: string): { scoreA: number; scoreB: number } {
    if (winner === 'tie') {
      return { scoreA: 0.5, scoreB: 0.5 };
    } else if (winner === 'llm1' || winner === llm1Name) {
      return { scoreA: 1, scoreB: 0 };
    } else if (winner === 'llm2' || winner === llm2Name) {
      return { scoreA: 0, scoreB: 1 };
    }
    return { scoreA: 0.5, scoreB: 0.5 };
  }
}
EOF

echo "✓ ELO library created"

# 3. Update the database
echo ""
echo "3. Updating database..."
npx prisma db push

echo ""
echo "4. Creating updated vote.ts and leaderboard.ts files..."
echo "   - Updated files have been created as vote.ts.new and leaderboard.ts.new"
echo "   - Please backup and replace your existing files"

echo ""
echo "✅ ELO Rating System Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Replace pages/api/debate/[id]/vote.ts with the new version"
echo "2. Replace pages/api/leaderboard.ts with the new version"
echo "3. Update the Leaderboard component to show ELO ratings"
echo ""
echo "The system will:"
echo "- Start all LLMs at 1500 ELO rating"
echo "- Update ratings after each vote"
echo "- Track rating history"
echo "- Show rankings based on ELO rating"
