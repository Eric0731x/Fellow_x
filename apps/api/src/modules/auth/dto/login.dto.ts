import { IsString, IsNotEmpty, IsOptional, Matches, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsString()
  @IsOptional()
  @Length(6, 20)
  password?: string;

  @IsString()
  @IsOptional()
  smsCode?: string;
}
