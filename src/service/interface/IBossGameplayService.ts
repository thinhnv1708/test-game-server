import { ConsumerOffset } from '../../entity/ConsumerOffset';

export interface IBossGameplayService {
  processDamageMessage(
    consumerOffset: ConsumerOffset,
    message: {
      playerId: string;
      bossId: string;
      damageAmount: number;
    },
  ): void;
}
