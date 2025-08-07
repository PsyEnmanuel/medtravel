import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import pool from "../databases/main.js";
import { _query, _date, _utility } from "../helpers/index.js";
import { format, getDaysInMonth, setDate, isEqual, setYear } from "date-fns";
import { getFiles, getProfilePic } from "../helpers/query.js";

const router = express.Router();
const table = "t_itinerary";

router.use(isAuthenticated);

(async () => {
  try {
    const items = await pool.query(`select * from t_itinerary`);

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (row.mprocedure) {
        row.mprocedure = JSON.parse(row.mprocedure).map(item => ({
          ...item,
          id: String(item.id),
          code: String(item.code),
        }))
        if (row.mprocedure.length) {
          row.mprocedure = JSON.stringify(row.mprocedure);
          await pool.query(`update t_itinerary set mprocedure=? where id=?`, [row.mprocedure, row.id]);

        }
      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
})

async function checkIfcontactExist(user, data) {
  if (data.ident_no) {
    const { items, total, sql } = await _query.getRows({
      table,
      user,
      query: {
        where: {
          ident_no: data.ident_no,
          c_status: 4,
        },
      },
    });

    if (items.length) {
      return true;
    }
    return false;
  }
}

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, total, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
      optsServer: {
        columns: req.query?.join?.length ? `t_event.id AS id, t_event.code AS code` : '',
      },
    });

    const seen = new Set();
    const result = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.attendance_datetime && item.attendance_datetime !== '0000-00-00 00:00:00') {
        item.start = item.attendance_datetime;
        item.end = item.attendance_datetime;
        item.start_calendar = _date.formatDateTime(item.attendance_datetime);
        item.attendance_date = _date.intlDate(item.attendance_datetime);
        item.attendance_time = _date.intlTime(item.attendance_datetime);
        item.attendance_time_format = _date.extractAMPM(item.attendance_time);
        item.attendance_time = _date.intlTimeClean(item.attendance_datetime);
        item.attendance_readable = _date.intlReadbleDate(item.attendance_datetime);
        item.attendance_readabletime = _date.intlReadbleDateTime(item.attendance_datetime);
      } else {
        item.attendance_datetime = null
      }

      if (item.request_date) {
        item.request_date_format = _date.intlDate(item.request_date)
      }

      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure)
      }

      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis)
      }

      if (item.modified) {
        item.modified_format = _date.intlDateTime(item.modified);
      }
      item.created_format = _date.intlDateTime(item.created);

      if (req.query.mergeRows) {
        const date = new Date(item.attendance_datetime).toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const key = `${item.code}-${date}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }

      if (req.query.doctorDetail) {
        if (item.doctor_id) {
          item.doctor_profile_pic = await getProfilePic({ ref_key: 't_doctor', ref_id: item.doctor_id })
        }
      }

    }

    if (req.query.mergeRows) {
      return res.status(200).json(result);
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

    if (!item) {
      return res.status(200).json(false);
    }
    if (item.attendance_datetime && item.attendance_datetime !== '0000-00-00 00:00:00') {
      item.attendance_date = _date.intlDate(item.attendance_datetime);
      item.attendance_time = _date.intlTime(item.attendance_datetime);
      item.attendance_time_format = _date.extractAMPM(item.attendance_time);
      item.attendance_time = _date.intlTimeClean(item.attendance_datetime);
    } else {
      item.attendance_datetime = null
    }
    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure)
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

    data.code = await _query.getCode({ table });

    console.log(2, 'post');

    if (data.attendance_time) {
      data.attendance_time = data.attendance_time.replace(/\s?[ap]\.\sm\.$/, '').trim();
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `Es requerida la fecha en el itinerario.`,
        `Es requerida la fecha en el itinerario.`
      );
    }

    if (data.attendance_date && data.attendance_time) {
      data.attendance_datetime = _date.mergeDateAndTime(data.attendance_date, data.attendance_time, data.attendance_time_format);
    } else {
      data.attendance_datetime = null
    }

    const response = await _query.insert({
      user,
      table,
      data,
      log: true
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

    console.log(1, 'put');

    if (data.attendance_time) {
      data.attendance_time = data.attendance_time.replace(/\s?[ap]\.\sm\.$/, '').trim();
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `Es requerida la fecha en el itinerario.`,
        `Es requerida la fecha en el itinerario.`
      );
    }

    if (data.attendance_date && data.attendance_time) {
      data.attendance_datetime = _date.mergeDateAndTime(data.attendance_date, data.attendance_time, data.attendance_time_format);
    } else {
      data.attendance_datetime = null
    }

    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
      log: true
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
