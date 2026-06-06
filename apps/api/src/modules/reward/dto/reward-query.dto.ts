import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RewardQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;
}
