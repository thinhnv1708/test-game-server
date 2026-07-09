import { eq, sql, gt } from 'drizzle-orm';
import { db } from '../../db/postgres/connectDb';
import { bosses } from '../../db/postgres/schema/BossSchema';
import { Boss } from '../../entity/Boss';
import { IBossRepository } from '../interface/IBossRepository';

export class PostgresBossRepository implements IBossRepository {
  constructor(private client: typeof db) {}

  async findById(id: string): Promise<Boss | undefined> {
    const result = await this.client.select().from(bosses).where(eq(bosses.id, id)).limit(1);
    if (result.length === 0) return undefined;

    const boss = new Boss();
    boss.id = result[0].id;
    boss.hp = result[0].hp;
    boss.currentHp = result[0].currentHp;
    return boss;
  }

  async save(boss: Boss): Promise<void> {
    await this.client.insert(bosses).values({
      id: boss.id,
      hp: boss.hp,
      currentHp: boss.currentHp,
    }).onConflictDoUpdate({
      target: bosses.id,
      set: {
        hp: boss.hp,
        currentHp: boss.currentHp,
      }
    });
  }

  async update(boss: Boss): Promise<void> {
    // If not exists, save (create new)
    await this.save(boss);
  }

  async saveMany(items: Boss[]): Promise<void> {
    if (items.length === 0) return;
    await this.client.insert(bosses).values(
      items.map(item => ({
        id: item.id,
        hp: item.hp,
        currentHp: item.currentHp,
      }))
    ).onConflictDoUpdate({
      target: bosses.id,
      set: {
        hp: sql`excluded.hp`,
        currentHp: sql`excluded.current_hp`,
      }
    });
  }

  async findActiveBosses(): Promise<Boss[]> {
    const result = await this.client.select().from(bosses).where(gt(bosses.currentHp, 0));
    return result.map((row: any) => {
      const boss = new Boss();
      boss.id = row.id;
      boss.hp = row.hp;
      boss.currentHp = row.currentHp;
      return boss;
    });
  }
}
