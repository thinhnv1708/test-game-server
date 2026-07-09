import { Request, Response } from 'express';
import { IRewardClaimService } from '../service/interface/IRewardClaimService';

export class RewardClaimController {
  constructor(private readonly rewardClaimService: IRewardClaimService) {}

  async claim(req: Request, res: Response): Promise<void> {
    try {
      const { player_id: playerId, boss_id: bossId } = req.body;

      if (!playerId || !bossId) {
        res.status(400).json({ message: 'player_id and boss_id are required' });
        return;
      }

      if (typeof playerId !== 'string' || typeof bossId !== 'string') {
        res
          .status(400)
          .json({ message: 'player_id and boss_id must be strings' });
        return;
      }

      const result = await this.rewardClaimService.claimReward(
        playerId,
        bossId,
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error?.message || 'Internal Server Error' });
    }
  }
}
