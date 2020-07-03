const dotenv = require("dotenv");
dotenv.config();
if (process.env.NODE_ENV == "production") {
  module.exports = {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [process.cwd() + "/dist/entity/**/*.js"],
    migrations: [process.cwd() + "/dist/migration/**/*.js"],
    subscribers: [process.cwd() + "/dist/subscriber/**/*.js"],
    seeds: [process.cwd() + "/dist/entity/seeds/**/*.js"],
    factories: [process.cwd() + "/dist/entity/factories/**/*.js"],
    cli: {
      entitiesDir: process.cwd() + "/dist/entity/",
      migrationsDir: process.cwd() + "/dist/migration/",
      subscribersDir: process.cwd() + "/dist/subscriber/",
    },
  };
} else {
  module.exports = {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    seeds: ["/dist/entity/seeds/**/*.ts"],
    factories: ["/dist/entity/factories/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  };
}
