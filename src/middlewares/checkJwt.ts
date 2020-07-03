import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

import { failed, success } from "@util/responseParser";

/************************
 * SECTION Logic for JWT Checks
 ************************/
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Get the jwt token from the head
  const token = req.headers.authorization as string;
  let jwtPayload;

  // Try to validate the token and get data
  try {
    jwtPayload = (jwt.verify(token, config.jwtSecret) as any);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    // If token is not valid, respond with 401 (unauthorized)
    res.status(401).send(failed(error));
    return;
  }
  // The token is valid for 1 hour
  // We want to send a new token on every request
  const { userId, userName } = jwtPayload;
  const newToken = jwt.sign({ userId, userName }, config.jwtSecret, {
    expiresIn: "6h",
  });
  res.setHeader("token", newToken);
  // Call the next middleware or controller
  next();
};
