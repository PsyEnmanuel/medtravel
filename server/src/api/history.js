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

const router = express.Router();
const table = "t_history";

router.use(isAuthenticated);

function prepareHistory(data) {
  data.physical_exam = `
    <div style="margin-bottom: 4px">
      ${data.piel && data.piel_text ? "<b>Piel: </b>" + data.piel_text : ""}  
    </div>
    <div style="margin-bottom: 4px">
      ${data.cabeza && data.cabeza_text
      ? "<b>Cabeza: </b>" + data.cabeza_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.ojos && data.ojos_text ? "<b>Ojos: </b>" + data.ojos_text : ""}  
    </div>
    <div style="margin-bottom: 4px">
      ${data.nariz && data.nariz_text ? "<b>Nariz: </b>" + data.nariz_text : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.boca && data.boca_text ? "<b>Boca: </b>" + data.boca_text : ""}  
    </div>
    <div style="margin-bottom: 4px">
      ${data.oidos && data.oidos_text ? "<b>Oídos: </b>" + data.oidos_text : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.cuello && data.cuello_text
      ? "<b>Cuello: </b>" + data.cuello_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.torax && data.torax_text ? "<b>Tórax: </b>" + data.torax_text : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.pulmones && data.pulmones_text
      ? "<b>Pulmones: </b>" + data.pulmones_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.abdomen && data.abdomen_text
      ? "<b>Abdomen: </b>" + data.abdomen_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.genitales && data.genitales_text
      ? "<b>Genitales: </b>" + data.genitales_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.extremidades_superiores && data.extremidades_superiores_text
      ? "<b>Extremidades Superiores: </b>" +
      data.extremidades_superiores_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.extremidades_inferiores && data.extremidades_inferiores_text
      ? "<b>Extremidades Inferiores: </b>" +
      data.extremidades_inferiores_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.neurologico && data.neurologico_text
      ? "<b>Neurológico: </b>" + data.neurologico_text
      : ""
    }  
    </div>
    <div style="margin-bottom: 4px">
      ${data.renal && data.renal_text ? "<b>Renal: </b>" + data.renal_text : ""
    }  
    </div>
  `;
}

function prepareVitalSignal(item) {
  if (item.blood_pressure) {
    item.blood_pressure_format = item.blood_pressure + " mmHg";
  }
  if (item.breathing) {
    item.breathing_format = item.breathing + " rpm";
  }
  if (item.pulse) {
    item.pulse_format = item.pulse + " lpm";
  }
  if (item.pulse) {
    item.pulse_format = item.pulse + " lpm";
  }
  if (item.oxygen_saturation) {
    item.oxygen_saturation_format = item.oxygen_saturation + "%";
  }
  if (item.weight && item.weight_system) {
    item.weight_format = `${item.weight} lb`;
  } else {
    item.weight_format = `${item.weight} kg`;
  }
  if (item.temperature && item.temperature_system) {
    item.temperature_format = `${item.temperature} Cº`;
  } else {
    item.temperature_format = `${item.temperature} Fº`;
  }
}

