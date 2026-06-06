import { IsString, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['ACTIVE', 'SUSPENDED', 'ON_SHELF', 'OFF_SHELF'])
  status!: string;
}
