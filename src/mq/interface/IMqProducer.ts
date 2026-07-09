export interface IMqProducer<T> {
  sendMessage(message: T): Promise<void>;
}
