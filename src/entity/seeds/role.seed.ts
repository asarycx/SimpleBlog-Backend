import * as faker from "faker";
import { getRepository } from "typeorm";
import { Role } from "@entity/Role";
import { Permission } from "@entity/Permission";

export default async function generateRoles() {
  const RoleRepository = getRepository(Role);
  const PermissionRepository = getRepository(Permission);
  var generatedRoles: Role[] = [];

  // Admin Seed
  const admin = new Role();
  admin.name = "Admin";
  admin.description = faker.random.words(5);
  admin.permissions = await PermissionRepository.find();
  generatedRoles.push(admin);

  // Moderator Seed
  const mod = new Role();
  mod.name = "Moderator";
  mod.description = faker.random.words(5);
  generatedRoles.push(mod);

  // Poster Seed
  const member = new Role();
  member.name = "Member";
  member.description = faker.random.words(5);
  generatedRoles.push(member);

  await RoleRepository.save(generatedRoles);
}
