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
