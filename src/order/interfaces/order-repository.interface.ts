import { EntityManager } from 'typeorm';
import { OrderProduct } from '../entities/order-product.entity';
import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  create(order: Partial<Order>, manager?: EntityManager): Promise<Order>;

  createOrderProducts(
    order: Order,
    orderProducts: OrderProduct[],
    manager?: EntityManager,
  ): Promise<any>;
}
