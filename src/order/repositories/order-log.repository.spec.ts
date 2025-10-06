import { Repository, EntityManager } from 'typeorm';
import { OrderLogRepository } from './order-log.repository';
import {
  OrderLog,
  OrderStage,
  OrderStatus,
} from '../entities/order-log.entity';

describe('OrderLogRepository', () => {
  let repository: OrderLogRepository;
  let mockRepo: jest.Mocked<Repository<OrderLog>>;
  let mockManager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    mockManager = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as any;

    repository = new OrderLogRepository(mockRepo as any);
  });

  it('should create and save order log using repo when no manager', async () => {
    const stage = OrderStage.START;
    const status = OrderStatus.SUCCESS;
    const partialOrderLog = {
      orderId: 0,
      stage,
      status,
    } as Partial<OrderLog>;
    const entity = { id: 1, stage, status } as unknown as OrderLog;

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await repository.create(partialOrderLog);

    expect(mockRepo.create).toHaveBeenCalledWith(partialOrderLog);
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('should create and save order using manager when provided', async () => {
    const stage = OrderStage.START;
    const status = OrderStatus.SUCCESS;
    const dto = {
      orderId: 0,
      stage,
      status,
    } as Partial<OrderLog>;
    const entity = { id: 1, stage, status } as unknown as OrderLog;

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await repository.create(dto, mockManager);

    expect(mockManager.getRepository).toHaveBeenCalledWith(OrderLog);
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });
});
