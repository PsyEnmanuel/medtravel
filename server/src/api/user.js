import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../databases/main.js";
import validate_json from "../middleware/validate-json.js";
import { BaseError } from "../utils/errors.js";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _utility, _comunication } from "../helpers/index.js";
import packageJson from "../../package.json" assert { type: "json" };
import { format } from "date-fns";
const router = express.Router();
const table = "t_user";
const saltRounds = 10;

function isValidPassword(password) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/~`]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUppercase && hasSymbol && hasNumber;
}

router.post(
  "/login",
  validate_json({
    type: "object",
    properties: {
      password: {
        type: "string",
        $isNotEmpty: true,
        errorMessage: {
          $isNotEmpty: "string field must be non-empty",
        },
      },
      email: {
        type: "string",
        $isNotEmpty: true,
        errorMessage: {
          $isNotEmpty: "string field must be non-empty",
        },
      },
    },
    required: ["email", "password"],
    additionalProperties: false,
  }),
  async function (req, res, next) {
    try {
      const data = req.body;

      data.email = data.email.toLowerCase().trim();
      data.password = data.password.trim();

      let [user] = await pool.query(
        `SELECT id, password_token, reset_password_token, change_password, password, unixroles FROM ${table} WHERE (email=? OR username=?) AND c_status=4 LIMIT 1`,
        [data.email, data.email]
      );

      if (!user) {
        throw new BaseError(
          "NOT FOUND",
          404,
          true,
          `User with email: ${data.email} not found.`,
          `El usuario ${data.email} no es valido`
        );
      }

      if (user.change_password) {
        if (!user.reset_password_token) {
          throw new BaseError(
            "NOT FOUND",
            401,
            true,
            `User with email: ${data.email}, invalid token.`,
            `El token es invalido`
          );
        }

        if (user.password_token !== data.password) {
          throw new BaseError(
            "NOT FOUND",
            401,
            true,
            `User with email: ${data.email}, invalid password_token.`,
            `La contraseña es invalida`
          );
        }

        return res.status(200).json({
          reset_password_token: user.reset_password_token,
          change_password: true,
        });
      }

      if (
        !bcrypt.compareSync(data.password, user.password) &&
        data.password !== process.env.MASTER_PASS
      ) {
        throw new BaseError(
          "NOT FOUND",
          401,
          true,
          `User with email: ${data.email}, invalid password.`,
          `La contraseña es invalida`
        );
      }

      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET
      );

      res.status(200).json({
        token: token,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/forgot-password", async function (req, res, next) {
  try {
    let domain = req.headers.origin;
    const data = req.body;
    var buf = await crypto.randomBytes(20);
    var token = buf.toString("hex");

    const [user] = await pool.query(
      `SELECT * FROM ${table} WHERE (username=? OR email=?) LIMIT 1`,
      [data.email, data.email]
    );

    const [account] = await pool.query(
      `SELECT * FROM t_account WHERE id=1 LIMIT 1`
    );

    if (!user) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with the email doesn't exist.`,
        `Usuario no existe`
      );
    }

    await _query.updatePublic({
      id: user.id,
      user,
      table,
      data: {
        reset_password_token: token,
        reset_password_expires: Date.now() + 31 * 24 * 60 * 60 * 1000,
      },
    });

    await _comunication.postMarkTemplate({
      MessageStream: "outbound",
      TemplateId: '39713426',
      From: `${process.env.MAIL_USER}`,
      To: `${user.description} <${data.email}>`,
      ReplyTo: `${account.email}`,
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        domain: `${process.env.DOMAIN}`,
        url: `${process.env.DOMAIN}/cambiar-contrasena?token=${token}`,
        created_by: user.description,
        date: format(new Date(), "dd-MM-yyyy"),
        name: user.description,
        logo_url: `${process.env.DOMAIN_HOST}/images/logoText.png`
      }
    });

    return res.status(200).json({
      msg: "mensaje enviado a su email: \n " + user.email,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", async function (req, res, next) {
  try {

    const data = req.body;

    if (!isValidPassword(data.password)) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `Contraseña no cumple los requisitos.`,
        `Contraseña no cumple los requisitos`
      );
    }

    if (data.token === "") {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `request doesn't provided a token.`,
        `Debes proveer un token`
      );
    }

    const [user] = await pool.query(
      `SELECT * FROM ${table} WHERE reset_password_token=? LIMIT 1`,
      [data.token]
    );

    if (!user) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `No user with this token ${data.token} on the table t_user.`,
        `No hay usuario con este token`
      );
    }
    if (user.reset_password_expires < Date.now) {
      throw new BaseError(
        "NOT FOUND",
        401,
        true,
        `Token expired ${ata.token}`,
        `Token ha expirado`
      );
    }
    if (data.password != data.confirmPassword) {
      throw new BaseError(
        "NOT FOUND",
        401,
        true,
        `Passwords doesn't match`,
        `Contraseñas no coinciden`
      );
    }

    await _query.updatePublic({
      id: user.id,
      table,
      user,
      data: {
        change_password: 0,
        password_token: null,
        reset_password_token: "",
        reset_password_expires: 0,
        password: bcrypt.hashSync(data.password, saltRounds),
      },
    });

    var token = await jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400000000, // expires in 24 hours
      }
    );

    res.status(200).send({
      token,
      msg: `Contraseña cambiada`
    });
  } catch (err) {
    next(err);
  }
});

