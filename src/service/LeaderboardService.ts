import { ILeaderboardCacheRepository } from '../repository/interface/ILeaderboardCacheRepository';
import {
  BossLeaderboard,
  ILeaderboardService,
} from './interface/ILeaderboardService';

export class LeaderboardService implements ILeaderboardService {
  constructor(
    private readonly leaderboardCacheRepository: ILeaderboardCacheRepository,
  ) {}

  getLeaderboard(bossId: string): BossLeaderboard | null {
    return this.leaderboardCacheRepository.getLeaderboard(bossId);
  }
}
