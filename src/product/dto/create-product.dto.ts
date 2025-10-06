import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(6)
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  stock?: number;
}
