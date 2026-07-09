import { ISnapshotService } from './interface/ISnapshotService';
import { ILogger } from '../logger/ILogger';
import { IBossCacheRepository } from '../repository/interface/IBossCacheRepository';
import { IContributionCacheRepository } from '../repository/interface/IContributionCacheRepository';
import { IConsumerOffsetCacheRepository } from '../repository/interface/IConsumerOffsetCacheRepository';
import { IUnitOfWork } from '../repository/interface/IUnitOfWork';
import { Contribution } from '../entity/Contribution';

export class SnapshotService implements ISnapshotService {
  private snapshotIsRuning = false;
  constructor(
    private readonly logger: ILogger,
    private readonly bossCacheRepository: IBossCacheRepository,
    private readonly contributionCacheRepository: IContributionCacheRepository,
    private readonly consumerOffsetCacheRepository: IConsumerOffsetCacheRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly bossDamageConsumerOffsetId: string,
  ) {}

  async takeSnapshot(): Promise<void> {
    if (this.snapshotIsRuning) {
      return;
    }

    this.snapshotIsRuning = true;

    try {
      this.logger.info('Preparing data from cache for database snapshot...');

      // 1. Get data from cache before starting database transaction
      const cachedBosses = this.bossCacheRepository.getAllBosses();
      const allContributions: Contribution[] = [];

      for (const boss of cachedBosses) {
        const cachedContributions =
          this.contributionCacheRepository.getContributionByBossId(boss.id);
        for (const cc of cachedContributions) {
          const contrib = new Contribution();
          contrib.bossId = boss.id;
          contrib.playerId = cc.playerId;
          contrib.damage = cc.damageAmount;
          allContributions.push(contrib);
        }
      }

      const cachedOffset = this.consumerOffsetCacheRepository.getOffset(
        this.bossDamageConsumerOffsetId,
      );

      // 2. Run transaction to persist data to database
      await this.unitOfWork.runInTransaction(async (uow) => {
        // Save current bosses
        if (cachedBosses.length > 0) {
          await uow.bossRepository.saveMany(cachedBosses);
        }

        // Save latest contributions
        if (allContributions.length > 0) {
          await uow.contributionRepository.saveMany(allContributions);
        }

        // Save current offset
        if (cachedOffset) {
          await uow.consumerOffsetRepository.save(cachedOffset);
        }
      });

      this.logger.info(
        `Successfully saved snapshot: ${cachedBosses.length} bosses, ${allContributions.length} contributions, offset ${cachedOffset?.lastEventSequence || 'N/A'}`,
      );
    } catch (error) {
      this.logger.error(
        'SnapshotService - Failed to take database snapshot',
        error,
      );
    } finally {
      this.snapshotIsRuning = false;
    }
  }
}
