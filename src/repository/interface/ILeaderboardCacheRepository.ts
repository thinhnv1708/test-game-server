import { BossLeaderboard } from '../../service/interface/ILeaderboardService';

export interface ILeaderboardCacheRepository {
  setLeaderboard(bossId: string, leaderboard: BossLeaderboard): void;
  getLeaderboard(bossId: string): BossLeaderboard | null;
  getAllLeaderboards(): BossLeaderboard[];
}
