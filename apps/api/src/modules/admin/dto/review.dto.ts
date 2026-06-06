import { IsBoolean, IsString, IsOptional, MaxLength } from 'class-validator';

export class AdminReviewDto {
  @IsBoolean()
  approved!: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  rejectReason?: string;
}
