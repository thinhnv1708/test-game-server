import { ConsumerOffset } from '../../entity/ConsumerOffset';

export interface IWarmupService {
  warmup(
    bossDamageConsumerOffsetId: string,
  ): Promise<ConsumerOffset | undefined>;
}
