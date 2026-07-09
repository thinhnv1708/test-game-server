import { Boss } from '../../entity/Boss';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  damageAmount: number;
}

export interface BossLeaderboard {
  boss: Boss;
  topContributions: LeaderboardEntry[];
}

export interface ILeaderboardService {
  getLeaderboard(bossId: string): BossLeaderboard | null;
}
