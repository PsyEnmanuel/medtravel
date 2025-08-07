import jwt from "jsonwebtoken";
import pool from "../databases/main.js";
import { BaseError } from "../utils/errors.js";

export async function isAuthenticated(req, res, next) {
  try {
    var token = req.headers.authorization;

    if (!token) {
      throw new BaseError("UNAUTHORIZED", 401, true, "invalid token provided");
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const [user] = await pool.query(
      "SELECT id, account_id, description, email, ident_no, high_profile, unixroles, roles, c_status, exequatur FROM t_user WHERE t_user.id=?",
      [decoded.id]
    );

    if (!user) {
      throw new BaseError("NOT FOUND", 404, true, "usuario no existe");
    }

    if (!(user.c_status & 4)) {
      throw new BaseError("UNAUTHORIZED", 404, true, "usuario removido");
    }

    const [account] = await pool.query(
      "SELECT * FROM t_account WHERE t_account.id=?",
      [user.account_id]
    );

    res.locals.token = token;
    res.locals.user = user;
    res.locals.account = account;

    return next();
  } catch (error) {
    return next(error);
  }
}

export function isAuthFiles(req, res, next) {
  // Replace this logic with real auth (e.g., session, token, etc.)
  const user = req.user || req.session?.user;
  if (user && user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access denied");
  }
}


export function sameOriginMiddleware(req, res, next) {
  if (process.env.NODE_ENV === "development") {
    return next();
  }
  const referer = req.get("referer") || "";
  const origin = req.get("origin") || "";

  if (referer.startsWith(process.env.DOMAIN) || origin.startsWith(process.env.DOMAIN)) {
    return next();
  }

  return res.status(403).send("Forbidden: Request did not come from the same origin");
}