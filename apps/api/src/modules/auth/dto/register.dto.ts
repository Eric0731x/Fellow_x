import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name!: string;

  @IsString()
  @IsNotEmpty()
  smsCode!: string;
}
