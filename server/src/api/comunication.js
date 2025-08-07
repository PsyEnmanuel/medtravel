import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _comunication } from "../helpers/index.js";
import crypto from "crypto";
import { format } from "date-fns";
import pool from "../databases/main.js";

const router = express.Router();

router.post("/notification", async function (req, res, next) {
  try {
    const data = req.body;

    req.io.emit("update", data);
    return res.status(200).json(true);
  } catch (error) {
    console.log(error);
  }
});

router.get("/poll/decrypt", async function (req, res, next) {
  try {
    const data = req.query;

    let [result] = await pool.query(
      `SELECT * FROM t_token WHERE token=? LIMIT 1`,
      [data.token]
    );

    let response = JSON.parse(result.data);

    return res.status(200).json({
      contact_id: response.contact_id,
      contact_description: response.contact_description,
      user_id: response.user_id,
      user_description: response.user_description,
      event_id: response.id,
      event_code: response.code,
      event_start: response.start,
    });

  } catch (err) {
    next(err);
  }
});

router.use(isAuthenticated);

router.post("/poll", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;

    var buf = await crypto.randomBytes(20);
    var token = buf.toString("hex");

    _query.insert({
      user,
      table: "t_token",
      data: {
        token,
        data: JSON.stringify(data),
      },
    });

    await _comunication.postMarkTemplate({
      MessageStream: "outbound",
      TemplateId: '38835344',
      From: `${process.env.MAIL_USER}`,
      To: `Enmanuel Martínez <enmanuelpsy@gmail.com>`,
      // To: `${data.contact_description} <${data.contact_email}>`,
      ReplyTo: `${account.email}`,
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        url: `${process.env.DOMAIN}/encuesta-de-calidad?token=${token}`,
        created_by: user.description,
        date: format(new Date(), "dd-MM-yyyy"),
        logo_url: `${process.env.DOMAIN_HOST}/images/logoText.png`
      }
    });

    // _query.update({
    //   log: false,
    //   user,
    //   id: data.id,
    //   table: "t_event",
    //   data: {
    //     sent: 1,
    //   },
    // });

    req.io.emit("event", {
      type: 3,
      user_id: user.id,
    });

    if (user.unixroles & 3) {
      return res.status(200).json({
        msg: "Mensaje Enviado",
      });
    }
    return res.status(200).json(true);
  } catch (err) {
    next(err);
  }
});

router.post("/task", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;

    const response = await _comunication.postMarkTemplate({
      MessageStream: "outbound",
      From: `MEDTRAVEL <${process.env.MAIL_USER}>`,
      To: [data.email].join(","),
      TemplateId: "40114557",
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        data: data,
        url: `${process.env.DOMAIN_HOST}`,
        logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`,
      },
      ReplyTo: `${account.email}`,
    });

    await pool.query(
      `UPDATE t_task SET sent=1 WHERE id=? LIMIT 1`,
      [data.id]
    );

    req.io.emit("update", {
      table: 't_task',
    });

    return res.status(200).json(11);
  } catch (error) {
    next(error);
  }
});

router.post("/task-closed", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;

    const [_user] = await pool.query(`SELECT email FROM t_user WHERE id=?`, [data.created_by_id])

    const response = await _comunication.postMarkTemplate({
      MessageStream: "outbound",
      From: `MEDTRAVEL <${process.env.MAIL_USER}>`,
      To: [_user.email].join(","),
      TemplateId: "40339589",
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        data: data,
        url: `${process.env.DOMAIN_HOST}`,
        logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`,
      },
      ReplyTo: `${account.email}`,
    });

    req.io.emit("update", {
      table: 't_task',
    });

    return res.status(200).json(11);
  } catch (error) {
    next(error);
  }
});

export default router;
