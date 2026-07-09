import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/postgres/connectDb';
import { contributions } from '../../db/postgres/schema/ContributionSchema';
import { Contribution } from '../../entity/Contribution';
import { IContributionRepository } from '../interface/IContributionRepository';

export class PostgresContributionRepository implements IContributionRepository {
  constructor(private client: typeof db) {}

  async save(contribution: Contribution): Promise<void> {
    await this.client.insert(contributions).values({
      playerId: contribution.playerId,
      bossId: contribution.bossId,
      damage: contribution.damage,
    }).onConflictDoUpdate({
      target: [contributions.playerId, contributions.bossId],
      set: {
        damage: contribution.damage,
      }
    });
  }

  async findByBossId(bossId: string): Promise<Contribution[]> {
    const allContributions: Contribution[] = [];
    const batchSize = 2000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await this.client
        .select()
        .from(contributions)
        .where(eq(contributions.bossId, bossId))
        .limit(batchSize)
        .offset(offset);

      if (result.length === 0) {
        break;
      }

      for (const row of result) {
        const contribution = new Contribution();
        contribution.playerId = row.playerId;
        contribution.bossId = row.bossId;
        contribution.damage = row.damage;
        allContributions.push(contribution);
      }

      if (result.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    return allContributions;
  }

  async saveMany(items: Contribution[]): Promise<void> {
    if (items.length === 0) return;
    await this.client.insert(contributions).values(
      items.map(item => ({
        playerId: item.playerId,
        bossId: item.bossId,
        damage: item.damage,
      }))
    ).onConflictDoUpdate({
      target: [contributions.playerId, contributions.bossId],
      set: {
        damage: sql`excluded.damage`,
      }
    });
  }
}
