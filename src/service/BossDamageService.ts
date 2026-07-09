import { ILogger } from '../logger/ILogger';
import { IMqProducer } from '../mq/interface/IMqProducer';
import { BossDamageMessage } from '../type/BossDamageMessage';
import { IBossDamageService } from './interface/IBossDamageService';

export class BossDamageService implements IBossDamageService {
  constructor(
    private readonly logger: ILogger,
    private readonly bossMqProducer: IMqProducer<BossDamageMessage>,
  ) {}

  async damage(request: {
    playerId: string;
    bossId: string;
    damageAmount: number;
  }) {
    try {
      const { playerId, bossId, damageAmount } = request;
      await this.bossMqProducer.sendMessage({ playerId, bossId, damageAmount });
    } catch (error) {
      this.logger.error('BossDamageService', error);
      throw error;
    }
  }
}
