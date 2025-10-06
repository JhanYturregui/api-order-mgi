import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { IOrderRepository } from './interfaces/order-repository.interface';
import { Order } from './entities/order.entity';
import { IOrderLogRepository } from './interfaces/order-log.repository.interface';
import { OrderLog, OrderStage, OrderStatus } from './entities/order-log.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IOrderLogRepository')
    private readonly orderLogRepository: IOrderLogRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        await this.createOrderLog(
          OrderStage.START,
          OrderStatus.SUCCESS,
          'Start transaction',
        );

        const user = await this.userService.findOneById(
          createOrderDto.userId,
          manager,
        );
        if (!user) {
          throw new BadRequestException('User not found');
        }

        const orderProducts =
          await this.productService.validateAndReserveProducts(
            createOrderDto.products,
            manager,
          );

        const order = await this.orderRepository.create({ user }, manager);
        await this.orderRepository.createOrderProducts(
          order,
          orderProducts,
          manager,
        );

        await this.createOrderLog(
          OrderStage.ORDER_CREATED,
          OrderStatus.SUCCESS,
          `Order created with id: ${order.id}`,
        );

        return manager.findOne(Order, {
          where: { id: order.id },
          relations: ['products', 'products.product', 'user'],
        });
      });
    } catch (error) {
      const message = error.response ? error.response.message : 'Other error';
      const stage = this.getStage(message);

      await this.createOrderLog(stage, OrderStatus.FAILED, message);
      throw new BadRequestException('Failed to create order');
    }
  }

  getStage(message: string) {
    let stage: OrderStage;
    switch (message) {
      case 'User not found':
        stage = OrderStage.VALIDATE_USER;
        break;
      case 'Other error':
        stage = OrderStage.OTHER;
        break;
      default:
        stage = OrderStage.VALIDATE_STOCK;
        break;
    }
    return stage;
  }

  async createOrderLog(
    stage: OrderStage,
    status: OrderStatus,
    message?: string,
  ) {
    const newOrderLog: Partial<OrderLog> = {
      orderId: 0,
      stage,
      status,
      message,
    };
    return await this.orderLogRepository.create(newOrderLog);
  }
}
