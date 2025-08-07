import { createLogger, format, transports } from "winston";
import { isDevEnvironment } from "../helpers/utility.js";
import morgan from "morgan";
import {
  gray,
  red,
  yellow,
  green,
  cyan,
  cyanBright,
  yellowBright,
  greenBright,
  redBright,
} from "colorette";

const myFormat = format.printf(({ level, message, timestamp }) => {
  return `${gray(timestamp)} ${level}: ${message}`;
});

const prodTransport = new transports.File({
  filename: "logs/error.log",
  level: "error",
});

const transport = new transports.Console();

export const logger = createLogger({
  level: isDevEnvironment() ? "trace" : "error",
  format: isDevEnvironment()
    ? format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        myFormat
      )
    : format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
  transports: [isDevEnvironment() ? transport : prodTransport],
});

export const httpLogger = morgan(function (tokens, req, res) {
  const status = (
    typeof res.headersSent !== "boolean" ? Boolean(res.header) : res.headersSent
  )
    ? res.statusCode
    : 0;

  const color =
    status >= 500
      ? redBright(status)
      : status >= 400
      ? cyanBright(status)
      : status >= 300
      ? yellowBright(status)
      : status >= 200
      ? greenBright(status)
      : 0;

  const method =
    req.method === "GET"
      ? green(req.method)
      : req.method === "POST"
      ? cyan(req.method)
      : req.method === "PUT"
      ? yellow(req.method)
      : req.method === "DELETE"
      ? red(req.method)
      : 0;

  return [
    `${gray(tokens.date(req, res, "clf") || 0)}`,
    `${color}`,
    `${method}`,
    `${tokens.url(req, res)}`,
    `${gray(tokens["response-time"](req, res) || 0)}`,
  ].join(" ");
});
