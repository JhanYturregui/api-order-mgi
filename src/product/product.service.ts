import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { OrderProductDto } from 'src/order/dto/create-order.dto';
import { IProductRepository } from './interfaces/product-repository.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.productRepository.create(createProductDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to create product');
    }
  }

  async validateAndReserveProducts(
    orderProducts: OrderProductDto[],
    manager?: EntityManager,
  ) {
    const orderItems = [];
    for (const prod of orderProducts) {
      const product = await this.productRepository.findById(
        prod.productId,
        manager,
      );

      if (!product) {
        throw new BadRequestException(
          `Product with id: ${prod.productId} not found`,
        );
      }
      if (product.stock < prod.quantity) {
        throw new BadRequestException(
          `Not enough stock for product: ${product.name}`,
        );
      }

      orderItems.push({ product, quantity: prod.quantity });
    }

    for (const item of orderItems) {
      await this.productRepository.reserveStock(
        item.product,
        item.quantity,
        manager,
      );
    }

    return orderItems;
  }
}
