import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

import { success, failed } from "@util/responseParser";

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get the user ID from previous midleware
    const id = res.locals.jwtPayload.userId;

    // Get user role from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(403).send(failed(error));
    }

    // Check if array of authorized roles includes the user's role
    if (!user.role)
      res.status(403).send(
        failed({
          name: "RoleInsufficient",
          message: "You don't have any authorization to do this action.",
        })
      );

    if (roles.indexOf(user.role.name) > -1) next();
    else
      res.status(403).send(
        failed({
          name: "RoleInsufficient",
          message: "You don't have any authorization to do this action.",
        })
      );
  };
};
