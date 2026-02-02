import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        { id: '1', email: 'user1@example.com', role: Role.USER },
        { id: '2', email: 'user2@example.com', role: Role.ADMIN },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no users found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
      await expect(service.findAll()).rejects.toThrow('No users found');
    });
  });

  describe('findOne', () => {
    it('should return a single user by id when user is the owner', async () => {
      const userId = 'user-id-123';
      const currentUserId = 'user-id-123';
      const expectedUser = { id: userId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId, currentUserId);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-id';
      const currentUserId = 'user-id-123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId, currentUserId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId, currentUserId)).rejects.toThrow('User not found');
    });

    it('should allow access when user is the owner', async () => {
      const userId = 'user-id-123';
      const currentUserId = 'user-id-123';
      const expectedUser = { id: userId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId, currentUserId);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: currentUserId },
      });
    });

    it('should allow access when current user is ADMIN', async () => {
      const userId = 'user-id-456';
      const currentUserId = 'admin-id-123';
      const targetUser = { id: userId, email: 'other@example.com', role: Role.USER };
      const adminUser = { id: currentUserId, email: 'admin@example.com', role: Role.ADMIN };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(adminUser);

      const result = await service.findOne(userId, currentUserId);

      expect(result).toEqual(targetUser);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: currentUserId },
      });
    });

    it('should throw ForbiddenException when user is not the owner and not ADMIN', async () => {
      const userId = 'user-id-456';
      const currentUserId = 'user-id-123';
      const otherUser = { id: userId, email: 'other@example.com', role: Role.USER };
      const regularUser = { id: currentUserId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(otherUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(regularUser);

      await expect(service.findOne(userId, currentUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne(userId, currentUserId)).rejects.toThrow('You can only access your own user information');
    });

    it('should throw ForbiddenException when currentUserId is not provided', async () => {
      const userId = 'user-id-123';
      const expectedUser = { id: userId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      await expect(service.findOne(userId, undefined)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne(userId, undefined)).rejects.toThrow('Authentication required');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const currentUser = { id: userId, email: 'user@example.com', role: Role.USER };
      const updatedUser = { id: userId, email: 'updated@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(currentUser).mockResolvedValueOnce(null);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(currentUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto, userId);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const userId = 'non-existent-id';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already exists', async () => {
      const userId = 'user-id-123';
      const currentUserId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };
      const existingUser = { id: 'other-id', email: 'existing@example.com', role: Role.USER };
      const currentUser = { id: userId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(currentUser).mockResolvedValueOnce(existingUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(currentUser);

      const updatePromise = service.update(userId, updateUserDto, currentUserId);
      await expect(updatePromise).rejects.toThrow(BadRequestException);
      await expect(updatePromise).rejects.toThrow('User with this email already exists');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = 'user-id-123';
      const deletedUser = { id: userId, email: 'deleted@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(deletedUser);
      mockPrismaService.user.delete.mockResolvedValue(deletedUser);

      const result = await service.remove(userId, userId);

      expect(result).toEqual(deletedUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      const userId = 'non-existent-id';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId, userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('findOrCreateByEmail', () => {
    it('should return existing user if found', async () => {
      const createUserDto: CreateUserDto = {
        id: 'cognito-id',
        email: 'existing@example.com',
      };
      const existingUser = { id: 'db-id-123', email: 'existing@example.com', role: Role.USER, cognitoSub: 'cognito-id' };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.findOrCreateByEmail(createUserDto);

      expect(result).toEqual(existingUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should create new user with cognitoSub and default role if not found', async () => {
      const createUserDto: CreateUserDto = {
        id: 'cognito-sub-123',
        email: 'new@example.com',
      };
      const newUser = { id: 'db-id-456', email: 'new@example.com', role: Role.USER, cognitoSub: 'cognito-sub-123' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreateByEmail(createUserDto);

      expect(result).toEqual(newUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          cognitoSub: createUserDto.id,
          role: Role.USER,
        },
      });
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is ADMIN', async () => {
      const userId = 'admin-id';
      const adminUser = { id: userId, email: 'admin@example.com', role: Role.ADMIN };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(adminUser);

      const result = await service.isAdmin(userId);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return false when user is not ADMIN', async () => {
      const userId = 'user-id';
      const regularUser = { id: userId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(regularUser);

      const result = await service.isAdmin(userId);

      expect(result).toBe(false);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return false when user is GUEST', async () => {
      const userId = 'guest-id';
      const guestUser = { id: userId, email: 'guest@example.com', role: Role.GUEST };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(guestUser);

      const result = await service.isAdmin(userId);

      expect(result).toBe(false);
    });
  });

  describe('findUserByEmail', () => {
    it('should throw BadRequestException when email already exists', async () => {
      const existingEmail = 'existing@example.com';
      const existingUser = { id: 'user-id', email: existingEmail, role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.findUserByEmail(existingEmail)).rejects.toThrow(BadRequestException);
      await expect(service.findUserByEmail(existingEmail)).rejects.toThrow('User with this email already exists');
    });

    it('should return undefined when email does not exist', async () => {
      const newEmail = 'new@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserByEmail(newEmail);

      expect(result).toBeUndefined();
    });

    it('should handle Prisma errors properly', async () => {
      const email = 'test@example.com';
      const prismaError = new Error('Prisma connection error');
      (prismaError as any).code = 'P1001';

      mockPrismaService.user.findUnique.mockRejectedValue(prismaError);

      await expect(service.findUserByEmail(email)).rejects.toThrow();
    });
  });

  describe('findOrCreateByCognitoSub', () => {
    it('should return existing user when found by cognitoSub', async () => {
      const cognitoSub = 'cognito-sub-123';
      const existingUser = { id: 'db-id-123', email: 'existing@example.com', role: Role.USER, cognitoSub };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.findOrCreateByCognitoSub(cognitoSub);

      expect(result).toEqual(existingUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoSub },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should create new user with email when not found', async () => {
      const cognitoSub = 'new-cognito-sub';
      const email = 'new@example.com';
      const newUser = { id: 'db-id-456', email, role: Role.USER, cognitoSub };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreateByCognitoSub(cognitoSub, email);

      expect(result).toEqual(newUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoSub },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          cognitoSub,
          role: Role.USER,
        },
      });
    });

    it('should throw BadRequestException when email is not provided for new user creation', async () => {
      const cognitoSub = 'new-cognito-sub';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOrCreateByCognitoSub(cognitoSub)).rejects.toThrow(BadRequestException);
      await expect(service.findOrCreateByCognitoSub(cognitoSub)).rejects.toThrow('Email is required for user creation');
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is undefined for new user creation', async () => {
      const cognitoSub = 'new-cognito-sub';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOrCreateByCognitoSub(cognitoSub, undefined)).rejects.toThrow(BadRequestException);
      await expect(service.findOrCreateByCognitoSub(cognitoSub, undefined)).rejects.toThrow('Email is required for user creation');
    });
  });

  describe('findOne - error handling', () => {
    it('should handle Prisma errors properly', async () => {
      const userId = 'user-id-123';
      const currentUserId = 'user-id-123';
      const prismaError = new Error('Prisma connection error');
      (prismaError as any).code = 'P1001';

      mockPrismaService.user.findUnique.mockRejectedValue(prismaError);

      await expect(service.findOne(userId, currentUserId)).rejects.toThrow();
    });
  });

  describe('update - additional tests', () => {
    it('should throw ForbiddenException when user is not the owner and not ADMIN', async () => {
      const userId = 'user-id-456';
      const currentUserId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const otherUser = { id: userId, email: 'other@example.com', role: Role.USER };
      const regularUser = { id: currentUserId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(otherUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(regularUser);

      await expect(service.update(userId, updateUserDto, currentUserId)).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to update any user', async () => {
      const userId = 'user-id-456';
      const currentUserId = 'admin-id-123';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const targetUser = { id: userId, email: 'other@example.com', role: Role.USER };
      const adminUser = { id: currentUserId, email: 'admin@example.com', role: Role.ADMIN };
      const updatedUser = { id: userId, email: 'updated@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(targetUser).mockResolvedValueOnce(null);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(adminUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto, currentUserId);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should handle Prisma errors during update', async () => {
      const userId = 'user-id-123';
      const currentUserId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
      };
      const currentUser = { id: userId, email: 'user@example.com', role: Role.USER };
      const prismaError = new Error('Prisma connection error');
      (prismaError as any).code = 'P1001';

      mockPrismaService.user.findUnique.mockResolvedValueOnce(currentUser).mockResolvedValueOnce(null);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(currentUser);
      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.update(userId, updateUserDto, currentUserId)).rejects.toThrow();
    });
  });

  describe('remove - additional tests', () => {
    it('should throw ForbiddenException when user is not the owner and not ADMIN', async () => {
      const userId = 'user-id-456';
      const currentUserId = 'user-id-123';
      const otherUser = { id: userId, email: 'other@example.com', role: Role.USER };
      const regularUser = { id: currentUserId, email: 'user@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValue(otherUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(regularUser);

      await expect(service.remove(userId, currentUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(userId, currentUserId)).rejects.toThrow('You can only access your own user information');
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to delete any user', async () => {
      const userId = 'user-id-456';
      const currentUserId = 'admin-id-123';
      const targetUser = { id: userId, email: 'other@example.com', role: Role.USER };
      const adminUser = { id: currentUserId, email: 'admin@example.com', role: Role.ADMIN };
      const deletedUser = { id: userId, email: 'other@example.com', role: Role.USER };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(targetUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(adminUser);
      mockPrismaService.user.delete.mockResolvedValue(deletedUser);

      const result = await service.remove(userId, currentUserId);

      expect(result).toEqual(deletedUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should handle Prisma errors during deletion', async () => {
      const userId = 'user-id-123';
      const currentUserId = 'user-id-123';
      const currentUser = { id: userId, email: 'user@example.com', role: Role.USER };
      const prismaError = new Error('Prisma connection error');
      (prismaError as any).code = 'P1001';

      mockPrismaService.user.findUnique.mockResolvedValue(currentUser);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(currentUser);
      mockPrismaService.user.delete.mockRejectedValue(prismaError);

      await expect(service.remove(userId, currentUserId)).rejects.toThrow();
    });
  });

  describe('findAll - error handling', () => {
    it('should handle Prisma errors properly', async () => {
      const prismaError = new Error('Prisma connection error');
      (prismaError as any).code = 'P1001';

      mockPrismaService.user.findMany.mockRejectedValue(prismaError);

      await expect(service.findAll()).rejects.toThrow();
    });
  });
});
