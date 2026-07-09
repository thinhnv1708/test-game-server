import { Contribution } from '../../entity/Contribution';
import { IContributionCacheRepository } from '../interface/IContributionCacheRepository';

export class MemoryContributionCacheRepository implements IContributionCacheRepository {
  // Map<bossId, Map<playerId, damageAmount>>
  private store: Map<string, Map<string, number>> = new Map();

  public setPlayerContribution(contrubution: Contribution): void {
    if (!this.store.has(contrubution.bossId)) {
      this.store.set(contrubution.bossId, new Map());
    }

    this.store
      .get(contrubution.bossId)!
      .set(contrubution.playerId, contrubution.damage);
  }

  public getContributionByBossId(
    bossId: string,
  ): { playerId: string; damageAmount: number }[] {
    const bossMap = this.store.get(bossId);
    if (!bossMap) {
      return [];
    }
    const result: { playerId: string; damageAmount: number }[] = [];
    for (const [playerId, damageAmount] of bossMap.entries()) {
      result.push({ playerId, damageAmount });
    }
    return result;
  }

  public getContribution(bossId: string, playerId: string): Contribution {
    const contribution = new Contribution();
    contribution.playerId = playerId;
    contribution.bossId = bossId;

    const damage = this.store.get(bossId)?.get(playerId) || 0;
    contribution.damage = damage;

    return contribution;
  }

  public removeContributionByBossId(bossId: string): void {
    this.store.delete(bossId);
  }
}
