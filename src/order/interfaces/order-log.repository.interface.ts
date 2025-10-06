import { EntityManager } from 'typeorm';
import { OrderLog } from '../entities/order-log.entity';

export interface IOrderLogRepository {
  create(
    orderLog: Partial<OrderLog>,
    manager?: EntityManager,
  ): Promise<OrderLog>;
}
