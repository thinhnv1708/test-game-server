import { ISchedulerJob } from './interface/ISchedulerJob';
import { ILogger } from '../logger/ILogger';

export class MainScheduler {
  private jobs: ISchedulerJob[] = [];
  private isRunning: boolean = false;

  constructor(private readonly logger: ILogger) {}

  // Registers a child scheduler into MainScheduler
  public registerJob(job: ISchedulerJob): void {
    this.jobs.push(job);
    this.logger.info(`Job registered to MainScheduler: ${job.getName()}`);
    
    if (this.isRunning) {
      job.start();
    }
  }

  // Starts all registered child schedulers
  public start(): void {
    if (this.isRunning) {
      this.logger.warn('MainScheduler is already running.');
      return;
    }
    
    this.logger.info('Starting MainScheduler...');
    this.isRunning = true;
    for (const job of this.jobs) {
      job.start();
    }
  }

  // Stops all child schedulers
  public stop(): void {
    if (!this.isRunning) {
      this.logger.warn('MainScheduler is not running.');
      return;
    }

    this.logger.info('Stopping MainScheduler...');
    this.isRunning = false;
    for (const job of this.jobs) {
      job.stop();
    }
  }
}
