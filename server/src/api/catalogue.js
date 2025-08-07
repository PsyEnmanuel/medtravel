import express from "express";
import path, { format } from "path";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import {
  _query,
  _date,
  _utility,
  _constant,
  _upload,
  _template,
} from "../helpers/index.js";
import pool from "../databases/main.js";

const router = express.Router();
const table = "t_catalogue";

import { isValid } from "date-fns";

import JsBarcode from "jsbarcode";

import { DOMImplementation, XMLSerializer } from "xmldom";

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

      item.quantity = 1;
      if (!item.minimun) {
        item.minimun = 0;
      }
      if (!item.maximun) {
        item.maximun = 0;
      }
      item.has_exoneration = 0;
      item.exoneration = 0;

      item.c_status_format = _utility.formatCStatus(item.c_status);

      if (item.price) {
        item.price_format = _utility.currency(item.price);
      } else {
        item.price_format = _utility.currency(0);
        item.price = 0;
      }

      if (item.cost) {
        item.cost_format = _utility.currency(item.cost);
      } else {
        item.cost_format = _utility.currency(0);
        item.cost = 0;
      }

      if (item.gap) {
        item.gap_format = _utility.currency(item.gap);
      } else {
        item.gap_format = _utility.currency(0);
        item.gap = 0;
      }
      if (item.coverage) {
        item.coverage_format = _utility.currency(item.coverage);
      } else {
        item.coverage_format = _utility.currency(0);
        item.coverage = 0;
      }

      if (item.expiration_date && isValid(item.expiration_date)) {
        item.expiration_date_format = _date.intlDate(item.expiration_date);
      }

      if (!item.minimun || !item.maximun) {
        item.status_class = "bg-orange-2";
        item.status_description = "No definido";
      } else if (item.on_stock < item.minimun) {
        item.status_class = "bg-red-200";
        item.status_description = "Nivel Crítico de Inventario";
      } else if (item.on_stock > item.maximun) {
        item.status_class = "bg-sky-200";
        item.status_description = "Inventario Excedente";
      } else if (
        item.on_stock >= item.minimun &&
        item.on_stock <= item.maximun
      ) {
        item.status_class = "bg-green-200";
        item.status_description = "Inventario Óptimo";
      }
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

router.get("/report", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    req.query.order = {
      description: 'ASC'
    }

    let { items } = await _query.getRows({
      table: "t_catalogue",
      user,
      query: req.query,
    });
    const report = {
      on_stock: 0,
      on_stock_general: 0,
      on_stock_farmacia: 0,
      on_stock_cosmiatria: 0,
      items: [],
      date: new Date(),
      date_format: new Date(),
      day: null,
      year: null,
    };

    items.forEach((item) => {
      if (item.expiration_date && item.expiration_date !== '0000-00-00') {
        item.expiration_date_format = _date.intlDate(item.expiration_date)
      }

      report.on_stock += item.on_stock;

      if (item.on_stock) {
        report.items.push(item);
      }
    });

    report.images = {
      logoText: _upload.convertImagetoBase64("logoText.png"),
    };
    report.user = user;
    report.on_stock = report.on_stock;

    report.date_format = format(report.date, "dd-MM-yyyy");
    report.day = format(report.date, "dd");

    report.year = format(report.date, "yyyy");

    const bodyTemplate = await _template.getBody({
      table: "t_report_inventory",
      account,
      data: {
        ...report,
        account_description: account.description
      }
    });

    report.filename = `REPORTE-INVENTARIO`;

    const url = await _upload.generatePDF({
      account,
      data: report,
      table: "t_report_inventory",
      filename: report.filename,
      landscape: false,
      bodyTemplate,
      header: false,
      footer: false,
      margin: {
        top: "100px",
        bottom: "100px",
        right: "30px",
        left: "30px",
      },
    });

    return res.status(200).json(url);
  } catch (error) {
    next(error);
  }
});

