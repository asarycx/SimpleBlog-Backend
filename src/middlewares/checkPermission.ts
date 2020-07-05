import { Request, Response, NextFunction } from "express";
import * as _ from "underscore";

import { success, failed } from "@util/responseParser";

export const checkPermission = (permissions: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    const user = res.locals.user;
    console.log("data---------------------------", res.locals.user);

    if (!Boolean(user.permissions.length)) {
      // return 403 if user doesn't have any role
      // !!! Subject to change in the future!
      return res.status(403).send(
        failed({
          name: "InsufficientPermission",
          message: "You don't have any authorization to do this action.",
        })
      );
    } else {
      var allowed;
      // If any perms founnd then continue to the next Middleware/Controller
      _.map(permissions, (item) => {
        // console.log(item);
        if (_.contains(user.permissions, item)) {
          allowed = true;
        }
      });

      if (allowed) {
        return next();
      }

      // Return 403 if none found
      return res.status(403).send(
        failed({
          name: "InsufficientPermission",
          message: "You don't have any authorization to do this action.",
        })
      );
    }
  };
};
