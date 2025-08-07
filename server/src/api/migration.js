import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _utility, _migration } from "../helpers/index.js";
import { format, getDaysInMonth, setDate, isEqual, setYear } from "date-fns";

const router = express.Router();
const table = "t_comment";

router.use(isAuthenticated);

router.post("/policy", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const body = req.body;

    _migration.insertPolicy(body, user)

    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});

router.post("/provider", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const body = req.body;

    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      item.code = await _query.getCode({ table: "t_provider" });

      await _query.insert({
        user,
        table: 't_provider',
        data: item,
      });

    }

    req.io.emit("update", {
      table: 't_provider',
    });

    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});

router.post("/doctor", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const body = req.body;

    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      item.code = await _query.getCode({ table: "t_doctor" });

      await _query.insert({
        user,
        table: 't_doctor',
        data: item,
      });

    }

    req.io.emit("update", {
      table: 't_doctor',
    });

    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});

export default router;
