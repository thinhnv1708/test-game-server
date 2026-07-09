import 'dotenv/config';
import EventEmitter from 'events';
import express from 'express';

// Config & Logger
import { config } from './config/config';
import { ConsoleLogger } from './logger/ConsoleLogger';

// Database & Repositories
import { db, pool } from './db/postgres/connectDb';
import { MemoryBossCacheRepository } from './repository/memory/MemoryBossCacheRepository';
import { MemoryConsumerOffsetCacheRepository } from './repository/memory/MemoryConsumerOffsetCacheRepository';
import { MemoryContributionCacheRepository } from './repository/memory/MemoryContributionCacheRepository';
import { MemoryLeaderboardCacheRepository } from './repository/memory/MemoryLeaderboardCacheRepository';
import { PostgresBossRepository } from './repository/postgres/PostgresBossRepository';
import { PostgresConsumerOffsetRepository } from './repository/postgres/PostgresConsumerOffsetRepository';
import { PostgresContributionRepository } from './repository/postgres/PostgresContributionRepository';

// Services & Controllers
import { BossDamageController } from './controller/BossDamageController';
import { LeaderboardController } from './controller/LeaderboardController';
import { LeaderboardService } from './service/LeaderboardService';
import { BossDamageService } from './service/BossDamageService';
import { BossGameplayService } from './service/BossGameplayService';
import { WarmupService } from './service/WarmupService';
import { SnapshotService } from './service/SnapshotService';
import { PostgresUnitOfWork } from './repository/postgres/PostgresUnitOfWork';
import { SnapshotScheduler } from './scheduler/SnapshotScheduler';
import { LeaderboardScheduler } from './scheduler/LeaderboardScheduler';
import { MainScheduler } from './scheduler/MainScheduler';
import { LeaderboardAggregatorService } from './service/LeaderboardAggregatorService';

// Kafka Message Queue
import { Server, createServer } from 'http';
import { BossDamageKafkaConsumer } from './mq/kafka/consumer/BossDamageKafkaConsumer';
import { initKafka } from './mq/kafka/initKafka';
import { BossDamageKafkaProducer } from './mq/kafka/producer/BossDamageKafkaProducer';
import { Consumer, Producer } from 'kafkajs';
import { Pool } from 'pg';
import { ILogger } from './logger/ILogger';

