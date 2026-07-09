import { IBossRepository } from './IBossRepository';
import { IContributionRepository } from './IContributionRepository';
import { IConsumerOffsetRepository } from './IConsumerOffsetRepository';
import { IRewardClaimRepository } from './IRewardClaimRepository';

export interface IUnitOfWork {
  bossRepository: IBossRepository;
  contributionRepository: IContributionRepository;
  consumerOffsetRepository: IConsumerOffsetRepository;
  rewardClaimRepository: IRewardClaimRepository;
  complete(): Promise<void>;
  runInTransaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}

