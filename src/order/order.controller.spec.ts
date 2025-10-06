import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: { create: jest.fn() } }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 1,
        products: [{ productId: 2, quantity: 1 }],
      };
      const createdOrder: Order = {} as Order;
      orderService.create.mockResolvedValue(createdOrder);

      const result = await controller.create(createOrderDto);

      expect(orderService.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(createdOrder);
    });
  });
});
