import cron, { ScheduledTask } from 'node-cron';
import { ILogger } from '../logger/ILogger';
import { ILeaderboardAggregatorService } from '../service/interface/ILeaderboardAggregatorService';
import { ISchedulerJob } from './interface/ISchedulerJob';

export class LeaderboardScheduler implements ISchedulerJob {
  private task: ScheduledTask | null = null;

  constructor(
    private readonly logger: ILogger,
    private readonly leaderboardAggregatorService: ILeaderboardAggregatorService,
  ) {}

  public getName(): string {
    return 'LeaderboardScheduler';
  }

  // Runs every 3 seconds by default
  public start(cronExpression: string = '*/3 * * * * *'): void {
    if (this.task) {
      this.logger.warn('LeaderboardScheduler is already running.');
      return;
    }

    this.logger.info(
      `Starting LeaderboardScheduler with cron expression: "${cronExpression}"`,
    );

    this.task = cron.schedule(cronExpression, () => {
      this.logger.info(
        'LeaderboardScheduler triggered. Aggregating leaderboard...',
      );
      this.leaderboardAggregatorService.aggregate();
    });
  }

  public stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.logger.info('LeaderboardScheduler stopped.');
    }
  }
}