router.get("/insurance/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;

    const { items, total, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.quantity = 1;
      item.has_exoneration = 0;
      item.exoneration = 0;
      if (item.price) {
        item.price_format = _utility.currency(item.price);
      } else {
        item.price_format = _utility.currency(0);
        item.price = 0;
      }

      if (item.coverage) {
        item.coverage_format = _utility.currency(item.coverage);
      } else {
        item.coverage_format = _utility.currency(0);
        item.coverage = 0;
      }

      if (item.cost) {
        item.cost_format = _utility.currency(item.cost);
      } else {
        item.cost_format = _utility.currency(0);
        item.cost = 0;
      }

      if (item.gap) {
        item.gap_format = _utility.currency(item.gap);
      } else {
        item.gap_format = _utility.currency(0);
        item.gap = 0;
      }

      if (item.expiration_date && isValid(item.expiration_date)) {
        item.expiration_date = _date.intlDate(item.expiration_date);
      }

      const [insurance] = await pool.query(
        `SELECT * FROM t_catalogue_insurance WHERE insurance_id=? AND catalogue_id=? AND c_status & ?`,
        [
          req.params.id,
          item.id,
          req.query.where.c_status || req.query.where["bi:c_status"],
        ]
      );

      if (insurance) {
        if (insurance.description) {
          item.description = insurance.description;
        }

        if (insurance.c_status) {
          item.c_status = insurance.c_status;
        }

        if (!isNaN(insurance.price)) {
          item.price_format = _utility.currency(insurance.price);
          item.price = insurance.price;
        }

        if (!isNaN(insurance.coverage)) {
          item.coverage_format = _utility.currency(insurance.coverage);
          item.coverage = insurance.coverage;
        }

        if (!isNaN(insurance.gap)) {
          item.gap_format = _utility.currency(insurance.gap);
          item.gap = insurance.gap;
        }
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

router.get("/promotion/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;

    const { items, total } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.quantity = 1;
      item.has_exoneration = 0;
      item.exoneration = 0;

      if (item.price) {
        item.price_format = _utility.currency(item.price);
        item.original_price_format = _utility.currency(item.price);
      } else {
        item.price_format = _utility.currency(0);
        item.original_price_format = _utility.currency(0);
        item.price = 0;
      }
      if (item.coverage) {
        item.coverage_format = _utility.currency(item.coverage);
      } else {
        item.coverage_format = _utility.currency(0);
        item.coverage = 0;
      }

      if (item.cost) {
        item.cost_format = _utility.currency(item.cost);
      } else {
        item.cost_format = _utility.currency(0);
        item.cost = 0;
      }

      if (item.gap) {
        item.gap_format = _utility.currency(item.gap);
      } else {
        item.gap_format = _utility.currency(0);
        item.gap = 0;
      }

      if (item.expiration_date && isValid(item.expiration_date)) {
        item.expiration_date = _date.intlDate(item.expiration_date);
      }

      item.original_price = item.price;
      item.percent = 0;
      item.c_status = 2;

      const [promotion] = await pool.query(
        `SELECT * FROM t_catalogue_promotion WHERE promotion_id=? AND catalogue_id=? AND c_status & ?`,
        [
          req.params.id,
          item.id,
          req.query.where.c_status || req.query.where["bi:c_status"],
        ]
      );

      if (promotion) {
        item.has_promotion = 1;
        if (promotion.description) {
          item.description = promotion.description;
        }
        item.promotion_description = promotion.promotion;

        if (promotion.detail) {
          item.promotion_detail = promotion.detail;
        }
        if (promotion.c_status) {
          item.c_status = promotion.c_status;
        }

        if (!isNaN(promotion.price)) {
          item.price_format = _utility.currency(promotion.price);
          item.price = promotion.price;
        }
        if (!isNaN(promotion.percent)) {
          item.percent = promotion.percent;
        }
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

    const item = await _query.getRowById({
      id: req.params.id,
      table,
      user,
    });

    if (item.expiration_date && isValid(item.expiration_date)) {
      item.expiration_date = _date.intlDate(item.expiration_date);
    }

    item.on_new_stock = item.on_stock;
    item.created_format = _date.intlDateTime(item.created);
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

    data.code = await _query.getCode({ table });

    if (data.expiration_date) {
      data.expiration_date_valid = _date.convertToValidDate(
        data.expiration_date
      );
      data.expiration_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.expiration_date_valid)
      );
    } else {
      data.expiration_date = null;
    }

    const response = await _query.insert({
      user,
      table,
      data: {
        ...data,
        price: _utility.cleanCurrency(req.body.price),
        cost: _utility.cleanCurrency(req.body.cost),
        coverage: _utility.cleanCurrency(req.body.coverage),
        gap: _utility.cleanCurrency(req.body.gap),
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

router.post("/barcode", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;
    data.account = account;

    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument(
      "http://www.w3.org/1999/xhtml",
      "html",
      null
    );

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];

      const svgNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

      JsBarcode(svgNode, row.barcode, {
        xmlDocument: document,
        width: 2,
        height: 30,
        fontSize: 16,
      });

      row.price_format = _utility.currency(row.price);
      row.svgBarcode = xmlSerializer.serializeToString(svgNode);
    }

    const bodyTemplate = await _template.getBody({
      table: "barcode",
      account,
      data,
    });

    data.filename = `${data.code}-MEDICAMENTO`;

    const filename = await _upload.generatePDF({
      account,
      data: data,
      table: "barcode",
      id: null,
      filename: data.filename,
      bodyTemplate,
      header: false,
      footer: false,
      landscape: true,
      scale: 0.8,
      width: "70mm",
      height: "60mm",
      // width: "81.3mm",
      margin: {
        top: "0",
        bottom: "2mm",
        right: "4mm",
        left: "4mm",
      },
    });

    req.io.emit("print-invoice", {
      account,
      user,
      token: res.locals.token,
      api: process.env.DOMAIN,
      url: filename,
      options: {
        printer: account.printer.label,
        scale: "fit",
        // pageSize: "40mm * 20mm",
        copies: data.rows[0].quantity,
      },
    });

    // const base64 = await pdfUrlToBase64(filename);

    // req.io.emit("print-invoice", base64);

    return res.status(200).json(filename);
  } catch (error) {
    next(error);
  }
});

router.post("/barcode/pdf", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;
    const base64Data = await _utility.pdfUrlToBase64(data.filename);

    req.io.emit("print-invoice", {
      user,
      data: base64Data,
      options: {
        silent: true,
        printBackground: true,
        deviceName: account.printer.label,
        copies: 1,
      },
    });

    return res.status(200).json(true);
  } catch (error) {
    console.log(error);
  }
});

