import { Producer } from 'kafkajs';
import { BossDamageMessage } from '../../../type/BossDamageMessage';
import { IMqProducer } from '../../interface/IMqProducer';
import { ILogger } from '../../../logger/ILogger';

export class BossDamageKafkaProducer implements IMqProducer<BossDamageMessage> {
  constructor(
    private readonly logger: ILogger,
    private readonly producer: Producer,
    private readonly topic: string,
  ) {}

  async sendMessage(message: BossDamageMessage): Promise<void> {
    try {
      await this.producer.send({
        topic: this.topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.debug('Sended message: ' + JSON.stringify(message));
    } catch (error) {
      this.logger.error('Send message failed:', error);
      throw error;
    }
  }
}
