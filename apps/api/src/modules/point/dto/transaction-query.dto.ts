import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TransactionQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @IsIn(['GROWTH', 'EXCHANGE'])
  pointsType?: string;
}
