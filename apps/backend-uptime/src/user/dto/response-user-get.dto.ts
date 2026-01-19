import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ResponseUserGetDto {
  @ApiProperty({ type: () => [DataUserGetDto] })
  data: DataUserGetDto[];
}

export class DataUserGetDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  frequency: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: Date })
  nextCheck: Date;

  @ApiProperty({ type: Date })
  lastCheck: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ enum: Status })
  status: Status;
}
