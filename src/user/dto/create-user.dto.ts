import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  roleName: string;

  @IsString()
  // apply more rules for password as you see fit
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}
