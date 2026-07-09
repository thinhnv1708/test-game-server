import { Boss } from '../../entity/Boss';
import { IBossCacheRepository } from '../interface/IBossCacheRepository';

export class MemoryBossCacheRepository implements IBossCacheRepository {
  private store: Map<string, Boss> = new Map();

  public setBoss(boss: Boss): void {
    this.store.set(boss.id, { ...boss });
  }

  public getBoss(bossId: string): Boss | undefined {
    const boss = this.store.get(bossId);
    return boss ? { ...boss } : undefined;
  }

  public getAllBosses(): Boss[] {
    return Array.from(this.store.values()).map(boss => ({ ...boss }));
  }

  public removeBoss(bossId: string): void {
    this.store.delete(bossId);
  }
}
