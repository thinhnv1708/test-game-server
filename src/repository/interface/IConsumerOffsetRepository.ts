import { ConsumerOffset } from '../../entity/ConsumerOffset';

export interface IConsumerOffsetRepository {
  findById(id: string): Promise<ConsumerOffset | undefined>;
  save(consumerOffset: ConsumerOffset): Promise<void>;
  saveMany(consumerOffsets: ConsumerOffset[]): Promise<void>;
}
