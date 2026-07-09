import { ConsumerOffset } from '../../entity/ConsumerOffset';

export interface IConsumerOffsetCacheRepository {
  setOffset(consumerOffset: ConsumerOffset): void;
  getOffset(id: string): ConsumerOffset | undefined;
  removeOffset(id: string): void;
}
