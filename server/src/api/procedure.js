import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date } from "../helpers/index.js";
import pool from "../databases/main.js";

const router = express.Router();
const table = "t_procedure";

router.use(isAuthenticated);

router.get("/user", async function (req, res, next) {
  try {

    const items = await pool.query("SELECT procedure, procedure_ids  FROM t_patient WHERE 1 AND`c_status` = 4 AND (`procedure` IS NOT NULL OR `procedure` != '[]') ORDER BY created ASC")

    const procedureList = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.procedure) continue;
      item.procedure = JSON.parse(item.procedure)
      item.procedure_ids = JSON.parse(item.procedure_ids)

      if (item.procedure.length) {
        for (let i = 0; i < item.procedure.length; i++) {
          const row = item.procedure[i];
          const index = procedureList.findIndex(i => i.id === row.id)
          if (index === -1) {
            procedureList.push({
              id: row.id,
              code: row.code,
              description: row.description,
              quantity: 1
            })
          } else {
            ++procedureList[index].quantity
          }
        }
      }
    }
    res.status(200).send(procedureList);
  } catch (error) {
    next(error);
  }
})

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, total } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    if (req.query.returnItems) {
      return res.status(200).json(items);
    }

    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;

    const item = await _query.getRowById({
      id: req.params.id,
      table,
      user,
    });

    if(_date.isValidDate(item.created)) {
      item.created_format = _date.intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = _date.intlDateTime(item.modified);
    }

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const response = await _query.insert({
      user,
      table,
      data,
    });

    req.io.emit("update", {
      table,
    });

    if (response) {
      return res.status(200).json(response);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    var response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
    });

    req.io.emit("update", {
      table,
    });

    if (response) {
      res.status(200).json(response);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.delete("/:id", async function (req, res) {
  try {
    let user = res.locals.user;

    let response = await _query.update({
      user,
      id: req.params.id,
      table,
      data: { c_status: 1 },
    });

    req.io.emit("update", {
      table,
    });

    if (response) {
      res.status(200).json(response);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.delete("/", async function (req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      response = await _query.update({
        user,
        id: id,
        table,
        data: { c_status: 1 },
      });
    }

    req.io.emit("update", {
      table,
    });

    if (response) {
      res.status(200).json(response);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

export default router;
