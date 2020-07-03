import {
  Entity,
  ManyToMany,
  OneToMany,
  JoinTable,
  Column,
  Unique,
} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";

import { General } from "@util/EntityGeneral";
import { User } from "./User";
import { Permission } from "./Permission";

@Entity()
@Unique(["name"])
export class Role extends General {
  @Column({ type: "varchar" })
  name: string;

  @Column({ nullable: true, type: "varchar" })
  @Length(4, 128)
  description: string;

  @ManyToMany((type) => Permission, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable()
  permissions: Permission[];

  @OneToMany((type) => User, (user) => user.role, { onDelete: "SET NULL" })
  users: User[];
}
