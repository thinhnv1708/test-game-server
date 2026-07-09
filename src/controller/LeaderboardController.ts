import { Request, Response } from 'express';
import { ILeaderboardService } from '../service/interface/ILeaderboardService';

export class LeaderboardController {
  constructor(private readonly leaderboardService: ILeaderboardService) {}

  getLeaderboard(req: Request, res: Response): void {
    try {
      const { bossId } = req.params;

      if (!bossId) {
        res.status(400).json({ message: 'bossId is required' });
        return;
      }

      const leaderboard = this.leaderboardService.getLeaderboard(
        bossId as string,
      );

      if (!leaderboard) {
        res.status(404).json({ message: `Boss "${bossId}" not found` });
        return;
      }

      res.status(200).json(leaderboard);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error?.message || 'Internal Server Error' });
    }
  }
}
