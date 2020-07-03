import { getRepository } from "typeorm";
import * as faker from "faker";
import * as _ from "underscore";

import { User } from "@entity/User";
import { Role } from "@entity/Role";

const gender = faker.random.number(1);

export default async function generateUser(count: number = 1) {
  const UserRepository = getRepository(User);
  const RoleRepository = getRepository(Role);
  var generatedUsers: User[] = [];
  var findAllRole = await RoleRepository.find();

  for (let index = 0; index < count; index++) {
    const user = new User();
    user.username = faker.internet.userName();
    user.firstname = faker.name.firstName(gender);
    user.lastname = faker.name.lastName(gender);
    user.email = faker.internet.email();
    user.password = faker.random.word();
    user.hashPassword();
    user.role = _.sample(findAllRole);
    generatedUsers.push(user);
  }

  await UserRepository.save(generatedUsers);
}
