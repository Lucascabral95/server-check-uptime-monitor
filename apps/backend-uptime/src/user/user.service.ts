import { 
  Injectable,
   NotFoundException,
    ForbiddenException,
     BadRequestException,
      InternalServerErrorException, 
    } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {

  constructor( private prisma: PrismaService ) {}

  async findAll() {
  try {
    const allUsers = await this.prisma.user.findMany();
    
    if (!allUsers || allUsers.length === 0) {
      throw new NotFoundException('No users found');
    }
    
    return allUsers;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw handlePrismaError(error, 'Error finding all users');
  }
}

async findOne(id: string, currentUserId?: string) {
  try {
    const findUserById = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!findUserById) {
      throw new NotFoundException('User not found');
    }

    if (!currentUserId) {
      throw new ForbiddenException('Authentication required');
    }

    const isOwnProfile = findUserById.id === currentUserId;
    const isUserAdmin = await this.isAdmin(currentUserId);

    if (!isOwnProfile && !isUserAdmin) {
      throw new ForbiddenException('You can only access your own user information');
    }

    return findUserById;

  } catch (error) {
    if (error instanceof NotFoundException || error instanceof ForbiddenException) {
      throw error;
    }
    throw handlePrismaError(error, 'Error finding user');
  }
}

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string) {
    const emailUpdated = {...updateUserDto, email: updateUserDto.email};
    await this.findOne(id, currentUserId);
    await this.findUserByEmail(emailUpdated.email);
    
    try {
      const userUpdated = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return userUpdated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error updating user');
    }
  }
  
  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);

    try {
      return this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error, 'Error deleting user');
    }
  }
 
  async isAdmin(id: string): Promise<boolean> {
  const user = await this.prisma.user.findUniqueOrThrow({
    where: { id },
  });
  
  return user.role === Role.ADMIN;
}
  
  async findUserByEmail(email: string){
    try {
        const findUserByEmail = await this.prisma.user.findUnique({
          where: {
            email: email,
           },
         })

         if (findUserByEmail) {
          throw new BadRequestException('User with this email already exists');
         }

         return;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error finding user by email');
    }
  }
  
  async findOrCreateByEmail(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        cognitoSub: createUserDto.id,
        role: Role.USER,
      },
    });
  }

  async findOrCreateByCognitoSub(cognitoSub: string, email?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { cognitoSub },
    });

    if (existingUser) {
      return existingUser;
    }

    if (!email) {
      throw new BadRequestException('Email is required for user creation');
    }

    return this.prisma.user.create({
      data: {
        email,
        cognitoSub,
        role: Role.USER,
      },
    });
  }
}
