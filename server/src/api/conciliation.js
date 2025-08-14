import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { format, getDaysInMonth, setDate, isValid } from "date-fns";
import {
  _query,
  _date,
  _utility,
  _upload,
  _template,
} from "../helpers/index.js";
import pool from "../databases/main.js";
// import { es } from "date-fns/locale";
const router = express.Router();
const table = "t_book";

router.use(isAuthenticated);

router.get("/pdf2/:code", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    const { items: books } = await _query.getRows({
      table,
      user,
      query: {
        where: {
          code: req.params.code,
          c_status: 4,
        },
      },
    });

    const item = books[0];

    const items = books.filter((i) => i.$book_type_id === 98);
    const payments = books.filter((i) => i.$book_type_id === 354);

    item.book_date_format = format(new Date(item.book_date), "dd-MM-yyyy");
    item.sequence = String(item.code).substring(1);
    item.day = format(item.book_date, "dd");

    item.year = format(item.created, "yyyy");

    for (let i = 0; i < payments.length; i++) {
      const item = payments[i];

      if (item.insurance_payment) {
        item.insurance_payment_format = _utility.currency(item.insurance_payment, item.currency);
      }

      if (item.insurance_responsability) {
        item.insurance_responsability_format = _utility.currency(item.insurance_responsability, item.currency);
      }

      item.book_date_format = _date.intlDate(item.book_date);
    }

    if (item.billed_amount_total) {
      item.billed_amount_total_format = _utility.currency(item.billed_amount_total, item.currency);
    }

    if (item.coverage_total) {
      item.coverage_total_format = _utility.currency(item.coverage_total, item.currency);
    }

    if (item.discount_total) {
      item.discount_total_format = _utility.currency(item.discount_total, item.currency);
    }

    if (item.deductible_total) {
      item.deductible_total_format = _utility.currency(item.deductible_total, item.currency);
    }

    if (item.copago_total) {
      item.copago_total_format = _utility.currency(item.copago_total, item.currency);
    }

    if (item.covered_total) {
      item.covered_total_format = _utility.currency(item.covered_total, item.currency);
    }

    if (item.insurance_payment_total) {
      item.insurance_payment_total_format = _utility.currency(item.insurance_payment_total, item.currency);
    }

    if (item.insurance_responsability_total) {
      item.insurance_responsability_total_format = _utility.currency(item.insurance_responsability_total, item.currency);
    }

    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis)
    }

    if (item.notes) {
      item.notes = JSON.parse(item.notes)
    }

    const filename = `${item.code}-${item.book_date_format}`;

    const { docDefinition } = await _template.generateConciliation({
      item,
      items,
      payments,
      account,
      user
    })

    const pdfUrl = await _upload.generatePDFWithPdfmake({
      account,
      table: "t_book",
      id: item.id,
      filename,
      docDefinition,
    });

    const images = [];
    const pdfs = [_upload.filePath(pdfUrl)];

    const files = await _query.getFiles({ ref_key: 't_book', ref_id: item.id })

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "image") {
        const filePath = _upload.filePath(file.url);
        images.push(filePath);
      }
      if (file.icon === "pdf") {
        const filePath = _upload.filePath(file.url);
        pdfs.push(filePath);
      }
    }
    const newpdf = await _upload.imageToPDF(images);
    const buf = await _upload.mergePDF([...pdfs, ...newpdf]);

    await _upload.replaceFile(pdfs[0], buf);

    return res.status(200).json(pdfUrl);
  } catch (error) {
    next(error);
  }
});

