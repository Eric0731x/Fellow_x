import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ActivityQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  @IsIn(['hot', 'new'])
  sort?: string;
}
