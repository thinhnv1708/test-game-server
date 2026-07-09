import { Boss } from '../../entity/Boss';

export interface IBossRepository {
  findById(id: string): Promise<Boss | undefined>;
  save(boss: Boss): Promise<void>;
  update(boss: Boss): Promise<void>;
  saveMany(bosses: Boss[]): Promise<void>;
  findActiveBosses(): Promise<Boss[]>;
}
