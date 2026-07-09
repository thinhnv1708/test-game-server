import { BossLeaderboard } from '../../service/interface/ILeaderboardService';
import { ILeaderboardCacheRepository } from '../interface/ILeaderboardCacheRepository';

export class MemoryLeaderboardCacheRepository
  implements ILeaderboardCacheRepository
{
  // Map<bossId, BossLeaderboard>
  private store: Map<string, BossLeaderboard> = new Map();

  public setLeaderboard(bossId: string, leaderboard: BossLeaderboard): void {
    this.store.set(bossId, leaderboard);
  }

  public getLeaderboard(bossId: string): BossLeaderboard | null {
    return this.store.get(bossId) ?? null;
  }

  public getAllLeaderboards(): BossLeaderboard[] {
    return Array.from(this.store.values());
  }
}
