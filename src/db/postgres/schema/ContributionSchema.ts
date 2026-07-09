import { pgTable, text, primaryKey, index, bigint } from 'drizzle-orm/pg-core';
import { bosses } from './BossSchema';

export const contributions = pgTable('contributions', {
  playerId: text('player_id').notNull(),
  bossId: text('boss_id')
    .notNull()
    .references(() => bosses.id),
  damage: bigint('damage', { mode: 'number' }).notNull(),
}, (table) => [
  primaryKey({ name: 'contributions_pk', columns: [table.playerId, table.bossId] }),
  index('boss_id_damage_idx').on(table.bossId, table.damage.desc()),
]);
