import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ApplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;
}