router.get("/pdf/:code", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;

    const { items: books } = await _query.getRows({
      table,
      user,
      query: {
        where: {
          code: req.params.code,
          c_status: 4,
        },
      },
    });

    const item = books[0];

    const items = books.filter((i) => i.$book_type_id === 98);
    const payments = books.filter((i) => i.$book_type_id === 354);

    item.book_date_format = format(new Date(item.book_date), "dd-MM-yyyy");
    item.sequence = String(item.code).substring(1);
    item.day = format(item.book_date, "dd");

    item.year = format(item.created, "yyyy");

    item.images = {
      logoText: _upload.convertImagetoBase64("logoText.png"),
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.billed_amount_total) {
        item.billed_amount_format = _utility.currency(item.billed_amount, item.currency);
      }

      if (item.coverage) {
        item.coverage_format = _utility.currency(item.coverage, item.currency);
      }

      if (item.discount) {
        item.discount_format = _utility.currency(item.discount, item.currency);
      }

      if (item.deductible) {
        item.deductible_format = _utility.currency(item.deductible, item.currency);
      }

      if (item.copago) {
        item.copago_format = _utility.currency(item.copago, item.currency);
      }

      if (item.covered) {
        item.covered_format = _utility.currency(item.covered, item.currency);
      }

      if (item.insurance_payment) {
        item.insurance_payment_format = _utility.currency(item.insurance_payment, item.currency);
      }

      if (item.insurance_responsability) {
        item.insurance_responsability_format = _utility.currency(item.insurance_responsability, item.currency);
      }

      item.book_date_format = _date.intlDate(item.book_date);

    }

    for (let i = 0; i < payments.length; i++) {
      const item = payments[i];

      if (item.insurance_payment) {
        item.insurance_payment_format = _utility.currency(item.insurance_payment, item.currency);
      }

      if (item.insurance_responsability) {
        item.insurance_responsability_format = _utility.currency(item.insurance_responsability, item.currency);
      }

      item.book_date_format = _date.intlDate(item.book_date);
    }

    if (item.billed_amount_total) {
      item.billed_amount_total_format = _utility.currency(item.billed_amount_total, item.currency);
    }

    if (item.coverage_total) {
      item.coverage_total_format = _utility.currency(item.coverage_total, item.currency);
    }

    if (item.discount_total) {
      item.discount_total_format = _utility.currency(item.discount_total, item.currency);
    }

    if (item.deductible_total) {
      item.deductible_total_format = _utility.currency(item.deductible_total, item.currency);
    }

    if (item.copago_total) {
      item.copago_total_format = _utility.currency(item.copago_total, item.currency);
    }

    if (item.covered_total) {
      item.covered_total_format = _utility.currency(item.covered_total, item.currency);
    }

    if (item.insurance_payment_total) {
      item.insurance_payment_total_format = _utility.currency(item.insurance_payment_total, item.currency);
    }

    if (item.insurance_responsability_total) {
      item.insurance_responsability_total_format = _utility.currency(item.insurance_responsability_total, item.currency);
    }

    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis)
    }

    if (item.notes) {
      item.notes = JSON.parse(item.notes)
    }


    const bodyTemplate = await _template.getBody({
      table: "conciliation",
      account,
      data: {
        item,
        items,
        payments
      },
    });

    item.filename = `${item.code}-${item.book_date_format}`;

    const filename = await _upload.generatePDF({
      account,
      data: item,
      table: "conciliation",
      id: req.params.id,
      filename: item.filename,
      landscape: true,
      bodyTemplate,
      header: false,
      footer: false,
      margin: {
        top: "0",
        bottom: "0",
        right: "0",
        left: "0",
      },
    });

    const images = [];
    const pdfs = [_upload.filePath(filename)];

    const files = await _query.getFiles({ ref_key: 't_book', ref_id: item.id })

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "image") {
        const filePath = _upload.filePath(file.url);
        images.push(filePath);
      }
      if (file.icon === "pdf") {
        const filePath = _upload.filePath(file.url);
        pdfs.push(filePath);
      }
    }
    const newpdf = await _upload.imageToPDF(images);
    const buf = await _upload.mergePDF([...pdfs, ...newpdf]);

    await _upload.replaceFile(pdfs[0], buf);

    return res.status(200).json(filename);
  } catch (error) {
    next(error);
  }
});

