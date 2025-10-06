import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findOneById(id: number, manager?: EntityManager): Promise<User | null> {
    const repository = manager ? manager.getRepository(User) : this.repo;
    return await repository.findOneBy({ id });
  }

  async create(
    createUserDto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const repository = manager ? manager.getRepository(User) : this.repo;

    const newUser = repository.create(createUserDto);
    return await repository.save(newUser);
  }
}