router.get("/stats/patient", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    let stats = {
      diagnosis: [],
      diagnosisList: [],
      mprocedure: [],
      mprocedureList: [],
      treatment: [],
      treatmentList: [],
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      let first = true;
      let first2 = true;
      let first3 = true;

      if (i + 1 !== items.length) {
        if (item.patient_id === items[i + 1].patient_id) {
          first = false;
          first2 = false;
          first3 = false;
        }
      }

      if (item.diagnosis && item.diagnosis.length) {
        item.diagnosis = JSON.parse(item.diagnosis);
        if (item.diagnosis.length) {
          if (first) {
            for (let i = 0; i < item.diagnosis.length; i++) {
              const row = item.diagnosis[i];
              if (row.description) {
                if (stats.diagnosis[row.description]) {
                  stats.diagnosis[row.description] += 1;
                } else {
                  stats.diagnosis[row.description] = 1;
                }
                const index = stats.diagnosisList.findIndex(
                  (i) => i.id == row.id
                );
                if (index === -1) {
                  stats.diagnosisList.push({
                    id: row.id,
                    description: row.description,
                    quantity: 1,
                  });
                } else {
                  ++stats.diagnosisList[index].quantity;
                }
              }
            }
          }
        }
      }

      if (item.mprocedure && item.mprocedure.length) {
        item.mprocedure = JSON.parse(item.mprocedure);
        if (item.mprocedure.length) {
          if (first2) {
            for (let i = 0; i < item.mprocedure.length; i++) {
              const row = item.mprocedure[i];
              if (row.description) {
                if (stats.mprocedure[row.description]) {
                  stats.mprocedure[row.description] += 1;
                } else {
                  stats.mprocedure[row.description] = 1;
                }
                const index = stats.mprocedureList.findIndex(
                  (i) => i.id === row.id
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
      }

      if (item.treatment && item.treatment.length) {
        item.treatment = JSON.parse(item.treatment);
        if (item.treatment.length) {
          if (first2) {
            for (let i = 0; i < item.treatment.length; i++) {
              const row = item.treatment[i];

              if (row) {
                if (row.description) {
                  if (stats.treatment[row.description]) {
                    stats.treatment[row.description] += 1;
                  } else {
                    stats.treatment[row.description] = 1;
                  }
                  const index = stats.treatmentList.findIndex(
                    (i) => i.id === row.id
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
        }
      }
    }

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, total, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    let stats = {
      vitalsign: {},
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.history_date && _date.isValidDate(item.history_date)) {
        item.history_date_format = _date.intlDate(item.history_date);
      }

      const data = {
        weight: +item.weight,
        blood_pressure: +item.blood_pressure,
        breathing: +item.breathing,
        pulse: +item.pulse,
        oxygen_saturation: +item.oxygen_saturation,
      };

      if (item.blood_pressure) {
        data.blood_pressure_format = item.blood_pressure + " mmHg";
      }
      if (item.breathing) {
        data.breathing_format = item.breathing + " rpm";
      }
      if (item.pulse) {
        data.pulse_format = item.pulse + " lpm";
      }
      if (item.pulse) {
        data.pulse_format = item.pulse + " lpm";
      }
      if (item.oxygen_saturation) {
        data.oxygen_saturation_format = item.oxygen_saturation + "%";
      }

      if (stats.vitalsign[item.history_date_format]) {
        stats.vitalsign[item.history_date_format] = { ...data };
      } else {
        stats.vitalsign[item.history_date_format] = { ...data };
      }
    }

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

router.get("/diagnosis", async function (req, res, next) {
  try {
    const user = res.locals.user;
    let { items } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    if (items.length) {
      const item = items[0];
      item.diagnosis = JSON.parse(item.diagnosis);
      return res.status(200).json(item.diagnosis);
    }
    return res.status(200).json([]);
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

      if (item.birthdate && _date.isValidDate(item.birthdate)) {
        item.age = _date.calculateReadableAge(item.birthdate);
        item.birthdate = _date.intlDate(item.birthdate);
      }

      if (item.history_date && _date.isValidDate(item.history_date)) {
        item.history_date_format = _date.intlDateTime(item.history_date);
        item.history_date = _date.intlDate(item.history_date);
      }

      item.sequence = String(item.code).substring(1);

      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis);
      } else {
        item.diagnosis = []
      }

      if (item.treatment) {
        item.treatment = JSON.parse(item.treatment);
      } else {
        item.treatment = []
      }

      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure);
      } else {
        item.mprocedure = []
      }

      if (item.diagnosis_history_ids) {
        item.diagnosis_history_ids = JSON.parse(item.diagnosis_history_ids);
        item.diagnosis_history = JSON.parse(item.diagnosis_history);
      } else {
        item.diagnosis_history_ids = []
        item.diagnosis_history = []
      }
      if (item.procedure_history_ids) {
        item.procedure_history_ids = JSON.parse(item.procedure_history_ids);
        item.procedure_history = JSON.parse(item.procedure_history);
      } else {
        item.procedure_history_ids = []
        item.procedure_history = []
      }

      prepareVitalSignal(item);

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
      item.birthdate = _date.intlDate(item.birthdate);
    }

    item.sequence = String(item.code).substring(1);

    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis);
    }
    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure);
    }
    if (item.diagnosis_history_ids) {
      item.diagnosis_history_ids = JSON.parse(item.diagnosis_history_ids);
      item.diagnosis_history = JSON.parse(item.diagnosis_history);
    }
    if (item.procedure_history_ids) {
      item.procedure_history_ids = JSON.parse(item.procedure_history_ids);
      item.procedure_history = JSON.parse(item.procedure_history);
    }

    prepareVitalSignal(item);

    item.file = await _query.getPDF({
      ref_id: item.id,
      ref_key: table,
    });

    item.history_date = _date.intlDate(item.history_date);
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
    data.html = _utility.addNbspToEmptyPTags(data.html);

    if (data.birthdate) {
      data.birthdate_valid = _date.convertToValidDate(data.birthdate);
      data.birthdate = _date.mysqlDateTime(data.birthdate_valid);
      data.age = _date.calculateReadableAge(data.birthdate);
    }

    if (data.history_date) {
      data.history_date_valid = _date.convertToValidDate(data.history_date);
      data.history_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.history_date_valid)
      );
    } else {
      data.history_date = null;
    }

    Object.assign(data, {
      doctor_id: user.id,
      doctor_description: user.description,
      exequatur: user.exequatur,
      diagnosis: data.diagnosis ? data.diagnosis : [],
      diagnosis_ids: data.diagnosis?.length
        ? data.diagnosis.map((i) => i.id)
        : [],
      diagnosis_history_ids: data.diagnosis_history_ids
        ? data.diagnosis_history_ids
        : [],
      mprocedure: data.mprocedure ? data.mprocedure : [],
      procedure_history_ids: data.procedure_history_ids
        ? data.procedure_history_ids
        : [],
      treatment: data.treatment ? data.treatment : [],
      treatment_history_ids: data.treatment_history_ids
        ? data.treatment_history_ids
        : [],
    });

    prepareHistory(data);

    const response = await _query.insert({
      user,
      table,
      data,
    });

    _query.update({
      id: data.patient_id,
      user,
      table: "t_patient",
      data: {
        diagnosis: data.diagnosis ? data.diagnosis : [],
        diagnosis_ids: data.diagnosis?.length
          ? data.diagnosis.map((i) => i.id)
          : [],
        mprocedure: data.mprocedure ? data.mprocedure : [],
        treatment: data.treatment ? data.treatment : [],
      },
    });

    data.birthdate_format = _date.intlDate(data.birthdate_valid);
    data.history_date_format = _date.intlDate(data.history_date_valid);

    const category = await _query.getCategoryById(data.$sex_id);
    if (category?.id) {
      data.sex = category.description;
    }

    prepareVitalSignal(data);

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
      footer: false,
      margin: {
        top: "200px",
        bottom: "20px",
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
        description: `HISTORIA-${data.patient_description}-${data.history_date_format}`,
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
    console.log(error);
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

router.put("/:id", async function (req, res) {
  try {

    const user = res.locals.user;
    const account = res.locals.account;
    const data = req.body;
    data.html = _utility.addNbspToEmptyPTags(data.html);

    if (data.birthdate) {
      data.birthdate_valid = _date.convertToValidDate(data.birthdate);
      data.birthdate = _date.mysqlDateTime(data.birthdate_valid);
      data.age = _date.calculateReadableAge(data.birthdate);
    }

    if (data.history_date) {
      data.history_date_valid = _date.convertToValidDate(data.history_date);
      data.history_date = _date.mysqlDateTime(
        _date.addCurrentTimeToDate(data.history_date_valid)
      );
    } else {
      data.history_date = null;
    }

    Object.assign(data, {
      doctor_id: data.doctor_id ? data.doctor_id : user.id,
      doctor_description: data.doctor_description ? data.doctor_description : user.description,
      exequatur: user.exequatur,
      diagnosis: data.diagnosis ? data.diagnosis : [],
      treatment: data.treatment ? data.treatment : [],
      diagnosis_history_ids: data.diagnosis_history_ids
        ? data.diagnosis_history_ids
        : [],
      diagnosis_ids: data.diagnosis?.length
        ? data.diagnosis.map((i) => i.id)
        : [],
      procedure_history_ids: data.procedure_history_ids
        ? data.procedure_history_ids
        : [],
      treatment_history_ids: data.treatment_history_ids
        ? data.treatment_history_ids
        : [],
    });

    prepareHistory(data);

    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
    });

    _query.update({
      id: data.patient_id,
      user,
      table: "t_patient",
      data: {
        diagnosis: data.diagnosis ? data.diagnosis : [],
        diagnosis_ids: data.diagnosis?.length
          ? data.diagnosis.map((i) => i.id)
          : [],
        treatment: data.treatment ? data.treatment : [],
      },
    });

    data.birthdate_format = _date.intlDate(data.birthdate_valid);
    data.history_date_format = _date.intlDate(data.history_valid);

    prepareVitalSignal(data);

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
      footer: false,
      margin: {
        top: "200px",
        bottom: "20px",
        right: "0",
        left: "0",
      },
    });

    const { items: files } = await _query.getRows({
      user,
      table: "t_file",
      query: {
        where: {
          c_status: 4,
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
          description: `HISTORIA-${data.patient_description}-${_date.intlDate(
            data.history_date_valid
          )}`,
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
          description: `HISTORIA-${data.patient_description}-${data.history_date_format}`,
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

    req.io.emit("update", {
      table,
      id: req.params.id,
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
