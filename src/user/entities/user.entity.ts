// src/entities/user.entity.ts
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AccountStatus } from '../enums/users.enum';
import { Role } from 'src/auth/entities/role.entity';
import { Permission } from 'src/auth/entities/permission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: AccountStatus.Inactive })
  accountStatus: AccountStatus;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles?: Role[];

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions?: Permission[];
}
