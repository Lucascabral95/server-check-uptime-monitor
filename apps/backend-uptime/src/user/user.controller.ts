import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DataUserGetDto, RequestUserDto, UpdateUserDto } from './dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags("Users")
@ApiBearerAuth("jwt-auth")
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
   @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, type: [DataUserGetDto] })
  @ApiResponse({ status: 404, description: 'No users found' })
  findAll() {
    return this.userService.findAll();
  }
  
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: DataUserGetDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string, @Request() req: RequestUserDto) {
  
    return this.userService.findOne(id, req.user.dbUserId);
  }
  
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: RequestUserDto) {
    return this.userService.update(id, updateUserDto, req.user.dbUserId);
  }
  
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string, @Request() req: RequestUserDto) {
    return this.userService.remove(id, req.user.dbUserId);
  }
}
