import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

import { getRepository } from "typeorm";
import { User } from "@entity/User";

import { failed, success } from "../utils/responseParser";
import * as _ from "underscore";

/************************
 * SECTION Logic for JWT Checks
 ************************/
export const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get the jwt token from the head
  const token = <string>req.headers["authorization"];
  let jwtPayload;
  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret);
    res.locals.jwtPayload = jwtPayload;
    var UserRepository = getRepository(User);
    await UserRepository.findOneOrFail({
      where: { uuid: jwtPayload.id },
      relations: ["roles", "permissions"],
    })
      .then((userData) => {
        var userPermissions: Array<string> = _.pluck(
          userData.permissions,
          "name"
        );
        var rolesPermission: Array<string> = [];
        _.map(userData.roles, (item) => {
          if (item.permissions) {
            rolesPermission = [
              ...rolesPermission,
              ..._.pluck(item.permissions, "name"),
            ];
          }
        });

        res.locals.user = {
          id: userData.uuid,
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          roles: userData.roles ? _.pluck(userData.roles, "name") : [],
          permissions: [...userPermissions, ...rolesPermission],
        };

        //The token is valid for 6 hour
        //We want to send a new token on every request
        const newToken = jwt.sign(
          {
            id: userData.uuid,
            username: userData.username,
            email: userData.email,
          },
          config.jwtSecret,
          {
            expiresIn: config.jwtTimer,
          }
        );
        res.setHeader("token", newToken);
        //Call the next middleware or controller
        return next();
      })
      .catch((err) => {
        return res.status(500).send(failed(err));
      });
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    return res.status(401).send(failed(error));
  }
};
