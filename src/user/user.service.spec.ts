import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IUserRepository } from './interfaces/user-repository.interface';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: { findOneById: jest.fn(), create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return one user', async () => {
      const user: User = { id: 1, name: 'John Doe' } as User;
      (userRepository.findOneById as jest.Mock).mockResolvedValue(user);

      const result = await service.findOneById(1);

      expect(userRepository.findOneById).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(user);
    });

    it('should return null if user doesnt exists', async () => {
      (userRepository.findOneById as jest.Mock).mockResolvedValue(null);

      const result = await service.findOneById(999);

      expect(userRepository.findOneById).toHaveBeenCalledWith(999, undefined);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create one user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
      } as CreateUserDto;
      const createdUser: User = { id: 99, ...createUserDto } as User;

      (userRepository.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        createUserDto,
        undefined,
      );
      expect(result).toEqual(createdUser);
    });
    it('should throw BadRequestException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
      } as CreateUserDto;

      const error: any = new Error('duplicate key');
      error.code = '23505';
      userRepository.create.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );
    });
    it('should throw BadRequestException for other errors', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
      } as CreateUserDto;

      const error: any = new Error('Some db error');
      userRepository.create.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Failed to create user'),
      );
    });
  });
});
