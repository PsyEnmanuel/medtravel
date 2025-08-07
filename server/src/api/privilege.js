import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _utility, _constant } from "../helpers/index.js";
import pool from "../databases/main.js";
import { BaseError } from "../utils/errors.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", async function (req, res, next) {
  try {
    let result = await pool.query(
      "SELECT * FROM t_privilege WHERE c_type='table'"
    );
    res.status(200).json({ items: result });
  } catch (err) {
    next(err);
  }
});

router.get("/table/:id", async function (req, res, next) {
  try {
    const tables = await _query.getTable();
    let privileges = await pool.query(
      "SELECT * FROM t_privilege WHERE c_type='table' AND c_group='role' AND c_who=? AND c_action='create'",
      [req.params.id]
    );

    const items = [];
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      let obj = {
        table: table,
        create: false,
      };
      for (let j = 0; j < privileges.length; j++) {
        const privilege = privileges[j];
        if (table.toUpperCase() === privilege.c_related_table.toUpperCase()) {
          obj.create = true;
        }
      }
      items.push(obj);
    }
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      res.status(401).json({ msg: "No esta Autorizado" });
    }
    let item = await pool.query("SELECT * FROM t_privilege WHERE id=?", [
      req.params.id,
    ]);
    res.status(200).json(item[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      return res.status(401).json({ msg: "No esta Autorizado" });
    }
    for (const item of req.body) {
      let action = item.c_action;
      delete item.action;
      item.c_type = "table";
      let [check] = await pool.query(
        `SELECT COUNT(*) AS count FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?`,
        Object.values(item)
      );
      if (check.count) {
        await pool.query(
          "DELETE FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?",
          Object.values(item)
        );
      } else if (action.toUpperCase() == "create") {
        if (!check.count) {
          await _query.insert({
            authenticate: 0,
            user: res.locals.user,
            table: "t_privilege",
            data: item,
          });
        }
      }
    }
    res.status(200).json({
      msg: "Privilegios actualizados",
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      res.status(401).json({ msg: "No esta Autorizado" });
    }
    var data = await pool.query("UPDATE t_privilege SET ? WHERE id=?", [
      req.body,
      req.params.id,
    ]);
    res.status(200).json({ msg: "Dato Actualizado" });
  } catch (err) {
    next(err);
  }
});

router.delete("/", async function (req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      res.status(401).json({ msg: "No esta Autorizado" });
    }
    req.body.c_type = "table";

    var check = await pool.query(
      "SELECT COUNT(*) AS count FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?",
      Object.values(req.body)
    );

    if (check[0].count) {
      var data = await pool.query(
        "DELETE FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?",
        Object.values(req.body)
      );
      res.status(200).json({ msg: "Dato Borrado" });
    } else {
      res.status(200).json({ msg: false });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
