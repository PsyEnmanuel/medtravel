import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _utility } from "../helpers/index.js";
import { format, getDaysInMonth, setDate, isEqual, setYear } from "date-fns";
import pool from "../databases/main.js";

const router = express.Router();
const table = "t_provider";


// (async function () {
//   try {
//     const items = await pool2.query(`select * from t_provider`);

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       await pool.query(`update t_provider set webpage=?, link_gps=? where id=?`, [item.webpage, item.link_gps, item.id]);

//     }

//     console.log('complete 1');
//   } catch (error) {
//     console.log(error);
//   }
// })();

// (async function () {
//   try {
//     const items = await pool2.query(`select * from t_doctor`);

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       await pool.query(`update t_doctor set linkedin=?, instagram=? where id=?`, [item.linkedin, item.instagram, item.id]);

//     }

//     console.log('complete 2');
//   } catch (error) {
//     console.log(error);
//   }
// })();

// (async function () {
//   try {
//     const items = await pool2.query(`select * from t_contact`);

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];

//       await pool.query(`update t_contact set linkedin=?, instagram=? where id=?`, [item.linkedin, item.instagram, item.id]);

//     }

//     console.log('complete 3');
//   } catch (error) {
//     console.log(error);
//   }
// })();

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

    if (item.birthdate && _date.isValidDate(item.birthdate)) {
      item.age = _date.calculateReadableAge(item.birthdate);
      item.birthday = _date.isBirthday(item.birthdate);
      item.birthdate = _date.intlDate(item.birthdate);
    }

    if (item.insurances) {
      item.insurances = JSON.parse(item.insurances);
    } else {
      item.insurances = [];
    }

    item.files = await _query.getFiles({
      ref_id: item.id,
      ref_key: table,
    });

    if (item.files) {
      item.profile = item.files.filter(i => {
        if (i.file_type === 'FOTO PERFIL') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");
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
