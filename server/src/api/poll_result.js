import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _utility } from "../helpers/index.js";
import { format, isValid, parseISO } from "date-fns";
const table = "t_poll_result";

router.use(isAuthenticated);

router.get("/", async function (req, res, next) {
  try {

    const user = res.locals.user;
    const account = res.locals.account;

    let { items, total, sql, sql_total, columns } = await _query.getRows({
      table,
      user,
      account,
      query: req.query,
      columns: req.query.columns || ["*"]
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      item.product = JSON.parse(item.product)
      item.event_start_format = format(
        new Date(item.event_start),
        "dd/MM/yyyy"
      );
      if (item.result_date) {
        item.result_date_format = format(
          new Date(item.result_date),
          "dd/MM/yyyy hh:mm:ss"
        );
      }
      if (item.event_start) {
        item.event_start_format = format(
          new Date(item.event_start),
          "dd/MM/yyyy hh:mm:ss"
        );
      }

      items[i] = item;
    }

    if (req.query.returnItems) {
      return res.status(200).json(items);
    }

    res.status(200).send({ items, total });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let item = await _query.getRowById({
      id: req.params.id,
      table,
      user,
      query: req.query,
      extra: {
        withFiles: true,
      },
    });

    if (item) {
      res.status(200).json(item);
    } else {
      res.status(401).send({ msg: "No esta autorizado" });
    }
  } catch (err) {
    next({
      ...err,
      msg: "Error en la busqueda, intentar mas tarde.",
    });
  }
});

router.post("/", async function (req, res, next) {
  try {
    const user = res.locals.user;

    var response = await _query.insert({
      msg: "Pregunta Agregado Exitosamente",
      user,
      table,
      data: req.body,
    });

    req.io.emit("poll", {
      type: 2,
      user_id: user.id,
    });

    if (response) {
      res.status(200).json(response);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;
    var response = await _query.update({
      msg: "Pregunta Actualizado Exitosamente",
      user,
      id: req.params.id,
      table,
      data: req.body,
    });

    req.io.emit("poll", {
      type: 3,
      user_id: user.id,
    });

    if (response) {
      res.status(200).json(response);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    var response = await _query.update({
      msg: "Pregunta Borrado",
      user,
      id: req.params.id,
      table,
      data: {
        c_status: 1,
      },
    });

    req.io.emit("poll", {
      type: 4,
      user_id: user.id,
    });

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

export default router;
