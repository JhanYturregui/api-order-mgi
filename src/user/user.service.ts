import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { IUserRepository } from './interfaces/user-repository.interface';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findOneById(id: number, manager?: EntityManager): Promise<User> {
    return this.userRepository.findOneById(id, manager);
  }

  async create(
    createUserDto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    try {
      return await this.userRepository.create(createUserDto, manager);
    } catch (error) {
      if (error.code == '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw new BadRequestException('Failed to create user');
    }
  }
}
