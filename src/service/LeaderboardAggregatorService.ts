import { ILeaderboardCacheRepository } from '../repository/interface/ILeaderboardCacheRepository';
import { IBossCacheRepository } from '../repository/interface/IBossCacheRepository';
import { IContributionCacheRepository } from '../repository/interface/IContributionCacheRepository';
import { ILeaderboardAggregatorService } from './interface/ILeaderboardAggregatorService';
import {
  BossLeaderboard,
  LeaderboardEntry,
} from './interface/ILeaderboardService';
import { ILogger } from '../logger/ILogger';

const TOP_N = 10;

export class LeaderboardAggregatorService implements ILeaderboardAggregatorService {
  private isAggregating = false;

  constructor(
    private readonly logger: ILogger,
    private readonly bossCacheRepository: IBossCacheRepository,
    private readonly contributionCacheRepository: IContributionCacheRepository,
    private readonly leaderboardCacheRepository: ILeaderboardCacheRepository,
  ) {}

  public aggregate(): void {
    if (this.isAggregating) {
      return;
    }

    this.isAggregating = true;

    try {
      const bosses = this.bossCacheRepository.getAllBosses();

      for (const boss of bosses) {
        const contributions =
          this.contributionCacheRepository.getContributionByBossId(boss.id);

        const topContributions: LeaderboardEntry[] = contributions
          .sort((a, b) => b.damageAmount - a.damageAmount)
          .slice(0, TOP_N)
          .map((entry, index) => ({
            rank: index + 1,
            playerId: entry.playerId,
            damageAmount: entry.damageAmount,
          }));

        const leaderboard: BossLeaderboard = {
          boss,
          topContributions,
        };

        this.leaderboardCacheRepository.setLeaderboard(boss.id, leaderboard);
      }
    } catch (error) {
      this.logger.error('Leaderboard aggregate failed');
    } finally {
      this.isAggregating = false;
    }
  }
}
