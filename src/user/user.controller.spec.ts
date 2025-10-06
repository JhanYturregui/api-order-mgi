import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOneById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return a user', async () => {
      const user: User = { id: 1, name: 'Jhon Doe' } as User;
      userService.findOneById.mockResolvedValue(user);

      const result = await controller.findOneById(1);

      expect(userService.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('should return null if the user doesnt exists', async () => {
      userService.findOneById.mockResolvedValue(null);

      const result = await controller.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create one user', async () => {
      const dto: CreateUserDto = { name: 'John Doe' } as CreateUserDto;
      const createdUser: User = { id: 123, ...dto } as User;

      userService.create.mockResolvedValue(createdUser);

      const result = await controller.create(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });
});
