import { IsString, IsNotEmpty, IsInt, IsIn, IsOptional, MaxLength } from 'class-validator';

export class AdjustDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsIn(['GROWTH', 'EXCHANGE'])
  pointsType!: string;

  @IsInt()
  amount!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
