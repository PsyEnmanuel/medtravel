import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import {
  _query,
  _date,
  _template,
  _upload,
  _utility,
} from "../helpers/index.js";

import { format } from "date-fns";
const router = express.Router();
const table = "t_prescription";

router.use(isAuthenticated);

router.get("/stats", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    let stats = {
      sex: {
        men: 0,
        women: 0,
      },
      treatmentList: [],
      mprocedureList: [],
      analyticList: [],
      recomendationList: [],
    };

    items.forEach((item) => {
      item.created_format = format(new Date(item.created), "dd-MM-yyyy");

      if (item.$sex_id === 5) {
        stats.sex.men++;
      }
      if (item.$sex_id === 6) {
        stats.sex.women++;
      }

      if (item.treatment && item.treatment.length) {
        item.treatment = JSON.parse(item.treatment);
        if (item.treatment.length) {
          for (let i = 0; i < item.treatment.length; i++) {
            const row = item.treatment[i];
            if (row.description) {
              const index = stats.treatmentList.findIndex(
                (i) => +i.id === +row.id
              );
              if (index === -1) {
                stats.treatmentList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1,
                });
              } else {
                ++stats.treatmentList[index].quantity;
              }
            }
          }
        }
      }

      if (item.mprocedure && item.mprocedure.length) {
        item.mprocedure = JSON.parse(item.mprocedure);
        if (item.mprocedure.length) {
          for (let i = 0; i < item.mprocedure.length; i++) {
            const row = item.mprocedure[i];
            if (row.description) {
              const index = stats.mprocedureList.findIndex(
                (i) => +i.id === +row.id
              );
              if (index === -1) {
                stats.mprocedureList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1,
                });
              } else {
                ++stats.mprocedureList[index].quantity;
              }
            }
          }
        }
      }

      if (item.analytic && item.analytic.length) {
        item.analytic = JSON.parse(item.analytic);
        if (item.analytic.length) {
          for (let i = 0; i < item.analytic.length; i++) {
            const row = item.analytic[i];
            if (row.description) {
              const index = stats.analyticList.findIndex(
                (i) => +i.id === +row.id
              );
              if (index === -1) {
                stats.analyticList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1,
                });
              } else {
                ++stats.analyticList[index].quantity;
              }
            }
          }
        }
      }

      if (item.recomendation && item.recomendation.length) {
        item.recomendation = JSON.parse(item.recomendation);
        if (item.recomendation.length) {
          for (let i = 0; i < item.recomendation.length; i++) {
            const row = item.recomendation[i];
            if (row.description) {
              const index = stats.recomendationList.findIndex(
                (i) => +i.id === +row.id
              );
              if (index === -1) {
                stats.recomendationList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1,
                });
              } else {
                ++stats.recomendationList[index].quantity;
              }
            }
          }
        }
      }

    });
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

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
      if (item.prescription_date && _date.isValidDate(item.prescription_date)) {
        item.prescription_date_format = _date.intlDateTime(
          item.prescription_date
        );
        if (item.modified) {
          item.modified_format = _date.intlDateTime(item.modified);
        }
        item.created_format = _date.intlDateTime(item.created);
      }

      if (item.treatment) {
        item.treatment = JSON.parse(item.treatment);
      } else {
        item.treatment = [];
      }
      if (item.recomendation) {
        item.recomendation = JSON.parse(item.recomendation);
      } else {
        item.recomendation = [];
      }
      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure);
      } else {
        item.mprocedure = [];
      }
      if (item.analytic) {
        item.analytic = JSON.parse(item.analytic);
      } else {
        item.analytic = [];
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

    if (item.analytic) {
      item.analytic = JSON.parse(item.analytic);
    } else {
      item.analytic = [];
    }

    if (item.treatment) {
      item.treatment = JSON.parse(item.treatment);
    } else {
      item.treatment = [];
    }

    if (item.recomendation) {
      item.recomendation = JSON.parse(item.recomendation);
    } else {
      item.recomendation = [];
    }

    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure);
    } else {
      item.mprocedure = [];
    }

    if (item.birthdate && _date.isValidDate(item.birthdate)) {
      item.age = _date.calculateReadableAge(item.birthdate);
      item.birthdate = _date.intlDate(item.birthdate);
    }

    item.file = await _query.getPDF({
      ref_id: item.id,
      ref_key: table,
    });

    item.prescription_date = _date.intlDate(item.prescription_date);
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
    const account = res.locals.account;
    const data = req.body;

    data.code = await _query.getCode({ table });

    if (data.birthdate) {
      data.birthdate_valid = _date.convertToValidDate(data.birthdate);
      data.birthdate = _date.mysqlDateTime(data.birthdate_valid);
      data.age = _date.calculateReadableAge(data.birthdate);
    }

    if (data.prescription_date) {
      data.prescription_date_valid = _date.convertToValidDate(
        data.prescription_date
      );
      data.prescription_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.prescription_date_valid)
      );
    } else {
      data.prescription_date = null;
    }

    Object.assign(data, {
      doctor_id: user.id,
      doctor_description: user.description,
      doctor_ident_no: user.ident_no,
      exequatur: user.exequatur,
    });

    const response = await _query.insert({
      user,
      table,
      data,
    });

    const insured = await _query.getRowById({
      user,
      table: 't_insured',
      id: data.insured_id
    })
    data.insured_description = insured.fullname
    if (insured.birthdate) {
      data.age = _date.calculateReadableAge(insured.birthdate);
    }

    let signature = _upload.convertImagetoBase64("signatureEmpty.png")

    data.images = {
      signature,
      logo: _upload.convertImagetoBase64("logo.png"),
      logoText: _upload.convertImagetoBase64("logoText.png"),
      prescription: _upload.convertImagetoBase64("prescription.png"),
      rx: _upload.convertImagetoBase64("rx.png"),
      email: _upload.convertImagetoBase64("email.png"),
      location: _upload.convertImagetoBase64("location.png"),
      phone: _upload.convertImagetoBase64("phone.png"),
      whatsapp: _upload.convertImagetoBase64("whatsapp.png"),
      facebook: _upload.convertImagetoBase64("facebook.png"),
      instagram: _upload.convertImagetoBase64("instagram.png"),
    };

    data.birthdate_format = _date.intlDate(data.birthdate_valid);
    data.prescription_date_format = _date.intlDate(
      data.prescription_date_valid
    );
    data.sex = await _query.getCategoryDescriptionById(data.$sex_id);
    data.prescription_type = await _query.getCategoryDescriptionById(
      data.$prescription_type_id
    );

    const bodyTemplate = await _template.getBody({
      table,
      account,
      data,
    });

    const filename = await _upload.generatePDF({
      account,
      data,
      table,
      id: response.id,
      filename: data.code,
      bodyTemplate,
      header: table,
      footer: table,
      margin: {
        top: "300px",
        bottom: "300px",
        right: "0",
        left: "0",
      },
    });

    await _query.insert({
      user,
      table: "t_file",
      data: {
        ref_key: table,
        ref_id: response.id,
        description: `PRESCRIPCION-${data.insured_description}-${data.prescription_date_format}`,
        url: filename,
        type: "pdf",
      },
    });

    req.io.emit("update", {
      table,
      item: data,
      id: response.id,
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

router.post("/pdf", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;

    req.io.emit("print-invoice", {
      account,
      user,
      token: res.locals.token,
      api: process.env.DOMAIN,
      url: data.filename,
      options: {
        printer: account.printer.main,
      },
    });

    return res.status(200).json(true);
  } catch (error) {
    console.log(error);
  }
});

