import { OrderRepository } from './order.repository';
import { Repository, EntityManager } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderProduct } from '../entities/order-product.entity';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let mockRepo: jest.Mocked<Repository<Order>>;
  let mockManager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    mockManager = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
      save: jest.fn(),
    } as any;

    repository = new OrderRepository(mockRepo as any);
  });

  it('should create and save order using repo when no manager', async () => {
    const partialOrder = { total: 150 } as Partial<Order>;
    const entity = { id: 1, total: 150 } as unknown as Order;

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await repository.create(partialOrder);

    expect(mockRepo.create).toHaveBeenCalledWith(partialOrder);
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should create and save order using manager when provided', async () => {
    const partialOrder = { total: 200 } as Partial<Order>;
    const entity = { id: 2, total: 200 } as unknown as Order;

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await repository.create(partialOrder, mockManager);

    expect(mockManager.getRepository).toHaveBeenCalledWith(Order);
    expect(mockRepo.create).toHaveBeenCalledWith(partialOrder);
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  describe('createOrderProducts', () => {
    it('should create and save order products', async () => {
      const order = { id: 1 } as Order;
      const orderProducts = [
        { product: { id: 1 } as any, quantity: 2 },
        { product: { id: 2 } as any, quantity: 3 },
      ] as OrderProduct[];

      const mockOrderProductRepo = {
        create: jest.fn((obj) => obj),
      } as any;

      mockManager.getRepository.mockReturnValue(mockOrderProductRepo);
      mockManager.save.mockResolvedValue('savedItems');

      const result = await repository.createOrderProducts(
        order,
        orderProducts,
        mockManager,
      );

      expect(mockManager.getRepository).toHaveBeenCalledWith(OrderProduct);
      expect(mockOrderProductRepo.create).toHaveBeenCalledTimes(
        orderProducts.length,
      );
      expect(mockOrderProductRepo.create).toHaveBeenCalledWith({
        order,
        product: orderProducts[0].product,
        quantity: orderProducts[0].quantity,
      });
      expect(mockOrderProductRepo.create).toHaveBeenCalledWith({
        order,
        product: orderProducts[1].product,
        quantity: orderProducts[1].quantity,
      });
      expect(mockManager.save).toHaveBeenCalledWith(OrderProduct, [
        {
          order,
          product: orderProducts[0].product,
          quantity: orderProducts[0].quantity,
        },
        {
          order,
          product: orderProducts[1].product,
          quantity: orderProducts[1].quantity,
        },
      ]);
      expect(result).toBe('savedItems');
    });
  });
});
