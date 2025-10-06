import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { OrderProduct } from '../entities/order-product.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
  ) {}

  async create(order: Partial<Order>, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Order) : this.repo;
    const newOrder = repository.create(order);
    return await repository.save(newOrder);
  }

  async createOrderProducts(
    order: Order,
    orderProducts: OrderProduct[],
    manager?: EntityManager,
  ) {
    const orderProductRepository = manager.getRepository(OrderProduct);
    const items = orderProducts.map((item) =>
      orderProductRepository.create({
        order,
        product: item.product,
        quantity: item.quantity,
      }),
    );
    return await manager.save(OrderProduct, items);
  }
}
