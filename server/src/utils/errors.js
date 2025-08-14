import { _comunication } from "../helpers/index.js";
import { logger } from "./logger.js";

export class BaseError extends Error {
  constructor(name, statusCode, isOperational, message, description) {
    super(message, description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.message = message;
    this.description = description;
    Error.captureStackTrace(this);
  }
}

export function logError(err) {
  logger.error(err);
}

export function returnError(err, req, res, next) {
  const _err = JSON.stringify(err)
  const user = res?.locals?.user;
  console.log(err);
  if(process.env.NODE_ENV === 'production') {
    _comunication.postMarkErrors({
      MessageStream: "outbound",
      From: `${process.env.MAIL_USER}`,
      To: `enmanuelpsy@gmail.com`,
      Subject: `MEDTRAVEL - ERRORS ✔`, // Subject line
      HtmlBody: `<pre>Usuario: ${user?.description}, ${req?.url}, ${req?.method}</pre><br /><pre>${err.stack}</pre><br /><pre>${err}</pre><br /><pre>${_err}</pre>`,
    })
  }

  logger.error(err);
  res.status(err.statusCode || 500).json(err);
}

export function isOperationalError(error) {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
}
