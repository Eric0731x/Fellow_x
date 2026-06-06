import { IsString, IsIn } from 'class-validator';

export class LifecycleDto {
  @IsString()
  @IsIn(['openRegistration', 'start', 'end', 'cancel'])
  action!: string;
}
