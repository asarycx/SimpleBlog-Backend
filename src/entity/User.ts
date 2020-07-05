import {
  Entity,
  Column,
  Unique,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";

import { Length, IsEmail } from "class-validator";
import * as bcrypt from "bcryptjs";

import { General } from "@util/EntityGeneral";
import { Role } from "./Role";
import { Permission } from "./Permission";

@Entity()
@Unique(["username", "email"])
export class User extends General {
  @Column({ type: "varchar" })
  @Length(0, 128)
  username: string;

  @Column({ nullable: true, type: "varchar" })
  @Length(0, 128)
  firstname?: string;

  @Column({ nullable: true, type: "varchar" })
  @Length(0, 128)
  lastname?: string;

  @Column({ type: "varchar" })
  @IsEmail()
  email: string;

  @Column({ type: "varchar" })
  @Length(0, 128)
  password?: string;

  @Column({ nullable: true, type: "varchar" })
  @Length(0, 255)
  bio?: string;

  @Column({ nullable: true })
  reset_token?: string;

  @Column({ nullable: true, type: "text" })
  profile_image?: string;

  @ManyToMany((type) => Role, { eager: false })
  @JoinTable()
  roles?: Role[];

  @ManyToMany((type) => Permission, { eager: true })
  @JoinTable()
  permissions?: Permission[];

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  hashPassword() {
    if (this.password) {
      this.password = bcrypt.hashSync(this.password, 8);
    }
  }

  getUserImage() {
    return `${process.env.BASE_URL}/${this.uuid}/${this.profile_image}`;
  }
}
