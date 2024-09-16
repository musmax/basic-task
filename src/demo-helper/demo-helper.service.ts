import { Injectable } from '@nestjs/common';
import { ClientPermission } from 'src/auth/enums/permission.enum';
import { Permission } from 'src/auth/entities/permission.entity';
import { AccountStatus } from 'src/user/enums/users.enum';
import { ClientRole } from 'src/auth/enums/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/entities/role.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class DemoHelperService {
  constructor(
    private usersService: UserService,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async setUpForDemo() {
    // demo permissions
    const permissions = await this.createPermissions([
      ClientPermission.CreateUser,
      ClientPermission.ReadUser,
      ClientPermission.UpdateUser,
      ClientPermission.DeleteUser,
      ClientPermission.CreateAnnouncement,
      ClientPermission.UpdateAnnouncement,
      ClientPermission.UploadFile,
    ]);

    // demo roles
    const [
      createClientPermission,
      readClientPermission,
      updateClientPermission,
      deleteClientPermission,
      uploadFilePermission,
      createAnnouncementPermission,
      updateAnnouncementPermission,
    ] = permissions;

    const adminRole = await this.createRole({
      name: ClientRole.Admin,
      rank: 0,
      permissions: [
        createClientPermission,
        readClientPermission,
        updateClientPermission,
        deleteClientPermission,
      ],
    });

    const superRole = await this.createRole({
      name: ClientRole.SuperAdmin,
      rank: 1,
      permissions: [
        createClientPermission,
        readClientPermission,
        updateClientPermission,
        deleteClientPermission,
        uploadFilePermission,
        createAnnouncementPermission,
        updateAnnouncementPermission,
      ],
    });


    const editorRole = await this.createRole({
      name: ClientRole.Editor,
      rank: 2,
      permissions: [createClientPermission, readClientPermission],
    });

    const userRole = await this.createRole({
      name: ClientRole.User,
      rank: 999,
      permissions: [readClientPermission],
    });

    // demo users
    const admin = await this.createUserIfNotExists({
      username: 'johndoe',
      password: 'secret',
      name: 'John Doe',
      roles: [adminRole, editorRole, userRole],
      permissions: permissions,
    });

    const editor = await this.createUserIfNotExists({
      username: 'lucywoo',
      password: 'secret',
      name: 'Lucy Woo',
      roles: [editorRole, userRole],
    });

    const user = await this.createUserIfNotExists({
      username: 'zest',
      password: 'secret',
      name: 'Zest Made',
      roles: [userRole],
    });

    const superAdmin = await this.createUserIfNotExists({
      username: 'foodco',
      password: 'secret',
      name: 'Foodco',
      roles: [userRole, editorRole, superRole, adminRole],
    });

    return {
      permissions,
      adminRole,
      editorRole,
      userRole,
      superRole,
      superAdmin,
      admin,
      editor,
      user,
    };
  }

  private async createPermissions(
    permissionNames: ClientPermission[],
  ): Promise<Permission[]> {
    const uniquePermissions = new Set(permissionNames);
    const existingPermissions = await this.permissionRepository.find({
      where: { name: In([...uniquePermissions]) },
    });

    const existingPermissionNames = new Set(existingPermissions.map(p => p.name));
    const permissionsToCreate = [...uniquePermissions].filter(name => !existingPermissionNames.has(name));

    const newPermissions = await Promise.all(
      permissionsToCreate.map(async (name) => {
        const permission = this.permissionRepository.create({ name });
        return this.permissionRepository.save(permission);
      }),
    );

    return [...existingPermissions, ...newPermissions];
  }

  private async createRole(data: {
    name: ClientRole;
    rank: number;
    permissions: Permission[];
  }) {
    const { name, rank, permissions } = data;
    
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      return existingRole;
    }

    const role = this.roleRepository.create({ name, rank });
    role.permissions = permissions;
    return await this.roleRepository.save(role);
  }

  private async createUserIfNotExists({
    username,
    password,
    name,
    roles,
    permissions,
  }: {
    username: string;
    password: string;
    name: string;
    roles?: Role[];
    permissions?: Permission[];
  }): Promise<User> {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      return existingUser;
    }

    const newUser = await this.usersService.create({
      username,
      password,
      name,
      roleName: '', // You can set this as needed or remove it if not used.
    });

    if (roles) {
      newUser.roles = roles;
    }
    
    if (permissions) {
      newUser.permissions = permissions;
    }

    newUser.accountStatus = AccountStatus.Active;
    return await this.usersService.update(newUser.id, newUser);
  }
}
