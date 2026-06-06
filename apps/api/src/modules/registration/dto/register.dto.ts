import { IsString, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contact?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
