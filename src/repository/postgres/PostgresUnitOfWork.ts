import { db } from '../../db/postgres/connectDb';
import { IUnitOfWork } from '../interface/IUnitOfWork';
import { IBossRepository } from '../interface/IBossRepository';
import { IContributionRepository } from '../interface/IContributionRepository';
import { IConsumerOffsetRepository } from '../interface/IConsumerOffsetRepository';
import { PostgresBossRepository } from './PostgresBossRepository';
import { PostgresContributionRepository } from './PostgresContributionRepository';
import { PostgresConsumerOffsetRepository } from './PostgresConsumerOffsetRepository';

export class PostgresUnitOfWork implements IUnitOfWork {
  public bossRepository: IBossRepository;
  public contributionRepository: IContributionRepository;
  public consumerOffsetRepository: IConsumerOffsetRepository;

  constructor(private client: typeof db = db) {
    this.bossRepository = new PostgresBossRepository(this.client);
    this.contributionRepository = new PostgresContributionRepository(
      this.client,
    );
    this.consumerOffsetRepository = new PostgresConsumerOffsetRepository(
      this.client,
    );
  }

  async complete(): Promise<void> {
    // Drizzle transactions commit automatically when the callback resolves.
  }

  async runInTransaction<T>(
    work: (uow: IUnitOfWork) => Promise<T>,
  ): Promise<T> {
    return await this.client.transaction(async (tx) => {
      const txUow = new PostgresUnitOfWork(tx as unknown as typeof db);
      const result = await work(txUow);
      await txUow.complete();
      return result;
    });
  }
}
