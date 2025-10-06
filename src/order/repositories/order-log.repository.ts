import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderLog } from '../entities/order-log.entity';
import { IOrderLogRepository } from '../interfaces/order-log.repository.interface';

@Injectable()
export class OrderLogRepository implements IOrderLogRepository {
  constructor(
    @InjectRepository(OrderLog) private readonly repo: Repository<OrderLog>,
  ) {}

  async create(orderLog: Partial<OrderLog>, manager?: EntityManager) {
    const orderLogRepository = manager
      ? manager.getRepository(OrderLog)
      : this.repo;
    const newOrderLog = orderLogRepository.create(orderLog);
    return await orderLogRepository.save(newOrderLog);
  }
}
