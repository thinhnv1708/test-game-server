import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bossSchema from './schema/BossSchema';
import * as contributionSchema from './schema/ContributionSchema';
import * as consumerOffsetSchema from './schema/ConsumerOffsetSchema';
import * as rewardClaimSchema from './schema/RewardClaimSchema';
import { config } from '../../config/config';

const schema = {
  ...bossSchema,
  ...contributionSchema,
  ...consumerOffsetSchema,
  ...rewardClaimSchema,
};

export const pool = new Pool({
  connectionString: config.db.url,
});

export const db = drizzle(pool, { schema });
