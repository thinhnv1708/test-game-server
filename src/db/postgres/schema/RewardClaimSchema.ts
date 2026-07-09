import { pgTable, text, primaryKey, bigint, index } from 'drizzle-orm/pg-core';
import { bosses } from './BossSchema';

export const rewardClaims = pgTable('reward_claims', {
  playerId: text('player_id').notNull(),
  bossId: text('boss_id')
    .notNull()
    .references(() => bosses.id),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
}, (table) => [
  primaryKey({ name: 'reward_claims_pk', columns: [table.playerId, table.bossId] }),
  index('reward_claims_player_id_idx').on(table.playerId),
  index('reward_claims_boss_id_idx').on(table.bossId),
]);
