import { Request, Response, NextFunction } from "express";

import { validationResult } from "express-validator";
import { success, failed } from "../utils/responseParser";

export const ValidateForm = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).send(
      failed({
        name: "UpdateUserValidationError",
        message: "test",
        data: errors.array(),
      })
    );
  }
  return next();
};