router.post("/report", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const body = req.body;

    const items = body.items

    const data = items[0]

    const report = {
      account,
      user,
      items,
      title: body.title,
      from: format(_date.convertToValidDate(body.from), 'dd MMMM, yyyy'),
      to: format(_date.convertToValidDate(body.to), 'dd MMMM, yyyy'),
    };

    if (req.query.type === 'excel') {
      return res.status(200).json(items)
    }

    const bodyTemplate = await _template.getBody({
      table: "t_history_stats",
      account,
      data: report,
    });

    report.filename = `REPORTE`;

    const filename = await _upload.generatePDF({
      account,
      data: report,
      table: "t_history_stats",
      filename: report.filename,
      landscape: true,
      bodyTemplate,
      header: false,
      footer: table,
      margin: {
        top: "20px",
        bottom: "0",
        right: "0",
        left: "20px",
      },
    });

    res.status(200).json(filename);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;

    if (data.birthdate) {
      data.birthdate_valid = _date.convertToValidDate(data.birthdate);
      data.birthdate = _date.mysqlDateTime(data.birthdate_valid);
      data.age = _date.calculateReadableAge(data.birthdate);
    }

    if (data.prescription_date) {
      data.prescription_date_valid = _date.convertToValidDate(
        data.prescription_date
      );
      data.prescription_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.prescription_date_valid)
      );
    } else {
      data.prescription_date = null;
    }

    Object.assign(data, {
      exequatur: user.exequatur,
    });

    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
    });

    let signature = _upload.convertImagetoBase64("signatureEmpty.png")

    data.images = {
      signature: signature,
      logo: _upload.convertImagetoBase64("logo.png"),
      logoText: _upload.convertImagetoBase64("logoText.png"),
      prescription: _upload.convertImagetoBase64("prescription.png"),
      rx: _upload.convertImagetoBase64("rx.png"),
      email: _upload.convertImagetoBase64("email.png"),
      location: _upload.convertImagetoBase64("location.png"),
      phone: _upload.convertImagetoBase64("phone.png"),
      whatsapp: _upload.convertImagetoBase64("whatsapp.png"),
      facebook: _upload.convertImagetoBase64("facebook.png"),
      instagram: _upload.convertImagetoBase64("instagram.png"),
    };

    const insured = await _query.getRowById({
      user,
      table: 't_insured',
      id: data.insured_id
    })

    data.insured_description = insured.fullname
    if (insured.birthdate) {
      data.age = _date.calculateReadableAge(insured.birthdate);
    }


    data.birthdate_format = _date.intlDate(data.birthdate_valid);
    data.prescription_date_format = _date.intlDate(
      data.prescription_date_valid
    );
    data.sex = await _query.getCategoryDescriptionById(data.$sex_id);
    data.prescription_type = await _query.getCategoryDescriptionById(
      data.$prescription_type_id
    );
    const bodyTemplate = await _template.getBody({
      table,
      account,
      data,
    });

    const filename = await _upload.generatePDF({
      account,
      data,
      table,
      id: response.id,
      filename: data.code,
      bodyTemplate,
      header: table,
      footer: table,
      margin: {
        top: "300px",
        bottom: "300px",
        right: "0",
        left: "0",
      },
    });

    const { items: files } = await _query.getRows({
      user,
      table: "t_file",
      query: {
        where: {
          ref_key: table,
          ref_id: response.id,
          url: filename,
          type: "pdf",
        },
      },
    });

    if (files.length) {
      await _query.update({
        user,
        table: "t_file",
        data: {
          ref_key: table,
          ref_id: response.id,
          description: `PRESCRIPCION-${data.insured_description
            }-${_date.intlDate(data.history_date_valid)}`,
          url: filename,
          type: "pdf",
        },
      });
    } else {
      await _query.insert({
        user,
        table: "t_file",
        data: {
          ref_key: table,
          ref_id: response.id,
          description: `PRESCRIPCION-${data.insured_description}-${data.history_date_format}`,
          url: filename,
          type: "pdf",
        },
      });
    }

    req.io.emit("update", {
      table,
      item: data,
      id: response.id,
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
      item: data,
      id: response.id,
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
