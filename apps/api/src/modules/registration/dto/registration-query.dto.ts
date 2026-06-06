import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RegistrationQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
