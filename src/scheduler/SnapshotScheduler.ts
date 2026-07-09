import cron, { ScheduledTask } from 'node-cron';
import { ILogger } from '../logger/ILogger';
import { ISnapshotService } from '../service/interface/ISnapshotService';
import { ISchedulerJob } from './interface/ISchedulerJob';

export class SnapshotScheduler implements ISchedulerJob {
  private task: ScheduledTask | null = null;

  constructor(
    private readonly logger: ILogger,
    private readonly snapshotService: ISnapshotService,
    private readonly consumerOffsetId: string,
  ) {}

  public getName(): string {
    return 'SnapshotScheduler';
  }

  // Starts the cron job (defaults to every 5 seconds).
  public start(cronExpression: string = '*/5 * * * * *'): void {
    if (this.task) {
      this.logger.warn('SnapshotScheduler is already running.');
      return;
    }

    this.logger.info(
      `Starting SnapshotScheduler with cron expression: "${cronExpression}"`,
    );

    this.task = cron.schedule(cronExpression, async () => {
      this.logger.info(
        'SnapshotScheduler triggered. Taking database snapshot...',
      );
      await this.snapshotService.takeSnapshot(this.consumerOffsetId);
    });
  }

  // Stops the cron job.
  public stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.logger.info('SnapshotScheduler stopped.');
    }
  }
}
