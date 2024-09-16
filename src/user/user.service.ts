// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FindUsersDto } from './dto/find-users.dto';
import { AccountStatus } from '..//user/enums/users.enum';
import { ClientRole } from 'src/auth/enums/role.enum';
import { Role } from 'src/auth/entities/role.entity';

@Injectable()
export class UserService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  

  async create(dto: CreateUserDto): Promise<User> {
    const { username, password, name, roleName } = dto;
    // Create a QueryRunner for the transaction
    const queryRunner = this.userRepository.manager.connection.createQueryRunner(); 
    // Start a transaction
    await queryRunner.startTransaction();

    try {
      // Hash password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      // Create new user
      const user = this.userRepository.create({
        username,
        password: hashedPassword,
        name,
        accountStatus: AccountStatus.Inactive,  // Set default value
      });
      // Save the new user within the transaction
      const newUser = await queryRunner.manager.save(user);
      // Delete password before returning the user object
      delete (newUser as Partial<User>).password;
      // If roleName is provided, handle role assignment
      if (roleName) {
        const role = roleName as ClientRole;
        const userRole = await queryRunner.manager.findOne(Role, { where: { name: role } });
        // Check if the role exists
        if (!userRole) {
          throw new NotFoundException(`Role ${roleName} does not exist`);
        }
        // Assign role to the new user
        newUser.roles = [userRole];
        await queryRunner.manager.save(User, newUser);
      }
      // Commit the transaction
      await queryRunner.commitTransaction();
      return newUser;

    } catch (err) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
  
  

  async findMany(dto: FindUsersDto) {
    return this.userRepository.createQueryBuilder('user').getMany();
  }
  async findByUsername(dto: any) {
    return this.userRepository.findOne({where:{username:dto}});
  }


  async findOne(
    username: string,
    selectSecrets: boolean = false,
  ): Promise<User | null> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermission')
      // .leftJoinAndSelect('user.permissions', 'permission');

    if (selectSecrets) {
      query.addSelect('user.password');
    }

    return await query.getOne();
  }

  async update(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException();
    }

    const { roles, permissions, accountStatus } = dto;

    user.roles = roles ?? user.roles;
    // user.permissions = permissions ?? user.permissions;
    user.accountStatus = accountStatus ?? user.accountStatus;

    return await this.userRepository.save(user);
  }
}
