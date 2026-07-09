import { Contribution } from '../../entity/Contribution';

export interface IContributionCacheRepository {
  setPlayerContribution(contribution: Contribution): void;
  getContributionByBossId(
    bossId: string,
  ): { playerId: string; damageAmount: number }[];
  getContribution(bossId: string, playerId: string): Contribution;
  removeContributionByBossId(bossId: string): void;
}
