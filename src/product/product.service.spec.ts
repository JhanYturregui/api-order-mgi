import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { IProductRepository } from './interfaces/product-repository.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { BadRequestException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'IProductRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            reserveStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get('IProductRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create one product', async () => {
      const dto: CreateProductDto = { name: 'Product 1' } as CreateProductDto;
      const createdProduct: Product = { id: 1, ...dto } as Product;
      (productRepository.create as jest.Mock).mockResolvedValue(createdProduct);

      const result = await service.create(dto);

      expect(productRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdProduct);
    });
    it('should thrown an error', async () => {
      const dto: CreateProductDto = { name: 'Product 1' } as CreateProductDto;
      (productRepository.create as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      await expect(service.create(dto)).rejects.toThrow(
        'Failed to create product',
      );
    });
  });

  describe('validateAndReserveProducts', () => {
    it('should throw an error if product doesnt exists', async () => {
      productRepository.findById.mockResolvedValue(null);

      const orderProducts = [{ productId: 99, quantity: 2 }];

      await expect(
        service.validateAndReserveProducts(orderProducts),
      ).rejects.toThrow(
        new BadRequestException('Product with id: 99 not found'),
      );
    });
    it('should reserve stock', async () => {
      const product: Product = {
        id: 1,
        name: 'Product 1',
        stock: 10,
      } as Product;

      productRepository.findById.mockResolvedValue(product);
      productRepository.reserveStock.mockResolvedValue(undefined);

      const orderProducts = [{ productId: 1, quantity: 3 }];

      const result = await service.validateAndReserveProducts(orderProducts);

      expect(productRepository.findById).toHaveBeenCalledWith(1, undefined);
      expect(productRepository.reserveStock).toHaveBeenCalledWith(
        product,
        3,
        undefined,
      );
      expect(result).toEqual([
        { product: { ...product, stock: 10 }, quantity: 3 },
      ]);
    });

    it('should throw an error if stock isnt enough', async () => {
      const product: Product = {
        id: 1,
        name: 'Product 1',
        stock: 2,
      } as Product;

      productRepository.findById.mockResolvedValue(product);
      productRepository.reserveStock.mockResolvedValue(undefined);

      const orderProducts = [{ productId: 1, quantity: 3 }];

      await expect(
        service.validateAndReserveProducts(orderProducts),
      ).rejects.toThrow(
        new BadRequestException('Not enough stock for product: Product 1'),
      );
    });
  });
});
