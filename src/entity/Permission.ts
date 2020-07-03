import { Entity, ManyToMany, Column, Unique } from "typeorm";
import { Length } from "class-validator";

import { General } from "@util/EntityGeneral";
import { Role } from "./Role";
import { User } from "./User";

@Entity()
// @Unique(["name"])
export class Permission extends General {
  @Column()
  name: string;

  @Column({ nullable: true })
  @Length(4, 128)
  description: string;

  @ManyToMany((type) => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany((type) => User, (user) => user.permissions)
  users: User[];
}
