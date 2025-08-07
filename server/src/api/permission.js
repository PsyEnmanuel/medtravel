import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _utility, _constant } from "../helpers/index.js";
import pool from "../databases/main.js";
import { BaseError } from "../utils/errors.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", async function (req, res, next) {
  try {
    res.status(200).json({ items: _constant.permissions });
  } catch (error) {
    next(error);
  }
});

router.get("/tables", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let roles = await _query.getRows({
      table: "t_role",
      user,
      query: {},
    });
    const tables = await _query.getSchema();

    for (let i = 0; i < roles.items.length; i++) {
      const role = roles.items[i];

      for (let j = 0; j < tables.tables_roles.length; j++) {
        const table = tables.tables_roles[j];
        table[role.label] = !!(role.value & table.value);
        tables.tables_roles[j] = table;
      }
    }

    for (const key in _constant.permissions) {
      if (Object.hasOwnProperty.call(_constant.permissions, key)) {
        const permission = _constant.permissions[key];

        for (let j = 0; j < tables.tables_unixperms.length; j++) {
          const table = tables.tables_unixperms[j];
          table[key] = !!(permission & table.value);
          tables.tables_unixperms[j] = table;
        }
      }
    }
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
});

router.get("/actions", async function (req, res, next) {
  try {
    let result = await pool.query("SELECT * FROM t_action");
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/unixperms", async function (req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      return res.status(401).json({ msg: "No esta Autorizado" });
    }

    for (const item of req.body) {
      pool.query("ALTER TABLE ?? ALTER COLUMN ?? SET DEFAULT ?", [
        item.table,
        "c_unixperms",
        item.c_unixperms,
      ]);
      pool.query("UPDATE ?? SET ??=?", [
        item.table,
        "c_unixperms",
        item.c_unixperms,
      ]);
    }

    res.status(200).json({
      msg: "Unix-permisos actualizados",
    });
  } catch (error) {
    next(error);
  }
});

router.put("/roles-permission", async function (req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      return res.status(401).json({ msg: "No esta Autorizado" });
    }

    for (const item of req.body) {
      pool.query("ALTER TABLE ?? ALTER COLUMN ?? SET DEFAULT ?", [
        item.table,
        "c_roles",
        item.c_group,
      ]);
      pool.query("UPDATE ?? SET ??=?", [item.table, "c_roles", item.c_group]);
    }

    res.status(200).json({
      msg: "Unix-permisos actualizados",
    });
  } catch (error) {
	next(error)
  }
});

router.post("/add_privileges", async function (req, res) {
  try {
    let data = req.body.data;
    for (const id of req.body.ids) {
      for (const user of data.users) {
        for (const action of data.actions) {
          let result = await pool.query(
            "SELECT * FROM t_privilege WHERE c_group='user' AND c_type='object' AND c_related_table='contacts' AND c_who=? AND c_action IN (?) AND c_related_uid = ? LIMIT 1",
            [user, action, id]
          );
          if (!result.length) {
            await pool.query(
              "INSERT t_privilege SET c_group='user', c_type='object', c_related_table='contacts', c_who=?, c_action=?, c_related_uid=?",
              [user, action, id]
            );
          }
        }
      }
    }
    res.status(200).json({ msg: "privilegios asignados" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export default router;
