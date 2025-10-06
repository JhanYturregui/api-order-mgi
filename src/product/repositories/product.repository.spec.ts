import { ProductRepository } from './product.repository';
import { Repository, EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let mockRepo: jest.Mocked<Repository<Product>>;
  let mockManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn().mockReturnThis(),
    } as any;

    mockManager = {
      findOne: jest.fn(),
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as any;

    repository = new ProductRepository(mockRepo as any);
  });

  it('should findById using repo when no manager', async () => {
    const product = { id: 1, name: 'Laptop' } as Product;
    mockRepo.findOne.mockResolvedValue(product);

    const result = await repository.findById(1);

    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(product);
  });

  it('should findById using manager with pessimistic lock', async () => {
    const product = { id: 1, name: 'Laptop' } as Product;
    mockManager.findOne.mockResolvedValue(product);

    const result = await repository.findById(1, mockManager);

    expect(mockManager.findOne).toHaveBeenCalledWith(Product, {
      where: { id: 1 },
      lock: { mode: 'pessimistic_write' },
    });
    expect(result).toEqual(product);
  });

  it('should create a product', async () => {
    const dto = { name: 'Mouse' } as CreateProductDto;
    const product = { id: 1, name: 'Mouse' } as Product;

    mockRepo.create.mockReturnValue(product);
    mockRepo.save.mockResolvedValue(product);

    const result = await repository.create(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(product);
    expect(result).toEqual(product);
  });

  it('should reserve stock and save', async () => {
    const product = { id: 1, stock: 10 } as Product;
    const updated = { id: 1, stock: 7 } as Product;

    mockRepo.save.mockResolvedValue(updated);

    const result = await repository.reserveStock(product, 3, mockManager);

    expect(product.stock).toBe(7);
    expect(mockRepo.save).toHaveBeenCalledWith(product);
    expect(result).toEqual(updated);
  });
});
