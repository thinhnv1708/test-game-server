import { pgTable, text } from 'drizzle-orm/pg-core';

export const consumerOffsets = pgTable('consumer_offset', {
  id: text('id').primaryKey(),
  lastEventSequence: text('last_event_sequence').notNull(),
});
