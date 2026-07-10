import { 
  Injectable,
   NotFoundException,
    ForbiddenException,
     BadRequestException,
      InternalServerErrorException, 
    } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { CreateUserDto, UpdateUserDto, PaginationUserDto, PaginatedUsersResponseDto } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {

  constructor( private prisma: PrismaService ) {}

  async findAll(paginationDto: PaginationUserDto = {}): Promise<PaginatedUsersResponseDto<any>> {
  try {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);

    if (totalItems === 0) {
      throw new NotFoundException('No users found');
    }

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        totalItems,
        itemsPerPage: limit,
      },
    };
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

    // isAdmin() re-queries the requester's own row, so it's only worth
    // paying for when the requester isn't already looking at their own data.
    if (!isOwnProfile) {
      const isUserAdmin = await this.isAdmin(currentUserId);
      if (!isUserAdmin) {
        throw new ForbiddenException('You can only access your own user information');
      }
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
    const currentUser = await this.findOne(id, currentUserId);

    // Only worth a uniqueness check when the email is actually changing —
    // otherwise a no-op email field would collide with the user's own row.
    if (updateUserDto.email && updateUserDto.email !== currentUser.email) {
      await this.findUserByEmail(updateUserDto.email);
    }

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