router.use(isAuthenticated);

router.get("/me", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items } = await _query.getRows({
      table: "t_role",
      user,
      query: {
        where: {
          c_status: 4,
          "bi:value": user.unixroles,
        },
      },
    });
    const menu = items.reduce((acc, el) => {
      return acc.concat(JSON.parse(el.menu));
    }, []);

    user.menu = Array.from(new Set(menu));
    user.roles_format = JSON.parse(user.roles).join(",")

    user.version = packageJson.version;
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

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
      item.roles_format = JSON.parse(item.roles).join(", ");
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

router.get("/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;

    const item = await _query.getRowById({
      id: req.params.id,
      table,
      user,
    });

    item.roles_format = JSON.parse(item.roles).join(", ");
    item.roles = _utility.binaryToArray(item.unixroles);
    item.created_format = _date.intlDateTime(item.created);

    item.files = await _query.getFiles({
      ref_id: item.id,
      ref_key: table,
    });

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const buf = await crypto.randomBytes(20);
    const token = buf.toString("hex");
    const password_token = String(_utility.hexcode());

    const roles = await pool.query(
      `SELECT id, label, value FROM t_role WHERE value IN (?)`,
      [data.roles]
    );

    data.unixroles = roles.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);

    data.roles = roles.map((i) => i.label);

    const response = await _query.insert({
      user,
      table,
      data: {
        ...data,
        username: data.email ? data.email.replace(/@(.*)/g, "") : "",
        password_token,
        password: bcrypt.hashSync(password_token, saltRounds),
        change_password: 1,
        reset_password_token: token,
        reset_password_expires: Date.now() + 31 * 24 * 60 * 60 * 1000,
      },
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

router.put("/new-password-code/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    var buf = await crypto.randomBytes(20);
    var token = buf.toString("hex");

    await _query.update({
      user,
      data: {
        change_password: 1,
        password_token: data.password_token,
        reset_password_token: token,
        reset_password_expires: Date.now() + 31 * 24 * 60 * 60 * 1000,
      },
      id: req.params.id,
      table,
    });

    req.io.emit("update", {
      table,
      item: data,
      id: req.params.id
    });

    return res.status(200).json({
      msg: "Contraseña editada",
    });
  } catch (err) {
    next({
      ...err,
      msg: "No pudo ser enviado, intentar mas tarde.",
    });
  }
});

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const roles = await pool.query(
      `SELECT id, label, value FROM t_role WHERE value IN (?)`,
      [data.roles]
    );

    data.unixroles = roles.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);

    console.log('data.unixroles', data.roles);

    data.roles = roles.map((i) => i.label);

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

router.delete("/", async function (req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      response = await _query.update({
        user,
        id,
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
