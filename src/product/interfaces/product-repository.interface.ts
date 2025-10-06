import { EntityManager } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findById(id: number, manager?: EntityManager): Promise<Product | null>;

  create(
    createProductDto: CreateProductDto,
    manager?: EntityManager,
  ): Promise<Product>;

  reserveStock(
    product: Product,
    quantity: number,
    manager?: EntityManager,
  ): Promise<Product>;
}
