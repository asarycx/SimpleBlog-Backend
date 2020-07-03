import "reflect-metadata";
import "module-alias/register";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";
import * as dotenv from "dotenv";

// Connects to the Database -> then starts the expressinstance
const app = express();
dotenv.config();

createConnection()
  .then(async (connection) => {
    // CORS Settings
    let corsOptions = {
      origin: process.env.ORIGIN,
      credentials: true,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    };

    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(express.static("public"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Set all routes from routes folder
    app.use("/api/", routes);

    app.listen(process.env.APP_PORT, () => {
      console.log(
        process.env.NODE_ENV +
          ` : Server started on port ${process.env.APP_PORT}!`
      );
    });
  })
  .catch((error) => console.log(error));
