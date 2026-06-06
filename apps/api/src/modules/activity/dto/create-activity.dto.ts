import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength, IsIn, IsDateString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @IsString()
  @IsOptional()
  @IsIn(['共学', '精读', '分享', '训练', '线下', '共建', '投稿'])
  category?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  summary!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location!: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minLevelId?: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  maxParticipants!: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;
}
