import express from "express";

import pool from "../databases/main.js";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date } from "../helpers/index.js";
import { BaseError } from "../utils/errors.js";
const router = express.Router();

const table = "t_category";

router.get("/children", async function (req, res, next) {
  try {
    const data = req.query.data;

    const items = await pool.query(
      `SELECT id, ref, filterable FROM t_category WHERE 1 AND c_status=4 AND ref IN (?)`,
      [data]
    );

    const cats = {};

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const children = await pool.query(
        `SELECT id, description, parent_id, description as label, id as value, color FROM t_category WHERE 1 AND c_status=4 AND parent_id = ? ORDER BY description ASC`,
        [item.id]
      );
      cats[item.ref] = children;
    }

    res.status(200).json(cats);
  } catch (error) {
    next(error);
  }
});

router.use(isAuthenticated);

router.get("/list/:table/:ref", async function (req, res, next) {
  try {

    const items = await pool.query(
      `SELECT ?? AS label, ?? AS value, count(*) as quantity FROM ?? WHERE 1 group by ??`,
      [req.params.ref, `$${req.params.ref}_id`, req.params.table, req.params.ref]
    );
    return res.json(items);
  } catch (error) {
    console.log(error);
  }
})


router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const query = req.query;

    const { items, total } = await _query.getRows({
      table,
      user,
      query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.drawer = false;
      item.created_format = _date.intlDateTime(item.created);
      items[i] = item;
    }

    if (req.query.returnItems) {
      return res.status(200).json(items);
    }

    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});

router.get("/ref/:ref", async function (req, res, next) {
  try {
    const item = await _query.getCategoryByRef(req.params.ref);

    return res.status(200).json(item);
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

    item.created_format = _date.intlDateTime(item.created);

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    let level = 0;
    if (data.parent_id) {
      level = await _query.getCategoryLevel(data.parent_id);
      const [exist] = await pool.query(`SELECT * FROM t_category WHERE parent_id=? AND description=? AND c_status=4`, [data.parent_id, data.description])

      if (exist) {
        throw new BaseError(
          "NO DATA UPDATED",
          401,
          true,
          `Esta categoría ya esta agregada.`,
          `Esta categoría ya esta agregada.`
        );
      }
    }


    const response = await _query.insert({
      user,
      table,
      data: { ...data, level },
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

router.post("/child", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const { id } = await _query.getCategoryByRef(data.ref);

    const [exist] = await pool.query(`SELECT * FROM t_category WHERE parent_id=? AND description=? AND c_status=4`, [id, data.description])

    if (exist) {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `Esta categoría ya esta agregada.`,
        `Esta categoría ya esta agregada.`
      );
    }

    const response = await _query.insert({
      user,
      table,
      data: {
        description: data.description,
        level: 1,
        parent_id: id,
      },
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

    let level = 0;
    if (data.parent_id) {
      level = await _query.getCategoryLevel(data.parent_id);
    }

    var response = await _query.update({
      id: req.params.id,
      user,
      table,
      data: { ...data, level },
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

router.put("/general/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    var response = await _query.update({
      id: req.params.id,
      user,
      table,
      data: { ...data },
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

    // await _query.update_children({
    //   user,
    //   id: req.params.id,
    //   table,
    //   data: {
    //     c_status: 1,
    //   },
    // });

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

      // await _query.update_children({
      //   user,
      //   id: id,
      //   table,
      //   data: {
      //     c_status: 1,
      //   },
      // });
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
