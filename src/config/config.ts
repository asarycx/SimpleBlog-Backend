const dotenv = require("dotenv");
dotenv.config();
export default {
  jwtSecret: process.env.JWT_TOKEN,
};
