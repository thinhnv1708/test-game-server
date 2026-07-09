import { Request, Response } from 'express';
import { IBossDamageService } from '../service/interface/IBossDamageService';

export class BossDamageController {
  constructor(private readonly bossDamageService: IBossDamageService) {}

  async damage(req: Request, res: Response): Promise<void> {
    try {
      const {
        player_id: playerId,
        boss_id: bossId,
        damage_amount: damageAmount,
      } = req.body;

      if (!playerId || !bossId || !damageAmount) {
        res.status(400).json({ message: 'Invalid request' });
        return;
      }

      if (typeof playerId !== 'string' || typeof damageAmount !== 'number') {
        res.status(400).json({ message: 'Invalid request' });
        return;
      }

      if (damageAmount <= 0) {
        res.status(400).json({ message: 'Invalid request' });
        return;
      }

      await this.bossDamageService.damage({
        playerId,
        bossId,
        damageAmount: Number(damageAmount),
      });

      res.status(200).json({ message: 'success' });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error?.message || 'Internal Server Error' });
    }
  }
}
