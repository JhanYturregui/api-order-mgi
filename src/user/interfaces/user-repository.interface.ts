import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUserRepository {
  findOneById(id: number, manager?: EntityManager): Promise<User | null>;

  create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User>;
}
