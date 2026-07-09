import { pgTable, text, bigint, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bosses = pgTable('bosses', {
  id: text('id').primaryKey(),
  hp: bigint('hp', { mode: 'number' }).notNull(),
  currentHp: bigint('current_hp', { mode: 'number' }).notNull(),
}, (table) => [
  index('bosses_current_hp_idx').on(table.currentHp).where(sql`current_hp > 0`),
]);

