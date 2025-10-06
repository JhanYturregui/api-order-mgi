import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { IProductRepository } from '../interfaces/product-repository.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  async findById(id: number, manager?: EntityManager): Promise<Product | null> {
    if (manager) {
      return await manager.findOne(Product, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
    }
    return await this.repo.findOne({ where: { id } });
  }

  async create(
    createProductDto: CreateProductDto,
    manager?: EntityManager,
  ): Promise<Product> {
    const repository = manager ? manager.getRepository(Product) : this.repo;
    const newProduct = repository.create(createProductDto);
    return await repository.save(newProduct);
  }

  async reserveStock(
    product: Product,
    quantity: number,
    manager: EntityManager,
  ) {
    const repository = manager ? manager.getRepository(Product) : this.repo;
    product.stock -= quantity;
    return await repository.save(product);
  }
}
