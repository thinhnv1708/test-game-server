import { RewardClaim } from '../../entity/RewardClaim';

export interface IRewardClaimRepository {
  findById(playerId: string, bossId: string): Promise<RewardClaim | undefined>;
  save(rewardClaim: RewardClaim): Promise<void>;
}
