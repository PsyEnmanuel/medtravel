import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _utility } from "../helpers/index.js";
import { format, isValid, parseISO } from "date-fns";
import pool from "../databases/main.js";
const table = "t_poll";

router.get("/web/:id", async function (req, res, next) {
  try {
    let items = await pool.query(
      `SELECT * FROM t_poll_question WHERE 1 AND c_status<>1 AND poll_id=?`,
      [req.params.id]
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.answers = await pool.query(
        `SELECT *, description AS label FROM t_poll_answer WHERE 1 AND c_status<>1 AND poll_question_id=?`,
        [item.id]
      );
    }
    if (items) {
      res.status(200).json(items);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/web/:id", async function (req, res, next) {
  try {
    var response;
    const data = req.body;

    const questions = req.body.questions;
    for (const key in questions) {
      if (Object.hasOwnProperty.call(questions, key)) {
        const question = questions[key];
        response = await _query.insert({
          auth: 0,
          msgTitle: "Encuesta Enviada 🙌",
          msg: "¡Gracias por ayudarnos a mejorar!",
          table: "t_poll_result",
          data: {
            poll_id: data.poll_id,
            poll_description: data.poll_description,
            contact_id: data.contact_id,
            contact_description: data.contact_description,
            user_id: data.user_id,
            user_description: data.user_description,
            health_professional: data.health_professional,
            product_ids: data.product_ids,
            product: data.product,
            event_id: data.event_id,
            event_code: data.event_code,
            event_start: format(
              new Date(data.event_start),
              "yyyy-MM-dd HH:mm:ss"
            ),
            poll_question_id: key,
            poll_answer_id: question.answer_id,
            poll_answer_value: question.value,
            poll_answer_description: question.answer_description,
            poll_question_description: question.description,
            account_id: 1,
            result_date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
        });
      }
    }
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});

router.use(isAuthenticated);

router.get("/stats/:key/:id", async function (req, res, next) {
  try {

    let items = await pool.query(
      `SELECT poll_answer_value, poll_question_id, poll_question_description, poll_answer_description, poll_answer_id, COUNT(poll_answer_id)AS count FROM t_poll_result WHERE poll_id=1 AND ??=? GROUP BY poll_answer_id`,
      [req.params.key, req.params.id]
    );

    let questions = await pool.query(
      `SELECT id, description, $poll_type_id FROM t_poll_question WHERE poll_id=1`
    );

    let data = {};
    let average = items.reduce((total, curr) => {
      total[curr.poll_answer_value] = 0;
      return total;
    }, {});

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (question.$poll_type_id === 280) {
        data[question.id] = {
          description: question.description,
          answers: {},
        };

        question.answers = await pool.query(
          `SELECT * FROM t_poll_answer WHERE 1 AND c_status<>1 AND poll_question_id=?`,
          [question.id]
        );

        data[question.id].answers = question.answers.reduce((total, acc) => {
          total[acc.id] = {
            description: acc.description,
            count: 0,
          };
          return total;
        }, {});
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (data[item.poll_question_id]) {
        if (data[item.poll_question_id].answers[item.poll_answer_id]) {
          data[item.poll_question_id].answers[item.poll_answer_id].count =
            item.count;
        }

        if (data[item.poll_answer_value]) {
          average[item.poll_answer_value] += 1;
        }
      }
    }


    res.status(200).json({ list: data, average });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async function (req, res, next) {
  try {
    let items = await pool.query(
      `SELECT poll_question_id, poll_question_description, poll_answer_description, poll_answer_id, COUNT(poll_answer_id)AS count FROM t_poll_result WHERE poll_id=1 GROUP BY poll_answer_id`
    );

    let questions = await pool.query(
      `SELECT id, description, $poll_type_id FROM t_poll_question WHERE poll_id=1`
    );

    let data = {};
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.$poll_type_id === 280) {

        data[question.id] = {
          description: question.description,
          answers: {},
        };

        question.answers = await pool.query(
          `SELECT * FROM t_poll_answer WHERE 1 AND c_status<>1 AND poll_question_id=?`,
          [question.id]
        );

        data[question.id].answers = question.answers.reduce((total, acc) => {
          total[acc.id] = {
            description: acc.description,
            count: 0,
          };
          return total;
        }, {});
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (data[item.poll_question_id]) {
        if (data[item.poll_question_id].answers[item.poll_answer_id]) {
          data[item.poll_question_id].answers[item.poll_answer_id].count =
            item.count;
        }
      }
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    let { items, total, sql, sql_total, columns } = await _query.getRows({
      table,
      user,
      account,
      query: req.query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.created) {
        item.created_format = format(
          new Date(item.created),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      if (item.modified) {
        item.modified_format = format(
          new Date(item.modified),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      if (item.result_date) {
        item.result_date_format = format(new Date(), "dd/MM/yyyy");
      }

      items[i] = item;
    }

    res.status(200).send({ items, total, sql, sql_total, columns });
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

    if (item.created) {
      item.created_format = format(
        new Date(item.created),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item.modified) {
      item.modified_format = format(
        new Date(item.modified),
        "dd/MM/yyyy hh:mm aa"
      );
    }

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
      msg: "Servicio Agregado Exitosamente",
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
      msg: "Servicio Actualizado Exitosamente",
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
      msg: "Servicio Borrado",
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

router.delete("/", async function (req, res) {
  try {
    const user = res.locals.user;
    let response;
    const ids = req.body;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response = await _query.update({
        msg: "Servicios borradas",
        user,
        id,
        table,
        data: { c_status: 1 },
      });
    }

    req.io.emit("poll", {
      type: 4,
      user_id: user.id,
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
