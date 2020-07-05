import { Request, Response, response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";

import { failed, success } from "../utils/responseParser";
import * as _ from "underscore";

import { User } from "@entity/User";
import config from "@config/config";

class AuthController {
  /**
   * SECTION Login Logic
   * @param req
   * @param res
   */
  static async Login(req: Request, res: Response) {
    // Check if userName and password are set
    try {
      let { email, password } = req.body;
      console.log(req.body);
      if (!(email && password)) {
        return res.status(400).send(
          failed({
            name: "LoginErrorEmpty",
            message: "Username & Password needed!",
          })
        );
      }

      // Get user from database
      const userRepository = getRepository(User);
      let user: User;

      try {
        user = await userRepository.findOneOrFail({
          where: { email },
        });
      } catch (error) {
        return res.status(401).send(failed(error));
      }

      // Check if encrypted password match
      if (!user.checkIfUnencryptedPasswordIsValid(password)) {
        return res.status(401).send(
          failed({
            name: "WrongPassword",
            message: "Password does not match!",
          })
        );
      }

      //SECTION Sign JWT, valid for 1 hour
      const token = jwt.sign(
        { id: user.uuid, username: user.username, email: user.email },
        config.jwtSecret,
        {
          expiresIn: config.jwtTimer,
        }
      );

      //Send the jwt in the response
      return res.status(200).send(
        success({
          name: "Login",
          message: "Successfully Logged In",
          data: {
            fullname: `${user.firstname} ${user.lastname}`,
            pic: user.getUserImage(),
            email: `${user.email}`,
            token: token,
          },
        })
      );
    } catch (error) {
      return res.send(failed(error));
    }
  }

  /**
   * Get User Information
   * @param req
   * @param res
   */
  static async getSelfInformation(req: Request, res: Response) {
    try {
      // Find the user based on the UUID
      var UserRepository = getRepository(User);
      var userData = await UserRepository.findOne({
        where: { uuid: res.locals.user.id },
        relations: ["roles", "permissions"],
      });

      // Return the result
      return res.status(200).send(
        success({
          name: "Success",
          message: "SuccessFetchInformation",
          data: {
            fullname: `${userData.firstname} ${userData.lastname}`,
            pic: userData.getUserImage(),
            email: `${userData.email}`,
            roles: userData.roles,
            permissions: userData.permissions,
          },
        })
      );
    } catch (error) {
      return res.send(failed(error));
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {}

  static async changePasswordFromResetRequest(req: Request, res: Response) {}
}
export default AuthController;
