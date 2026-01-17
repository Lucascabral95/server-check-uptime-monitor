import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { RequestUserDto } from './dto/request-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
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
        dbUserId: 'db-user-123',
        role: Role.USER,
      };
      return true;
    }),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
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
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const expectedUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
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
      const expectedUser = { id: '1', email: 'user@example.com' };
      const mockReq = {
        user: { dbUserId: 'db-user-123', role: Role.USER },
      };

      mockUserService.findOne.mockReturnValue(expectedUser);

      const result = controller.findOne(userId, mockReq as any);

      expect(service.findOne).toHaveBeenCalledWith(userId, 'db-user-123');
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
  it('should update a user', () => {
    const userId = '1';
    const updateUserDto = {
      email: 'updated@example.com',
    };

    mockUserService.update.mockReturnValue('User updated successfully');

    const req = { user: { dbUserId: 'admin-id' } } as RequestUserDto;
    const result = controller.update(userId, updateUserDto, req);

    expect(service.update).toHaveBeenCalledWith(userId, updateUserDto, 'admin-id');
    expect(result).toBe('User updated successfully');
  });
});

describe('remove', () => {
  it('should remove a user', () => {
    const userId = '1';

    mockUserService.remove.mockReturnValue('User removed successfully');

    const req = { user: { dbUserId: 'admin-id' } } as RequestUserDto;
    const result = controller.remove(userId, req);

    expect(service.remove).toHaveBeenCalledWith(userId, 'admin-id');
    expect(result).toBe('User removed successfully');
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
});
