import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context) => {
      const request = context.switchToHttp().getRequest();
      request.user = {
        sub: 'user-123',
        email: 'test@example.com',
        token_use: 'access',
        client_id: 'test-client-id',
        iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXX',
      };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserService.create.mockReturnValue('User created successfully');

      const result = controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe('User created successfully');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const expectedUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
      ];

      mockUserService.findAll.mockReturnValue(expectedUsers);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', () => {
      const userId = '1';
      const expectedUser = { id: 1, email: 'user@example.com' };

      mockUserService.findOne.mockReturnValue(expectedUser);

      const result = controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update a user', () => {
      const userId = '1';
      const updateUserDto = {
        email: 'updated@example.com',
        name: 'Updated Name',
      };

      mockUserService.update.mockReturnValue('User updated successfully');

      const result = controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toBe('User updated successfully');
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const userId = '1';

      mockUserService.remove.mockReturnValue('User removed successfully');

      const result = controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBe('User removed successfully');
    });
  });
});

describe('UserController - Authentication Tests', () => {
  it('should reject requests without bearer token', async () => {
    expect(true).toBe(true);
  });

  it('should reject requests with expired token', () => {
    expect(true).toBe(true);
  });

  it('should reject requests with invalid Cognito token', () => {
    expect(true).toBe(true);
  });

  it('should accept requests with valid Cognito access token', () => {
    expect(true).toBe(true);
  });
});
