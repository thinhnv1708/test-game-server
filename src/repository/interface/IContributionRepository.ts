import { Contribution } from '../../entity/Contribution';

export interface IContributionRepository {
  save(contribution: Contribution): Promise<void>;
  findByBossId(bossId: string): Promise<Contribution[]>;
  saveMany(contributions: Contribution[]): Promise<void>;
}
