import { ConsumerOffset } from '../entity/ConsumerOffset';
import { ILogger } from '../logger/ILogger';
import { IBossRepository } from '../repository/interface/IBossRepository';
import { IConsumerOffsetRepository } from '../repository/interface/IConsumerOffsetRepository';
import { IContributionRepository } from '../repository/interface/IContributionRepository';
import { IBossCacheRepository } from '../repository/interface/IBossCacheRepository';
import { IConsumerOffsetCacheRepository } from '../repository/interface/IConsumerOffsetCacheRepository';
import { IContributionCacheRepository } from '../repository/interface/IContributionCacheRepository';
import { IWarmupService } from './interface/IWarmupService';

export class WarmupService implements IWarmupService {
  constructor(
    private readonly logger: ILogger,
    private readonly bossRepository: IBossRepository,
    private readonly consumerOffsetRepository: IConsumerOffsetRepository,
    private readonly contributionRepository: IContributionRepository,
    private readonly bossCacheRepository: IBossCacheRepository,
    private readonly consumerOffsetCacheRepository: IConsumerOffsetCacheRepository,
    private readonly contributionCacheRepository: IContributionCacheRepository,
  ) {}

  async warmup(
    bossDamageConsumerOffsetId: string,
  ): Promise<ConsumerOffset | undefined> {
    this.logger.info('Starting database warmup to memory cache...');

    // 1. Load bosses with hp > 0 from db and set to cache
    const activeBosses = await this.bossRepository.findActiveBosses();
    this.logger.info(
      `Loaded ${activeBosses.length} active bosses from database`,
    );
    for (const boss of activeBosses) {
      this.bossCacheRepository.setBoss(boss);

      // Load contributions for each active boss and set to cache
      const dbContributions = await this.contributionRepository.findByBossId(boss.id);
      this.logger.info(
        `Loaded ${dbContributions.length} contributions for active boss '${boss.id}'`,
      );
      for (const contribution of dbContributions) {
        this.contributionCacheRepository.setPlayerContribution(contribution);
      }
    }

    // 2. Load consumerOffset and set to cache
    const dbOffset = await this.consumerOffsetRepository.findById(
      bossDamageConsumerOffsetId,
    );
    if (dbOffset) {
      this.logger.info(
        `Loaded consumer offset for id '${bossDamageConsumerOffsetId}': ${dbOffset.lastEventSequence}`,
      );
      this.consumerOffsetCacheRepository.setOffset(dbOffset);
      return dbOffset;
    } else {
      this.logger.info(
        `No consumer offset found for id '${bossDamageConsumerOffsetId}' in database`,
      );
      return undefined;
    }
  }
}
