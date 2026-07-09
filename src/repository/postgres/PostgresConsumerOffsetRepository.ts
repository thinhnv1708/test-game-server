import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/postgres/connectDb';
import { consumerOffsets } from '../../db/postgres/schema/ConsumerOffsetSchema';
import { ConsumerOffset } from '../../entity/ConsumerOffset';
import { IConsumerOffsetRepository } from '../interface/IConsumerOffsetRepository';

export class PostgresConsumerOffsetRepository implements IConsumerOffsetRepository {
  constructor(private client: typeof db) {}

  async findById(id: string): Promise<ConsumerOffset | undefined> {
    const result = await this.client.select().from(consumerOffsets).where(eq(consumerOffsets.id, id)).limit(1);
    if (result.length === 0) return undefined;

    const offset = new ConsumerOffset();
    offset.id = result[0].id;
    offset.lastEventSequence = result[0].lastEventSequence;
    return offset;
  }

  async save(consumerOffset: ConsumerOffset): Promise<void> {
    await this.client.insert(consumerOffsets).values({
      id: consumerOffset.id,
      lastEventSequence: consumerOffset.lastEventSequence,
    }).onConflictDoUpdate({
      target: consumerOffsets.id,
      set: {
        lastEventSequence: consumerOffset.lastEventSequence,
      }
    });
  }

  async saveMany(items: ConsumerOffset[]): Promise<void> {
    if (items.length === 0) return;
    await this.client.insert(consumerOffsets).values(
      items.map(item => ({
        id: item.id,
        lastEventSequence: item.lastEventSequence,
      }))
    ).onConflictDoUpdate({
      target: consumerOffsets.id,
      set: {
        lastEventSequence: sql`excluded.last_event_sequence`,
      }
    });
  }
}
