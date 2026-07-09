import { ConsumerOffset } from '../../entity/ConsumerOffset';
import { IConsumerOffsetCacheRepository } from '../interface/IConsumerOffsetCacheRepository';

export class MemoryConsumerOffsetCacheRepository implements IConsumerOffsetCacheRepository {
  private store: Map<string, ConsumerOffset> = new Map();

  public setOffset(consumerOffset: ConsumerOffset): void {
    this.store.set(consumerOffset.id, { ...consumerOffset });
  }

  public getOffset(id: string): ConsumerOffset | undefined {
    const offset = this.store.get(id);
    if (!offset) {
      return undefined;
    }

    return {
      ...offset,
    };
  }

  public removeOffset(id: string): void {
    this.store.delete(id);
  }
}
