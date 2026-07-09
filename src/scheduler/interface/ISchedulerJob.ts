export interface ISchedulerJob {
  getName(): string;
  start(): void;
  stop(): void;
}
