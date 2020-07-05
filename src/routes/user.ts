import { Router } from "express";
import UserController from "@controllers/UserController";
import { checkJwt } from "@middlewares/checkJWT";
import { checkPermission } from "@middlewares/checkPermission";
import { ValidateForm } from "@middlewares/ValidateForm";

// For Form Validation
import { check } from "express-validator";

// For File Uploads
import * as multer from "multer";
import * as path from "path";
import * as slugify from "@sindresorhus/slugify";
import * as fs from "fs";

// Params for File Upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./public/image/${slugify(req.body.uuid, {
      separator: "_",
    })}/`;
    fs.exists(dir, (exist) => {
      if (!exist) {
        return fs.mkdir(dir, (error) => cb(error, dir));
      }
      cb(null, dir);
    });
  },
  filename: function (req, file, cb) {
    cb(
      null,
      slugify(new Date().getTime() + file.originalname) +
        path.extname(file.originalname)
    );
  },
});

const processFile = multer({ storage: storage });
const router = Router();

// Get all users
router.get(
  "/",
  [checkJwt, checkPermission(["read_user"])],
  UserController.Index
);

// Get One Specific User
router.get(
  "/:uuid",
  [checkJwt, checkPermission(["read_user"])],
  UserController.Detail
);

router.delete(
  "/",
  [checkJwt, checkPermission(["delete_user"])],
  UserController.Delete
);

router.delete(
  "/soft",
  [checkJwt, checkPermission(["delete_user"])],
  UserController.SoftDelete
);

router.patch(
  "/recover",
  [checkJwt, checkPermission(["delete_user"])],
  UserController.Restore
);

// Get One Specific User
router.put(
  "/:uuid",
  [
    checkJwt,
    processFile.single("profile_image"),
    check("email").isEmail().notEmpty(),
    check("firstname").isString().isLength({ min: 1, max: 32 }).notEmpty(),
    check("lastname").isString().isLength({ min: 1, max: 32 }).notEmpty(),
    check("password").isString().isLength({ min: 8, max: 32 }).notEmpty(),
    check("bio").isString().isLength({ min: 0, max: 255 }),
    ValidateForm,
    // upload.none(),
    checkPermission(["read_user"]),
  ],
  UserController.Update
);

export default router;
