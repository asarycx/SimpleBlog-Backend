import { Request, Response } from "express";
import { getRepository, Like, Not, IsNull } from "typeorm";
import { failed, success } from "@util/responseParser";

import * as _ from "underscore";

import { User } from "@entity/User";
import { Permission } from "@entity/Permission";
import { Role } from "@entity/Role";

class UserController {
  /**
   * Index
   * @param request
   * @param response
   */
  public static async Index(request: Request, response: Response) {
    try {
      // Prepare User Repository
      const UserRepository = getRepository(User);

      // Prepare the Pagination Variables
      const page = Number(request.query.page) || 1;
      const per_page = Number(request.query.per_page) || 4;
      const sort = request.query.sort == "ASC" ? "ASC" : "DESC";
      const keyword = Boolean(request.query.keyword)
        ? request.query.keyword
        : null;

      // Fetch the Data with prepared Variables
      var userData = await UserRepository.findAndCount({
        withDeleted: true,
        take: per_page,
        skip: page * per_page - per_page,
        where: [
          { firstname: keyword ? Like(`%${keyword}%`) : Not(IsNull()) },
          { lastname: keyword ? Like(`%${keyword}%`) : Not(IsNull()) },
          { email: keyword ? Like(`%${keyword}%`) : Not(IsNull()) },
          { username: keyword ? Like(`%${keyword}%`) : Not(IsNull()) },
        ],
        order: {
          id: sort,
        },
        relations: ["roles"],
      });

      // Return the result with 200
      return response.status(200).send(
        success({
          name: "SuccessFetchAllUserData",
          message: "",
          data: {
            data: userData[0],
            meta: {
              page: page,
              per_page: per_page,
              keyword: keyword,
              total_item: userData[1] || 0,
              total_page: userData[0] ? Math.ceil(userData[1] / per_page) : 0,
            },
          },
        })
      );
    } catch (e) {
      // Return Error Result
      return response.status(e.status).send(failed(e));
    }
  }
  /**
   * Detail
   * @param request
   * @param response
   */
  public static async Detail(request: Request, response: Response) {
    try {
      // Prepare User Repository &  Find the user based on UUID
      const UserRepository = getRepository(User);
      var UserDetail = await UserRepository.findOneOrFail({
        withDeleted: true,
        where: { uuid: request.params.uuid },
        relations: ["roles", "permissions"],
      })
        .then((good) => {
          // Return the result with 200
          return response.status(200).send(
            success({
              name: "SuccessFetchUserDetail",
              message: "Success",
              data: good,
            })
          );
        })
        .catch((error) => {
          // Return the result with 200
          return response.status(404).send(success(error));
        });
    } catch (error) {
      // Return Error Result
      return response.status(500).send(failed(error));
    }
  }

  /**
   * Detail
   * @param request
   * @param response
   */
  public static async Update(request: Request, response: Response) {
    try {
      // Destructure the body
      var {
        email,
        firstname,
        lastname,
        password,
        bio,
        permissions,
        roles,
      } = request.body;

      // Prepare User Repository
      const UserRepository = getRepository(User);

      // Find the user based on UUID
      var UserDetail = await UserRepository.findOne({
        where: { uuid: request.params.uuid },
        relations: ["roles", "permissions"],
      });

      // Populate with new values
      UserDetail.email = email;
      UserDetail.firstname = firstname;
      UserDetail.lastname = lastname;
      UserDetail.bio = bio;

      // If Password is Filled, update it
      if (password) {
        UserDetail.password = password;
        UserDetail.hashPassword();
      }
      // If Perms is Filled, update it
      if (permissions) {
        const PermisssionRepository = getRepository(Permission);
        var NewPermissions: Permission[] = [];
        permissions.split(",").map((item) => {
          PermisssionRepository.findOneOrFail(item).then((success) =>
            NewPermissions.push(success)
          );
        });
        UserDetail.permissions = NewPermissions;
      }
      // If Role is Filled, update it
      if (roles) {
        const RoleRepository = getRepository(Role);
        var NewRoles: Role[] = [];
        permissions.split(",").map((item) => {
          RoleRepository.findOneOrFail(item).then((success) =>
            NewRoles.push(success)
          );
        });
        UserDetail.roles = NewRoles;
      }
      // If file is uploaded, update it
      if (request.file) {
        UserDetail.profile_image = request.file.filename;
      }

      // Save the new Data
      await UserRepository.save(UserDetail);

      // Return the result with 200
      return response.status(200).send(
        success({
          name: "SuccessUpdateUser",
          message: "Success",
        })
      );
    } catch (error) {
      // Return Error Result
      return response.status(500).send(failed(error));
    }
  }

  /**
   * Delete
   * @param request
   * @param response
   */
  public static async Delete(request: Request, response: Response) {
    try {
      const UserRepository = getRepository(User);
      var WaitingList: User[] = [];
      await Promise.all(
        request.body.list.map(async (item) => {
          await UserRepository.findOneOrFail({ where: { uuid: item } }).then(
            (success) => {
              WaitingList.push(success);
            }
          );
        })
      );

      // Delete Everything
      await UserRepository.remove(WaitingList);

      // Success returns
      return response.status(200).send(
        success({
          name: "SuccessDeleteUser(s)",
          message: "User(s) successfully deleted.",
        })
      );
    } catch (error) {
      // Return Error Result
      return response.status(500).send(failed(error));
    }
  }

  /**
   * Deactivate
   * @param request R
   * @param response
   */
  public static async SoftDelete(request: Request, response: Response) {
    const UserRepository = getRepository(User);
    try {
      var WaitingList: User[] = [];
      await Promise.all(
        request.body.list.map(async (item) => {
          await UserRepository.findOneOrFail({ where: { uuid: item } }).then(
            (success) => {
              WaitingList.push(success);
            }
          );
        })
      );

      // Deactivate Everything
      await UserRepository.softRemove(WaitingList);

      // Success returns
      return response.status(200).send(
        success({
          name: "SuccessDeactivateUser(s)",
          message: "User(s) successfully deactivated.",
        })
      );
    } catch (error) {
      // Return Error Result
      return response.status(500).send(failed(error));
    }
  }

  /**
   * Restore Deleted Data
   * @param request
   * @param response
   */
  public static async Restore(request: Request, response: Response) {
    try {
      const UserRepository = getRepository(User);
      var WaitingList: User[] = [];
      await Promise.all(
        request.body.list.map(async (item) => {
          await UserRepository.findOneOrFail({
            withDeleted: true,
            where: { uuid: item },
          }).then((success) => {
            WaitingList.push(success);
          });
        })
      );

      // Delete Everything
      await UserRepository.recover(WaitingList);

      // Success returns
      return response.status(200).send(
        success({
          name: "SuccessRecoverUser(s)",
          message: "User(s) successfully recovered.",
        })
      );
    } catch (error) {
      // Return Error Result
      return response.status(500).send(failed(error));
    }
  }
}

export default UserController;
