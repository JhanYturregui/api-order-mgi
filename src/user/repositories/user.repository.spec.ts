import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockRepo: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    } as any;

    repository = new UserRepository(mockRepo as any);
  });

  it('should call findOneBy on repo when no manager', async () => {
    const user = { id: 1, name: 'Test' } as User;
    mockRepo.findOneBy.mockResolvedValue(user);

    const result = await repository.findOneById(1);

    expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(user);
  });

  it('should create and save a user', async () => {
    const dto = { name: 'John' } as CreateUserDto;
    const entity = { id: 1, ...dto } as User;

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await repository.create(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });
});
