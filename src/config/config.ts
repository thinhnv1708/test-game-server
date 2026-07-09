import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/game_db',
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'boss-damage-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    groupId: process.env.KAFKA_GROUP_ID || 'boss-damage-service',
    topic: process.env.KAFKA_TOPIC || 'boss-damage',
  },
  bossDamageConsumerOffsetId:
    process.env.BOSS_DAMAGE_CONSUMER_OFFSET_ID || 'boss-damage-0',
};
