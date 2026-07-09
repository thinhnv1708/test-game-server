import { IBossRepository } from './IBossRepository';
import { IContributionRepository } from './IContributionRepository';
import { IConsumerOffsetRepository } from './IConsumerOffsetRepository';

export interface IUnitOfWork {
  bossRepository: IBossRepository;
  contributionRepository: IContributionRepository;
  consumerOffsetRepository: IConsumerOffsetRepository;
  complete(): Promise<void>;
  runInTransaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}
