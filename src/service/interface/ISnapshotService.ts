export interface ISnapshotService {
  takeSnapshot(consumerOffsetId: string): Promise<void>;
}
