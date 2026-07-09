import { Kafka } from 'kafkajs';

export const initKafka = (config: {
  clientId: string;
  brokers: string[];
}): Kafka => {
  return new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
  });
};
