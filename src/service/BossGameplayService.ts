import { ConsumerOffset } from '../entity/ConsumerOffset';
import { Contribution } from '../entity/Contribution';
import { ILogger } from '../logger/ILogger';
import { IBossCacheRepository } from '../repository/interface/IBossCacheRepository';
import { IConsumerOffsetCacheRepository } from '../repository/interface/IConsumerOffsetCacheRepository';
import { IContributionCacheRepository } from '../repository/interface/IContributionCacheRepository';

import { IBossGameplayService } from './interface/IBossGameplayService';

export class BossGameplayService implements IBossGameplayService {
  constructor(
    private readonly logger: ILogger,
    private readonly bossCacheRepository: IBossCacheRepository,
    private readonly contributionCacheRepository: IContributionCacheRepository,
    private readonly consumerOffsetCacheRepository: IConsumerOffsetCacheRepository,
  ) {}

  processDamageMessage(
    consumerOffset: ConsumerOffset,
    message: {
      playerId: string;
      bossId: string;
      damageAmount: number;
    },
  ) {
    const { playerId, bossId, damageAmount } = message;
    const boss = this.bossCacheRepository.getBoss(bossId);

    if (!boss) {
      return;
    }

    if (boss.currentHp == 0) {
      return;
    }

    let actualDamageAmount = damageAmount;

    if (damageAmount > boss.currentHp) {
      actualDamageAmount = boss.currentHp;
    }

    boss.currentHp -= actualDamageAmount;

    this.bossCacheRepository.setBoss(boss);

    const contribution = this.contributionCacheRepository.getContribution(
      bossId,
      playerId,
    );

    contribution.damage += actualDamageAmount;

    this.contributionCacheRepository.setPlayerContribution(contribution);
    console.log('consumerOffset', consumerOffset);

    this.consumerOffsetCacheRepository.setOffset(consumerOffset);
  }
}
