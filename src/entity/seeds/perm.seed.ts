import { getRepository } from "typeorm";
import * as _ from "underscore";
import * as faker from "faker";

import { Permission } from "@entity/Permission";

export default async function generateUser(count: number = 1) {
  const PermissionRepository = getRepository(Permission);

  // Generic Permission List
  const Pages = ["post", "user", "role"];
  var generatedPermissions = [];

  _.map(Pages, (item) => {
    generatedPermissions.push({
      name: `create_${item}`,
      description: faker.random.words(5),
    });
    generatedPermissions.push({
      name: `read_${item}`,
      description: faker.random.words(5),
    });
    generatedPermissions.push({
      name: `update_${item}`,
      description: faker.random.words(5),
    });
    generatedPermissions.push({
      name: `delete_${item}`,
      description: faker.random.words(5),
    });
  });

  // Special Permissions
  generatedPermissions.push({
    name: `comment_on_post`,
    description: faker.random.words(5),
  });
  generatedPermissions.push({
    name: `pin_a_post`,
    description: faker.random.words(5),
  });
  generatedPermissions.push({
    name: `pin_a_comment`,
    description: faker.random.words(5),
  });

  await PermissionRepository.save(generatedPermissions);
}
