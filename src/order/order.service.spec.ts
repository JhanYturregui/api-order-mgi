import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { IOrderRepository } from './interfaces/order-repository.interface';
import { Order } from './entities/order.entity';
import { IOrderLogRepository } from './interfaces/order-log.repository.interface';

describe('OrderService', () => {
  let service: OrderService;
  let userService: jest.Mocked<UserService>;
  let productService: jest.Mocked<ProductService>;
  let dataSource: { transaction: jest.Mock };
  let mockManager: {
    create: jest.Mock;
    save: jest.Mock;
    getRepository: jest.Mock;
    findOne: jest.Mock;
  };
  let orderRepository: jest.Mocked<IOrderRepository>;
  let orderLogRepository: jest.Mocked<IOrderLogRepository>;

  beforeEach(async () => {
    mockManager = {
      create: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn(),
      findOne: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => cb(mockManager)),
    };

    userService = {
      findOneById: jest.fn(),
    } as any;

    productService = {
      validateAndReserveProducts: jest.fn(),
    } as any;

    orderRepository = {
      create: jest.fn(),
      createOrderProducts: jest.fn(),
    } as any;

    orderLogRepository = {
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: DataSource, useValue: dataSource },
        { provide: UserService, useValue: userService },
        { provide: ProductService, useValue: productService },
        { provide: 'IOrderRepository', useValue: orderRepository },
        { provide: 'IOrderLogRepository', useValue: orderLogRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    userService = module.get(UserService);
    productService = module.get(ProductService);
    orderRepository = module.get('IOrderRepository');
    orderLogRepository = module.get('IOrderLogRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if user doesnt exist', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 99,
        products: [{ productId: 1, quantity: 2 }],
      };
      userService.findOneById.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(userService.findOneById).toHaveBeenCalledWith(
        99,
        expect.anything(),
      );
    });
    it('should throw a BadRequestException if validate products failed', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 1,
        products: [{ productId: 1, quantity: 2 }],
      };
      userService.findOneById.mockResolvedValue({
        id: 1,
        name: 'John Doe',
      } as User);
      productService.validateAndReserveProducts.mockRejectedValue(
        new BadRequestException('Not enough stock'),
      );

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(productService.validateAndReserveProducts).toHaveBeenCalledWith(
        createOrderDto.products,
        expect.anything(),
      );
    });
    it('should create an order', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 1,
        products: [{ productId: 1, quantity: 1 }],
      };

      const mockUser = { id: 1, name: 'John Doe' } as User;
      userService.findOneById.mockResolvedValue(mockUser);

      const mockOrderProducts = [
        { product: { id: 1, name: 'Product 1' } as Product, quantity: 1 },
      ];
      productService.validateAndReserveProducts.mockResolvedValue(
        mockOrderProducts,
      );

      const mockOrder = { id: 123, user: mockUser } as Order;
      orderRepository.create = jest.fn().mockResolvedValue(mockOrder);

      orderRepository.createOrderProducts = jest.fn().mockResolvedValue([
        {
          id: 1,
          order: mockOrder,
          product: mockOrderProducts[0].product,
          quantity: 1,
        },
      ]);

      mockManager.findOne.mockResolvedValue({
        ...mockOrder,
        products: [
          {
            id: 1,
            order: mockOrder,
            product: mockOrderProducts[0].product,
            quantity: 1,
          },
        ],
      });

      const result = await service.create(createOrderDto);

      expect(userService.findOneById).toHaveBeenCalledWith(
        1,
        expect.anything(),
      );
      expect(productService.validateAndReserveProducts).toHaveBeenCalledWith(
        createOrderDto.products,
        expect.anything(),
      );
      expect(orderRepository.create).toHaveBeenCalledWith(
        { user: mockUser },
        expect.anything(),
      );
      expect(orderRepository.createOrderProducts).toHaveBeenCalled();
      expect(result.id).toBe(123);
      expect(result.products[0].product.id).toBe(1);
    });
    it('should throw BadRequestException when transaction fails unexpectedly', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 1,
        products: [{ productId: 1, quantity: 1 }],
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async () => {
        throw new Error('Unexpected DB error');
      });

      await expect(service.create(createOrderDto)).rejects.toThrow(
        new BadRequestException('Failed to create order'),
      );
    });
  });

  describe('OrderService concurrency', () => {
    it('should allow only 1 successful order when 10 users try with stock = 1', async () => {
      const userId = 1;
      const productId = 1;
      const createOrderDto: CreateOrderDto = {
        userId,
        products: [{ productId, quantity: 1 }],
      };
      const mockUser = { id: 1, name: 'John Doe' } as User;

      userService.findOneById.mockResolvedValue(mockUser);

      let stock = 1;
      productService.validateAndReserveProducts.mockImplementation(
        async (products) => {
          if (stock >= products[0].quantity) {
            stock -= products[0].quantity;
            return [
              { product: { id: productId }, quantity: products[0].quantity },
            ];
          }
          throw new BadRequestException('Not enough stock');
        },
      );
      orderRepository.create.mockResolvedValue({} as Order);
      orderRepository.createOrderProducts.mockResolvedValue(undefined);

      dataSource.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue({
            id: 123,
            user: { id: userId },
            products: [],
          }),
        });
      });

      const results = await Promise.allSettled(
        Array.from({ length: 10 }, () => service.create(createOrderDto)),
      );

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(9);
    });
  });
});
