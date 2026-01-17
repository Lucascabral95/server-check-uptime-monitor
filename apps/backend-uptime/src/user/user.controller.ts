import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUserDto, UpdateUserDto } from './dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll();
  }
  
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string, @Request() req: RequestUserDto) {
  
    return this.userService.findOne(id, req.user.dbUserId);
  }
  
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: RequestUserDto) {
    return this.userService.update(id, updateUserDto, req.user.dbUserId);
  }
  
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestUserDto) {
    return this.userService.remove(id, req.user.dbUserId);
  }
}
