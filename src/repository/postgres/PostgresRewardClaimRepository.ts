import { eq, and } from 'drizzle-orm';
import { db } from '../../db/postgres/connectDb';
import { rewardClaims } from '../../db/postgres/schema/RewardClaimSchema';
import { RewardClaim } from '../../entity/RewardClaim';
import { IRewardClaimRepository } from '../interface/IRewardClaimRepository';

export class PostgresRewardClaimRepository implements IRewardClaimRepository {
  constructor(private client: typeof db) {}

  async findById(playerId: string, bossId: string): Promise<RewardClaim | undefined> {
    const result = await this.client
      .select()
      .from(rewardClaims)
      .where(and(eq(rewardClaims.playerId, playerId), eq(rewardClaims.bossId, bossId)))
      .limit(1);

    if (result.length === 0) return undefined;

    const rewardClaim = new RewardClaim();
    rewardClaim.playerId = result[0].playerId;
    rewardClaim.bossId = result[0].bossId;
    rewardClaim.timestamp = result[0].timestamp;
    rewardClaim.amount = result[0].amount;
    return rewardClaim;
  }

  async save(rewardClaim: RewardClaim): Promise<void> {
    await this.client.insert(rewardClaims).values({
      playerId: rewardClaim.playerId,
      bossId: rewardClaim.bossId,
      timestamp: rewardClaim.timestamp,
      amount: rewardClaim.amount,
    }).onConflictDoUpdate({
      target: [rewardClaims.playerId, rewardClaims.bossId],
      set: {
        timestamp: rewardClaim.timestamp,
        amount: rewardClaim.amount,
      }
    });
  }
}