const main = async () => {
  const eventEmiter = new EventEmitter();

  // setup logger
  const logger = new ConsoleLogger(config.logLevel);

  const client = await pool.connect();
  client.release();
  logger.info('Database connected');

  // setup kafka
  const kafka = initKafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers,
  });

  const producer = kafka.producer();
  await producer.connect();
  logger.info('Kafka producer connected');
  const kafkaTopic = config.kafka.topic;
  const bossDamageKafkaProducer = new BossDamageKafkaProducer(
    logger,
    producer,
    kafkaTopic,
  );

  // setup repository
  const bossCacheRepository = new MemoryBossCacheRepository();
  const contributionCacheRepository = new MemoryContributionCacheRepository();
  const consumerOffsetCacheRepository =
    new MemoryConsumerOffsetCacheRepository();
  const leaderboardCacheRepository = new MemoryLeaderboardCacheRepository();

  // setup db repositories (no transaction needed for warmup)
  const bossRepository = new PostgresBossRepository(db);
  const consumerOffsetRepository = new PostgresConsumerOffsetRepository(db);
  const contributionRepository = new PostgresContributionRepository(db);
  const unitOfWork = new PostgresUnitOfWork(db);

  // setup warmup service
  const warmupService = new WarmupService(
    logger,
    bossRepository,
    consumerOffsetRepository,
    contributionRepository,
    bossCacheRepository,
    consumerOffsetCacheRepository,
    contributionCacheRepository,
  );

  // run warmup to get offset
  const loadedOffset = await warmupService.warmup(
    config.bossDamageConsumerOffsetId,
  );
  const offset = loadedOffset || {
    id: config.bossDamageConsumerOffsetId,
    lastEventSequence: '0',
  };

  // setup service
  const bossDamageService = new BossDamageService(
    logger,
    bossDamageKafkaProducer,
  );
  const bossGameplayService = new BossGameplayService(
    logger,
    bossCacheRepository,
    contributionCacheRepository,
    consumerOffsetCacheRepository,
  );
  const snapshotService = new SnapshotService(
    logger,
    bossCacheRepository,
    contributionCacheRepository,
    consumerOffsetCacheRepository,
    unitOfWork,
    config.bossDamageConsumerOffsetId,
  );

  // setup leaderboard aggregator
  const leaderboardAggregatorService = new LeaderboardAggregatorService(
    logger,
    bossCacheRepository,
    contributionCacheRepository,
    leaderboardCacheRepository,
  );

  // setup scheduler
  const mainScheduler = new MainScheduler(logger);
  const snapshotJob = new SnapshotScheduler(
    logger,
    snapshotService,
    config.bossDamageConsumerOffsetId,
  );
  const leaderboardJob = new LeaderboardScheduler(
    logger,
    leaderboardAggregatorService,
  );
  mainScheduler.registerJob(snapshotJob);
  mainScheduler.registerJob(leaderboardJob);
  mainScheduler.start();

  // setup mq consumer
  const consumer = kafka.consumer({ groupId: config.kafka.groupId });
  const bossDamageKafkaConsumer = new BossDamageKafkaConsumer(
    logger,
    consumer,
    kafkaTopic,
    offset,
    config.bossDamageConsumerOffsetId,
    bossGameplayService,
    eventEmiter,
  );
  await bossDamageKafkaConsumer.connectConsumer();
  bossDamageKafkaConsumer.consume().catch(console.error);

  logger.info('Kafka consumer started');
  // setup http controller
  const bossDamageController = new BossDamageController(bossDamageService);
  const leaderboardService = new LeaderboardService(leaderboardCacheRepository);
  const leaderboardController = new LeaderboardController(leaderboardService);

  const { RewardClaimService } = require('./service/RewardClaimService');
  const { RewardClaimController } = require('./controller/RewardClaimController');
  const rewardClaimService = new RewardClaimService(logger, unitOfWork);
  const rewardClaimController = new RewardClaimController(rewardClaimService);

  const expressApp = express();
  const httpServer = createServer(expressApp);

  const port = config.port;

  expressApp.use(express.json());

  expressApp.post('/damage', (req, res) =>
    bossDamageController.damage(req, res),
  );

  expressApp.post('/rewards/claim', (req, res) =>
    rewardClaimController.claim(req, res),
  );

  expressApp.get('/boss/:bossId', (req, res) =>
    leaderboardController.getLeaderboard(req, res),
  );


  // cleanup on sigint
  process.on('SIGINT', async () => {
    await cleanup(logger, httpServer, producer, consumer, mainScheduler, pool);
  });

  // cleanup on sigterm
  process.on('SIGTERM', async () => {
    await cleanup(logger, httpServer, producer, consumer, mainScheduler, pool);
  });

  httpServer.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
};

const cleanup = async (
  logger: ILogger,
  httpServer: Server,
  producer: Producer,
  consumer: Consumer,
  mainScheduler: MainScheduler,
  dbPool: Pool,
) => {
  logger.info('SIGTERM received, closing server');

  // force shutdown
  const timeoutId = setTimeout(() => {
    process.exit(0);
  }, 10000);

  try {
    if (mainScheduler) {
      mainScheduler.stop();
    }

    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      logger.info('HTTP server closed');
    }

    await producer.disconnect();
    logger.info('Kafka producer disconnected');
    await consumer.stop();
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
    await dbPool.end();
    logger.info('Database disconnected');
  } catch (error) {
    console.error(error);
  } finally {
    clearTimeout(timeoutId);
    process.exit(0);
  }
};

main();
