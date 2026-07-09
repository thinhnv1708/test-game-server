import { Boss } from '../../entity/Boss';

export interface IBossCacheRepository {
  setBoss(boss: Boss): void;
  getBoss(bossId: string): Boss | undefined;
  getAllBosses(): Boss[];
  removeBoss(bossId: string): void;
}