router.post("/insurance", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;
    data.catalogue_id = data.id;
    const { items } = await _query.getRows({
      auth: 0,
      table: "t_catalogue_insurance",
      user,
      query: {
        where: {
          catalogue_id: data.catalogue_id,
          insurance_id: data.insurance_id,
          "bi:c_status": 6,
        },
      },
    });

    if (items.length) {
      const item = items[0];

      await _query.update({
        id: item.id,
        user,
        table: "t_catalogue_insurance",
        data,
      });
      return res.status(200).json(true);
    } else {
      delete data.id;
      await _query.insert({
        auth: 0,
        user,
        table: "t_catalogue_insurance",
        data,
      });
      return res.status(200).json(true);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/promotion", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;
    data.catalogue_id = data.id;
    const { items } = await _query.getRows({
      auth: 0,
      table: "t_catalogue_promotion",
      user,
      query: {
        where: {
          catalogue_id: data.catalogue_id,
          promotion_id: data.promotion_id,
          "bi:c_status": 6,
        },
      },
    });

    if (items.length) {
      const item = items[0];

      await _query.update({
        id: item.id,
        user,
        table: "t_catalogue_promotion",
        data,
      });
      return res.status(200).json(true);
    } else {
      delete data.id;
      await _query.insert({
        auth: 0,
        user,
        table: "t_catalogue_promotion",
        data,
      });
      return res.status(200).json(true);
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    if (data.on_stock > data.on_new_stock) {
      data.on_stock = data.on_stock - data.on_new_stock;
      await _query.inventoryExit({ ...data, quantity: data.on_stock }, user)
    } else if (data.on_stock < data.on_new_stock) {
      const quantity = data.on_new_stock - data.on_stock;
      data.on_stock = data.on_new_stock
      await _query.inventoryEnter({ ...data, quantity: quantity }, user)
    }

    if (data.expiration_date) {
      data.expiration_date_valid = _date.convertToValidDate(
        data.expiration_date
      );
      data.expiration_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.expiration_date_valid)
      );
    } else {
      data.expiration_date = null;
    }

    var response = await _query.update({
      id: req.params.id,
      user,
      table,
      data: {
        ...data,
        price: _utility.cleanCurrency(req.body.price),
        cost: _utility.cleanCurrency(req.body.cost),
        coverage: _utility.cleanCurrency(req.body.coverage),
        gap: _utility.cleanCurrency(req.body.gap),
      },
    });

    _query.updateCatalogueStock(user);

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
    console.log(ids);
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
