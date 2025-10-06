import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderProductDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty({ type: [OrderProductDto], description: 'List of products' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  @ArrayMinSize(1)
  products: OrderProductDto[];
}

export class ProductDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'P-001' })
  code: string;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ example: 8 })
  stock: number;

  @ApiProperty({ example: 2 })
  stock_reserved: number;
}

export class OrderProductResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ type: () => ProductDto })
  product: ProductDto;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@test.com' })
  email: string;
}

export class CreateOrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-10-04T17:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-04T17:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => [OrderProductResponseDto] })
  products: OrderProductResponseDto[];
}
