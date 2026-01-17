import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a placeholder message', () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = service.create(createUserDto);

      expect(result).toBe('This action adds a new user');
    });
  });

  describe('findAll', () => {
    it('should return a placeholder message', () => {
      const result = service.findAll();

      expect(result).toBe('ok');
    });
  });

  describe('findOne', () => {
    it('should return a placeholder message with user id', () => {
      const userId = 1;

      const result = service.findOne(userId);

      expect(result).toBe('This action returns a #1 user');
    });

    it('should return placeholder message for non-existent user', () => {
      const userId = 999;

      const result = service.findOne(userId);

      expect(result).toBe('This action returns a #999 user');
    });
  });

  describe('update', () => {
    it('should return a placeholder message with user id', () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        name: 'Updated Name',
      };

      const result = service.update(userId, updateUserDto);

      expect(result).toBe('This action updates a #1 user');
    });
  });

  describe('remove', () => {
    it('should return a placeholder message with user id', () => {
      const userId = 1;

      const result = service.remove(userId);

      expect(result).toBe('This action removes a #1 user');
    });
  });
});
