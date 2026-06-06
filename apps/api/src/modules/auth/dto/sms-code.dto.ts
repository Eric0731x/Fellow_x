import { IsString, IsNotEmpty, IsIn, Matches } from 'class-validator';

export class SmsCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['register', 'login', 'reset'])
  scene!: string;
}
