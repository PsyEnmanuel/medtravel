import * as path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.join(path.join(path.resolve(), `.env.${process.env.NODE_ENV}`)),
});

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST,
  PORT: process.env.PORT,
};
