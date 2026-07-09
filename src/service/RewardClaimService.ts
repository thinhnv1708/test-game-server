import { ILogger } from '../logger/ILogger';
import { IUnitOfWork } from '../repository/interface/IUnitOfWork';
import { IRewardClaimService } from './interface/IRewardClaimService';
import { RewardClaim } from '../entity/RewardClaim';

export class RewardClaimService implements IRewardClaimService {
  constructor(
    private readonly logger: ILogger,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async claimReward(
    playerId: string,
    bossId: string,
  ): Promise<{ success: boolean; amount?: number; message?: string }> {
    return await this.unitOfWork.runInTransaction(async (uow) => {
      const boss = await uow.bossRepository.findById(bossId);
      if (!boss) {
        return { success: false, message: 'Boss not found' };
      }

      if (boss.currentHp > 0) {
        return { success: false, message: 'Boss is not defeated yet' };
      }

      const existingClaim = await uow.rewardClaimRepository.findById(
        playerId,
        bossId,
      );
      if (existingClaim) {
        return { success: false, amount: existingClaim.amount };
      }

      const allContributions =
        await uow.contributionRepository.findByBossId(bossId);
      const playerContribution = allContributions.find(
        (c) => c.playerId === playerId,
      );

      if (!playerContribution || playerContribution.damage <= 0) {
        return {
          success: false,
          message: 'No contribution damage found for this player',
        };
      }

      const totalDamage = allContributions.reduce(
        (sum, c) => sum + c.damage,
        0,
      );
      if (totalDamage <= 0) {
        return { success: false, message: 'Invalid total damage' };
      }

      const percent = (playerContribution.damage / totalDamage) * 100;

      const amount = Math.floor(percent * 1000);

      const claim = new RewardClaim();
      claim.playerId = playerId;
      claim.bossId = bossId;
      claim.timestamp = Date.now();
      claim.amount = amount;

      await uow.rewardClaimRepository.save(claim);

      this.logger.info(
        `Player ${playerId} claimed ${amount} reward from boss ${bossId} (${percent.toFixed(2)}% damage)`,
      );

      return { success: true, amount };
    });
  }
}
