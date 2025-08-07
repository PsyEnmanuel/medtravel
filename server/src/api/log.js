import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _utility } from "../helpers/index.js";
import { format, getDaysInMonth, setDate, isEqual, setYear } from "date-fns";

const router = express.Router();
const table = "t_log";

router.use(isAuthenticated);

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, total, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.data) {
        item.data = JSON.parse(item.data)
      }

      if (item.modified) {
        item.modified_format = _date.intlDateTime(item.modified);
      }
      item.created_format = _date.intlDateTime(item.created);
    }

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

    if (item.data) {
      item.data = JSON.parse(item.data)
    }

    if (item.modified) {
      item.modified_format = _date.intlDateTime(item.modified);
    }
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

    if (data.birthdate) {
      data.birthdate = _date.mysqlDateTime(
        _date.convertToValidDate(data.birthdate)
      );
    } else {
      data.birthdate = null
    }

    data.code = await _query.getCode({ table });

    const response = await _query.insert({
      user,
      table,
      data,
    });

    req.io.emit("update", {
      table,
      item: data,
      id: response.id
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

    if (data.birthdate) {
      data.birthdate = _date.mysqlDateTime(
        _date.convertToValidDate(data.birthdate)
      );
    } else {
      data.birthdate = null
    }

    if (data.last_event) {
      data.last_event = _date.mysqlDateTime(new Date(data.last_event));
    }
    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
    });

    req.io.emit("update", {
      table,
      item: data,
      id: response.id
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

      const { items: events } = await _query.getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id,
          },
        },
      });

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await _query.update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null },
        });
      }
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
