import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _upload, _migration } from "../helpers/index.js";
import pool from "../databases/main.js";
import path from "path";

const router = express.Router();
const table = "t_file";

router.use(isAuthenticated);

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, total } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.file_date) {
        item.file_date = _date.intlDate(item.file_date);
      }

      if (item.file_date_range) {
        item.file_date_range = JSON.parse(item.file_date_range)
      }

      if (item.language_ids) {
        item.language_ids = JSON.parse(item.language_ids)
      }
      if (item.language) {
        item.language = JSON.parse(item.language)
      }

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

    if (item.file_date) {
      item.file_date = _date.intlDate(item.file_date);
    }

    if (item.file_date_range) {
      item.file_date_range = JSON.parse(item.file_date_range)
    }

    if (item.language_ids) {
      item.language_ids = JSON.parse(item.language_ids)
    }
    if (item.language) {
      item.language = JSON.parse(item.language)
    }

    item.created_format = _date.intlDateTime(item.created);

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.post("/", function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    _upload.uploadMultiple(req, res, async () => {
      try {
        const data = req.body;
        console.log(11, data);
        if (data._files) {
          data._files = JSON.parse(data._files);
        } else {
          data._files = []
        }


        if (data.ref_id === 'undefined') {
          data.ref_id = null
        }

        if (data.file_date) {
          data.file_date_valid = _date.convertToValidDate(data.file_date);
          data.file_date = _date.mysqlDateTime(
            _date.addCurrentTimeToDate(data.file_date_valid)
          );
        } else {
          data.file_date = null;
        }

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];

          const fileData = await _upload.uploadDestination({
            account,
            table: data.ref_key,
            id: data.ref_id,
            file,
          });

          const [cat] = await pool.query(`SELECT * FROM t_category WHERE description=? AND parent_id=?`, [data.file_type, 24])

          if (!cat) {
            return res.status(401).json({ message: `La categoría del archivo es obligatoria` });
          }
          if (data.ref_id) {

            await _query.insert({
              table,
              user,
              data: {
                ref_key: data.ref_key,
                ref_id: data.ref_id,
                $file_type_id: cat.id,
                description: data._files[i].description ? data._files[i].description : file.originalname.replace(/\.[^/.]+$/, ""),
                ...fileData,
              },
            });
          }
        }

        req.io.emit("update", {
          table: data.ref_key,
          id: data.ref_id
        });

        req.io.emit("update", {
          table,
        });

        return res.status(200).json(true);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    if (data.file_date) {
      data.file_date_valid = _date.convertToValidDate(data.file_date);
      data.file_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.file_date_valid)
      );
    } else {
      data.file_date = null;
    }

    var response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
    });

    req.io.emit("update", {
      table: data.ref_key,
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

router.post("/migration/:table", function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    _upload.uploadMultiple(req, res, async () => {
      try {
        const data = req.body;

        const file = req.files[0];

        const fileData = await _upload.uploadDestination({
          account,
          file,
        });

        const options = {
          url: path.join(fileData.destination, fileData.filename),
          insurance: data.insurance,
          insurance_id: data.insurance_id,
          policy_type: data.policy_type,
          $policy_type_id: data.$policy_type_id
        }

        const response = await _migration[req.params.table](options)

        return res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const response = await _query.update({
      user,
      id: req.params.id,
      table,
      data: { c_status: 1 },
    });

    req.io.emit("update", {
      table: data.ref_key,
      id: data.ref_id
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
