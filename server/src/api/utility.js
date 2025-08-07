import express from "express";

import pool from "../databases/main.js";
import pool_utility from "../databases/global.js";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date } from "../helpers/index.js";
import { BaseError } from "../utils/errors.js";

const router = express.Router();


router.post("/log-close", async (req, res, next) => {
  try {
    const data = req.body;

    await pool.query(`UPDATE t_event SET blocked=0, blocked_by_id = null WHERE id=? AND blocked_by_id=?`, [data.id, data.blocked_by_id])

    return res.json(1)
  } catch (error) {
    console.log(error);
  }
})

router.use(isAuthenticated);

router.get("/cedulados/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;

    let [cedulado] = await pool_utility.query(
      `SELECT * FROM t_cedulados WHERE Cedula=? LIMIT 1`,
      [req.params.id]
    );

    let [insured] = await pool.query(
      `SELECT * FROM t_insured WHERE ident_no=? AND c_status = 4 LIMIT 1`,
      [req.params.id]
    );

    if (cedulado) {
      return res.json({
        insured: insured,
        ident_no: req.params.id,
        birthdate: _date.intlDate(new Date(cedulado.FechaNacimiento)),
        $sex_id:
          cedulado.IdSexo === "M" ? 5 : cedulado.IdSexo === "F" ? 6 : null,
        description: `${cedulado.Nombres} ${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""
          }`,
        fullname: `${cedulado.Nombres} ${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""
          }`,
        firstname: `${cedulado.Nombres}`,
        lastname: `${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`,
      });
    }

    if (insured) {
      return res.json({
        insured: insured,
        ident_no: req.params.id,
        birthdate: insured.birthdate,
        $sex_id: insured.$sex_id,
        description: insured.description,
        fullname: insured.fullname,
        firstname: insured.firstname,
        lastname: insured.lastname,
      });
    }

    throw new BaseError(
      "NO DATA UPDATED",
      404,
      true,
      `User ${user.description} couldn't find ident_no ${req.params.id}.`,
      `Cédula ${req.params.id} no encontrada`
    );
  } catch (err) {
    next(err);
  }
});

router.get("/rnc", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total, sql, sql_total, columns } =
      await _query.getRowsUtils({
        table: "t_rnc",
        user,
        query: req.query,
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.rnc = item.rnc.replace(/(\d)(\d{2})(\d{5})(\d)/g, "$1-$2-$3-$4");
      item.label = `(${item.rnc}), ${item.registered_name}`;
      items[i] = item;
    }
    res.status(200).send({ items, total, sql, sql_total, columns });
  } catch (err) {
    next(err);
  }
});

router.get("/countries", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total, sql } =
      await _query.getRowsUtils({
        auth: 0,
        table: "countries",
        user,
        query: req.query,
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.translations = JSON.parse(item.translations)
      if (item.translations.es) {
        item.description = item.translations.es
      } else {
        item.description = item.name
      }
    }

    if (req.query.returnItems) {
      return res.status(200).json(items);
    }

    res.status(200).send({ items, total });
  } catch (err) {
    next(err);
  }
});

router.get("/countries/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;

    let { items, total } =
      await _query.getRowsUtils({
        auth: 0,
        table: "countries",
        user,
        query: {
          where: {
            id: req.params.id
          }
        },
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.translations = JSON.parse(item.translations)
      if (item.translations.es) {
        item.description = item.translations.es
      } else {
        item.description = item.name
      }
    }

    res.status(200).send(items[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/cities", async (req, res, next) => {
  try {
    const user = res.locals.user;

    let { items, total, sql } =
      await _query.getRowsUtils({
        auth: 0,
        table: "cities",
        user,
        query: req.query,
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name
    }

    if (req.query.returnItems) {
      return res.status(200).json(items);
    }

    res.status(200).send({ items, total });
  } catch (err) {
    next(err);
  }
});

router.get("/cities/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items } =
      await _query.getRowsUtils({
        auth: 0,
        table: "cities",
        user,
        query: {
          where: {
            id: req.params.id
          }
        },
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name
    }

    res.status(200).send(items[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/states", async (req, res, next) => {
  try {
    const user = res.locals.user;

    let { items, total, sql } =
      await _query.getRowsUtils({
        auth: 0,
        table: "states",
        user,
        query: req.query,
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name
    }

    if (req.query.returnItems) {
      return res.status(200).json(items);
    }

    res.status(200).send({ items, total });
  } catch (err) {
    next(err);
  }
});

router.get("/states/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items } =
      await _query.getRowsUtils({
        auth: 0,
        table: "states",
        user,
        query: {
          where: {
            id: req.params.id
          }
        },
      });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name
    }

    res.status(200).send(items[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/cie10", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let items = await _query.getRowsUtils({
      table: "t_cie10",
      user,
      query: req.query,
    });
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
});

export default router;
