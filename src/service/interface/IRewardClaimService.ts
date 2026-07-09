export interface IRewardClaimService {
  claimReward(playerId: string, bossId: string): Promise<{ success: boolean; amount?: number; message?: string }>;
}
