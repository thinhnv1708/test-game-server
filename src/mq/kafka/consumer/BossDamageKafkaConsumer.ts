import { Consumer } from 'kafkajs';
import { ILogger } from '../../../logger/ILogger';
import { ConsumerOffset } from '../../../entity/ConsumerOffset';
import { IBossGameplayService } from '../../../service/interface/IBossGameplayService';
import EventEmitter from 'events';

export class BossDamageKafkaConsumer {
  constructor(
    private readonly logger: ILogger,
    private readonly consumer: Consumer,
    private readonly topic: string,
    private readonly consumerOffset: ConsumerOffset,
    private readonly bossDamageConsumerOffsetId: string,
    private readonly bossGameplayService: IBossGameplayService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async connectConsumer() {
    await this.consumer.connect();
    this.logger.info('Kafka consumer connected');
    await this.consumer.subscribe({
      topic: this.topic,
      fromBeginning: false,
    });
    let offset = this.consumerOffset?.lastEventSequence;

    if (offset !== undefined) {
      offset = (Number(offset) + 1).toString();
    } else {
      offset = '0';
    }

    this.consumer.on(this.consumer.events.GROUP_JOIN, () => {
      this.consumer.seek({
        topic: this.topic,
        partition: 0,
        offset,
      });
      this.eventEmitter.emit('kafka_consumer_ready');
    });
  }

  async consume() {
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        this.logger.debug(message.offset, message.value.toString());
        const { playerId, bossId, damageAmount } = JSON.parse(
          message.value.toString(),
        );
        this.bossGameplayService.processDamageMessage(
          {
            id: this.bossDamageConsumerOffsetId,
            lastEventSequence: message.offset,
          },
          {
            playerId,
            bossId,
            damageAmount,
          },
        );
      },
    });
  }
}
