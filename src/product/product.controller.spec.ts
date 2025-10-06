import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: { create: jest.fn() } }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create one product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product new',
      } as CreateProductDto;
      const createdProduct: Product = {
        id: 123,
        ...createProductDto,
      } as Product;

      productService.create.mockResolvedValue(createdProduct);

      const result = await controller.create(createProductDto);

      expect(productService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(createdProduct);
    });
  });
});
