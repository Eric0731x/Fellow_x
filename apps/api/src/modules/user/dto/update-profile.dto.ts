import { IsString, IsOptional, IsEmail, IsIn, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'UNKNOWN'])
  gender?: string;

  @IsOptional()
  birthday?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