router.get("/", async function (req, res, next) {
  try {
    const user = res.locals.user;
    console.log(req.query);
    let columns = null;
    if (req.query.groupBy.includes("t_book.code")) {
      columns = [
        "GROUP_CONCAT(DISTINCT item_description SEPARATOR '|') AS label, min(id) AS id",
      ];
    }

    let { items, total, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
      optsServer: {
        columns: columns,
      },
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.billed_amount_total) {
        item.billed_amount_total_format = _utility.currency(item.billed_amount_total, item.currency);
      }

      if (item.coverage_total) {
        item.coverage_total_format = _utility.currency(item.coverage_total, item.currency);
      }

      if (item.discount_total) {
        item.discount_total_format = _utility.currency(item.discount_total, item.currency);
      }

      if (item.deductible_total) {
        item.deductible_total_format = _utility.currency(item.deductible_total, item.currency);
      }

      if (item.covered_total) {
        item.covered_total_format = _utility.currency(item.covered_total, item.currency);
      }

      if (item.insurance_payment_total) {
        item.insurance_payment_total_format = _utility.currency(item.insurance_payment_total, item.currency);
      }

      if (item.insurance_responsability_total) {
        item.insurance_responsability_total_format = _utility.currency(item.insurance_responsability_total, item.currency);
      }

      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis)
      } else {
        item.diagnosis = []
      }

      if (item.notes) {
        item.notes = JSON.parse(item.notes)
      } else {
        item.notes = []
      }

      item.book_date_format = _date.intlDate(item.book_date);
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

router.get("/:code", async function (req, res, next) {
  try {
    const user = res.locals.user;

    const { items: books } = await _query.getRows({
      table: "t_book",
      user,
      query: {
        where: {
          "bi:c_status": 4,
          code: req.params.code,
        },
      },
    });

    const item = books[0];

    const items = books.filter((i) => i.$book_type_id === 98);
    const payments = books.filter((i) => i.$book_type_id === 354);

    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis)
    } else {
      item.diagnosis = []
    }

    if (item.notes) {
      item.notes = JSON.parse(item.notes)
    } else {
      item.notes = []
    }


    item.created_format = _date.intlDateTime(item.created);
    if (item.modified) {
      item.modified_format = _date.intlDateTime(item.modified);
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.book_date && _date.isValidDate(item.book_date)) {
        item.book_date = _date.intlDate(item.book_date);
      }

      items[i] = item;
    }

    for (let i = 0; i < payments.length; i++) {
      const item = payments[i];

      if (item.book_date && _date.isValidDate(item.book_date)) {
        item.book_date = _date.intlDate(item.book_date);
      }

      payments[i] = item;
    }

    return res.status(200).json({ item, items, payments });
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let response;
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;

    data.book.code = await _query.getCode({ table });

    let first = true;
    for (let i = 0; i < data.book_items.length; i++) {
      const item = data.book_items[i];

      item.billed_amount = _utility.cleanCurrency(item.billed_amount);
      item.coverage = _utility.cleanCurrency(item.coverage);
      item.deductible = _utility.cleanCurrency(item.deductible);
      item.copago = _utility.cleanCurrency(item.copago);
      item.covered = _utility.cleanCurrency(item.covered);
      item.discount = _utility.cleanCurrency(item.discount);
      item.insurance_payment = _utility.cleanCurrency(item.insurance_payment);
      item.insurance_responsability = _utility.cleanCurrency(item.insurance_responsability);
      item.insurance_payment = _utility.cleanCurrency(item.insurance_payment);

      if (item.book_date) {
        item.book_date_valid = _date.convertToValidDate(item.book_date);
        item.book_date = _date.mysqlDateTime(
          _date.addCurrentTimeToDate(item.book_date_valid)
        );
      }

      response = await _query.insert({
        user,
        table: "t_book",
        data: {
          ...data.book,
          item_id: item.item_id,
          item_code: item.item_code,
          item_description: item.item_description,
          doctor_id: item.doctor_id,
          doctor_description: item.doctor_description,
          billed_amount: item.billed_amount,
          coverage: item.coverage,
          deductible: item.deductible,
          copago: item.copago,
          covered: item.covered,
          insurance_payment: item.insurance_payment,
          insurance_responsability: item.insurance_responsability,
          discount: item.discount,
          discount_percent: item.discount_percent,
          insurance_claim: item.insurance_claim,
          note: item.note,
          $book_type_id: 98,
          book_date: item.book_date,
          provider_id: item.provider_id,
          provider_description: item.provider_description
        },
      });

      first = false;
    }

    for (let i = 0; i < data.book_payments.length; i++) {
      const item = data.book_payments[i];
      if (!(item.note && item.insurance_payment && item.insurance_responsability)) {
        continue;
      }

      item.insurance_responsability = _utility.cleanCurrency(item.insurance_responsability);
      item.insurance_payment = _utility.cleanCurrency(item.insurance_payment);
      if (item.book_date) {
        item.book_date_valid = _date.convertToValidDate(item.book_date);
        item.book_date = _date.mysqlDateTime(
          _date.addCurrentTimeToDate(item.book_date_valid)
        );
      }

      const objPayment = {
        ...data.book,
        insurance_payment: item.insurance_payment,
        insurance_responsability: item.insurance_responsability,
        book_date: item.book_date,
        note: item.note,
        description: item.description,
        c_status: item.c_status,
        $book_type_id: 354,
      };

      await _query.insert({
        user,
        table: "t_book",
        data: objPayment
      });
    }

    req.io.emit("update", {
      table,
    });

    if (response) {
      return res.status(200).json({ ...response, code: data.book.code });
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

router.put("/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    let response;

    for (let i = 0; i < data.book_items.length; i++) {
      const item = data.book_items[i];

      item.billed_amount = _utility.cleanCurrency(item.billed_amount);
      item.coverage = _utility.cleanCurrency(item.coverage);
      item.deductible = _utility.cleanCurrency(item.deductible);
      item.copago = _utility.cleanCurrency(item.copago);
      item.covered = _utility.cleanCurrency(item.covered);
      item.discount = _utility.cleanCurrency(item.discount);
      item.insurance_payment = _utility.cleanCurrency(item.insurance_payment);
      item.insurance_responsability = _utility.cleanCurrency(item.insurance_responsability);
      item.insurance_payment = _utility.cleanCurrency(item.insurance_payment);

      if (item.book_date) {
        item.book_date_valid = _date.convertToValidDate(item.book_date);
        item.book_date = _date.mysqlDateTime(
          _date.addCurrentTimeToDate(item.book_date_valid)
        );
      }

      const objItem = {
        ...data.book,
        item_id: item.item_id,
        item_code: item.item_code,
        item_description: item.item_description,
        doctor_id: item.doctor_id,
        doctor_description: item.doctor_description,
        billed_amount: item.billed_amount,
        coverage: item.coverage,
        deductible: item.deductible,
        copago: item.copago,
        covered: item.covered,
        insurance_payment: item.insurance_payment,
        insurance_responsability: item.insurance_responsability,
        discount: item.discount,
        discount_percent: item.discount_percent,
        insurance_claim: item.insurance_claim,
        note: item.note,
        $book_type_id: 98,
        book_date: item.book_date,
        provider_id: item.provider_id,
        provider_description: item.provider_description,
      };

      if (item.id) {
        response = await _query.update({
          id: item.id,
          user,
          table: "t_book",
          data: objItem,
        });
      } else {
        response = await _query.insert({
          user,
          table: "t_book",
          data: objItem,
        });
      }
    }

    for (let i = 0; i < data.book_payments.length; i++) {
      const item = data.book_payments[i];

      if (!(item.note && item.insurance_payment && item.insurance_responsability)) {
        continue;
      }

      item.insurance_responsability = _utility.cleanCurrency(item.insurance_responsability);
      item.insurance_payment = _utility.cleanCurrency(item.insurance_payment);
      if (item.book_date) {
        item.book_date_valid = _date.convertToValidDate(item.book_date);
        item.book_date = _date.mysqlDateTime(
          _date.addCurrentTimeToDate(item.book_date_valid)
        );
      }

      const objPayment = {
        ...data.book,
        insurance_payment: item.insurance_payment,
        insurance_responsability: item.insurance_responsability,
        book_date: item.book_date,
        note: item.note,
        description: item.description,
        c_status: item.c_status,
        $book_type_id: 354,
      };

      if (isNaN(item.id)) {
        await _query.insert({
          user,
          table: "t_book",
          data: objPayment,
        });
      } else {
        await _query.update({
          id: item.id,
          user,
          table: "t_book",
          data: objPayment,
        });
      }
    }

    req.io.emit("update", {
      table,
    });

    if (response) {
      return res
        .status(200)
        .json({ ...response, code: data.book.code });
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

router.delete("/:code", async function (req, res) {
  try {
    const user = res.locals.user;
    const response = await _query.update({
      id: req.params.code,
      ref_key: "code",
      user,
      table,
      data: {
        c_status: 1,
      },
    });

    req.io.emit("update", {
      table,
    });

    const { items } = await _query.getRows({
      table,
      user,
      query: {
        limit: 1,
        where: {
          code: req.params.code,
          c_status: 1,
          $book_type_id: 100,
        },
      },
    });

    if (response) {
      res.status(200).json({ response });
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
