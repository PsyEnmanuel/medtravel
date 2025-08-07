import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _utility, _comunication, _stats } from "../helpers/index.js";
import pool from "../databases/main.js";
const router = express.Router();
const table = "t_event";

router.use(isAuthenticated);

router.get("/stats", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    let stats = {
      c: {
        pregnant: 0,
        quantity: 0,
        sex: {
          men: 0,
          women: 0,
        },
        ageRange: {},
        eventType: {},
        eventState: {},
        users: {},
        providers: {},
        diagnosis: {},
        countries: {},
        cities: {},
      },
      e: {
        quantity: 0,
        pregnant: 0,
        sex: {
          men: 0,
          women: 0,
        },
        ageRange: {},
        eventType: {},
        eventState: {},
        users: {},
        providers: {},
        diagnosis: {},
        countries: {},
        cities: {},
      },
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis);
      }

      if (item.$event_type_id === 178) {
        if (item.$sex_id) {
          if (item.$sex_id === 5) {
            stats.sex.men++;
          }
          if (item.$sex_id === 6) {
            stats.sex.women++;
          }
        }

        if (item.birthdate) {
          let age = _date.calculateAge(item.birthdate);
          if (age) {
            _stats.setAgeStats(stats.c, age)
          }
        }
        if (stats.c.users[item.user_description]) {
          ++stats.c.users[item.user_description];
        } else {
          stats.c.users[item.user_description] = 1;
        }

        if (stats.c.eventState[item.event_state]) {
          ++stats.c.eventState[item.event_state];
        } else {
          stats.c.eventState[item.event_state] = 1;
        }

        if (stats.c.eventType[item.event_type]) {
          ++stats.c.eventType[item.event_type];
        } else {
          stats.c.eventType[item.event_type] = 1;
        }

        if (item.provider_description) {
          if (stats.c.providers[item.provider_description]) {
            ++stats.c.providers[item.provider_description];
          } else {
            stats.c.providers[item.provider_description] = 1;
          }
        }

        if (item.country) {
          if (stats.c.countries[item.country]) {
            ++stats.c.countries[item.country];
          } else {
            stats.c.countries[item.country] = 1;
          }
        }

        if (item.city) {
          if (stats.c.cities[item.city]) {
            ++stats.c.cities[item.city];
          } else {
            stats.c.cities[item.city] = 1;
          }
        }

        if (item.diagnosis) {
          for (let i = 0; i < item.diagnosis.length; i++) {
            const row = item.diagnosis[i];
            if (stats.c.diagnosis[row.code]) {
              ++stats.c.diagnosis[row.code].quantity
            } else {
              stats.c.diagnosis[row.code] = {
                description: row.description,
                code: row.code,
                quantity: 1
              }
            }
          }
        }

        if (item.pregnant) {
          ++stats.c.pregnant;
        }

        ++stats.c.quantity

        continue;
      }

      if (item.$event_type_id === 176) {
        if (item.$sex_id === 5) {
          stats.e.sex.men++;
        }
        if (item.$sex_id === 6) {
          stats.e.sex.women++;
        }

        if (item.birthdate) {
          let age = _date.calculateAge(item.birthdate);
          if (age) {
            _stats.setAgeStats(stats.e, age)
          }
        }
        if (stats.e.users[item.user_description]) {
          ++stats.e.users[item.user_description];
        } else {
          stats.e.users[item.user_description] = 1;
        }

        if (stats.e.eventState[item.event_state]) {
          ++stats.e.eventState[item.event_state];
        } else {
          stats.e.eventState[item.event_state] = 1;
        }

        if (stats.e.eventType[item.event_type]) {
          ++stats.e.eventType[item.event_type];
        } else {
          stats.e.eventType[item.event_type] = 1;
        }

        if (item.provider_description) {
          if (stats.e.providers[item.provider_description]) {
            ++stats.e.providers[item.provider_description];
          } else {
            stats.e.providers[item.provider_description] = 1;
          }
        }

        if (item.country) {
          if (stats.e.countries[item.country]) {
            ++stats.e.countries[item.country];
          } else {
            stats.e.countries[item.country] = 1;
          }
        }

        if (item.city) {
          if (stats.e.cities[item.city]) {
            ++stats.e.cities[item.city];
          } else {
            stats.e.cities[item.city] = 1;
          }
        }

        if (item.diagnosis) {
          for (let i = 0; i < item.diagnosis.length; i++) {
            const row = item.diagnosis[i];
            if (stats.e.diagnosis[row.code]) {
              ++stats.e.diagnosis[row.code].quantity
            } else {
              stats.e.diagnosis[row.code] = {
                description: row.description,
                code: row.code,
                quantity: 1
              }
            }
          }
        }

        if (item.pregnant) {
          ++stats.e.pregnant;
        }

        ++stats.e.quantity

        continue;
      }

    }

    stats.c.eventStateList = Object.keys(stats.c.eventState).reduce((acc, curr) => {
      acc.push({
        value: stats.c.eventState[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.c.providerList = Object.keys(stats.c.providers).reduce((acc, curr) => {
      acc.push({
        value: stats.c.providers[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.c.countryList = Object.keys(stats.c.countries).reduce((acc, curr) => {
      acc.push({
        value: stats.c.countries[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.c.cityList = Object.keys(stats.c.cities).reduce((acc, curr) => {
      acc.push({
        value: stats.c.cities[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);


    stats.c.diagnosisList = Object.keys(stats.c.diagnosis).reduce((acc, curr) => {
      acc.push({
        value: stats.c.diagnosis[curr].quantity,
        label: `[${stats.c.diagnosis[curr].code}] ${stats.c.diagnosis[curr].description}`,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.c.eventTypeList = Object.keys(stats.c.eventType).reduce((acc, curr) => {
      acc.push({
        value: stats.c.eventType[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.c.users = Object.keys(
      _utility.sortObjectByValue(stats.c.users)
    ).reduce((acc, curr) => {
      acc.push({
        value: stats.c.users[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.e.eventStateList = Object.keys(stats.e.eventState).reduce((acc, curr) => {
      acc.push({
        value: stats.e.eventState[curr],
        label: curr,
      });
      return acc;
    }, [])

    stats.e.providerList = Object.keys(stats.e.providers).reduce((acc, curr) => {
      acc.push({
        value: stats.e.providers[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.e.countryList = Object.keys(stats.e.countries).reduce((acc, curr) => {
      acc.push({
        value: stats.e.countries[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.e.cityList = Object.keys(stats.e.cities).reduce((acc, curr) => {
      acc.push({
        value: stats.e.cities[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.e.eventTypeList = Object.keys(stats.e.eventType).reduce((acc, curr) => {
      acc.push({
        value: stats.e.eventType[curr],
        label: curr,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.e.diagnosisList = Object.keys(stats.e.diagnosis).reduce((acc, curr) => {
      acc.push({
        value: stats.e.diagnosis[curr].quantity,
        label: `[${stats.e.diagnosis[curr].code}] ${stats.e.diagnosis[curr].description}`,
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    stats.e.users = Object.keys(
      _utility.sortObjectByValue(stats.e.users)
    ).reduce((acc, curr) => {
      acc.push({
        value: stats.e.users[curr],
        label: curr,
      });
      return acc;
    }, []);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

async function getEventColor(catId) {
  const [cat] = await pool.query(`select color from t_category where id=?`, [catId])
  return cat.color;
}

async function updateInsured(data, user) {
  try {
    if (data.insured_id) {
      if (data.provider_id && data.provider_id) {
        const index = data.insured_provider.findIndex(i => parseInt(i.id) === parseInt(data.provider_id))

        if (index === -1) {
          data.insured_provider.push({
            id: String(data.provider_id),
            description: data.provider_description,
            MRN: data.MRN
          })
        } else {
          data.insured_provider[index] = {
            id: String(data.provider_id),
            description: data.provider_description,
            MRN: data.MRN
          }
        }
      }

      await _query.update({
        id: data.insured_id,
        user,
        table: 't_insured',
        data: {
          provider: data.insured_provider,
          phone: data.phone,
          email: data.email,
          address: data.address,
        },
        log: true
      });
    }
  } catch (error) {
    console.log(error);
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
        columns: req.query?.join?.length ? `GROUP_CONCAT(DISTINCT doctor_description SEPARATOR '|') AS doctor_description` : '',
      },
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.attendance_datetime && item.attendance_datetime !== '0000-00-00 00:00:00') {
        item.start = item.attendance_datetime;
        item.end = item.attendance_datetime;
        item.start_readable = _date.intlReadbleDate(item.attendance_datetime);
        item.start_calendar = _date.formatDateTime(item.attendance_datetime);

        item.attendance_date = _date.intlDate(item.attendance_datetime);
        item.attendance_time = _date.intlTime(item.attendance_datetime);
        item.attendance_datetime = _date.intlDateTime(item.attendance_datetime)
      }
      if (item.request_date) {
        item.request_date_format = _date.intlReadbleDate(item.request_date);
      }

      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis)
      }

      if (item.doctor_description) {
        item.doctor_description = item.doctor_description.split("|");
      }

      if (item.presumptive_diagnosis) {
        item.presumptive_diagnosis = JSON.parse(item.presumptive_diagnosis)
      }

      if (item.desirable_dates) {
        item.desirable_dates = JSON.parse(item.desirable_dates)
      }

      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure);
      }

      if (item.pending_list) {
        item.pending_list = JSON.parse(item.pending_list)
      }

      if (item.event_state_time) {
        item.event_state_time = JSON.parse(item.event_state_time)
      }

      if (item.policy) {
        item.policy = JSON.parse(item.policy)
      }

      item.created_format = _date.intlDateTime(item.created);
      if (item.modified) {
        item.modified_format = _date.intlDateTime(item.modified);
      }
      if (item.cancelled_date) {
        item.cancelled_date_format = _date.intlDateTime(item.cancelled_date);
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
      query: {
        where: {
          'bi:c_status': 7
        }
      }
    });

    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis)
    }

    if (item.presumptive_diagnosis) {
      item.presumptive_diagnosis = JSON.parse(item.presumptive_diagnosis)
    }

    if (item.desirable_dates) {
      item.desirable_dates = JSON.parse(item.desirable_dates)
    }

    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure)
    }

    if (item.itinerary) {
      item.itinerary = JSON.parse(item.itinerary)
    }

    if (item.policy) {
      item.policy = JSON.parse(item.policy)
    }

    if (item.event_state_time) {
      item.event_state_time = JSON.parse(item.event_state_time)
    }

    if (item.request_date) {
      item.request_date = _date.intlDate(item.request_date)
    }

    if (item.pregnant_start) {
      item.pregnant_start = _date.intlDate(item.pregnant_start)
    }

    if (item.pending_list) {
      item.pending_list = JSON.parse(item.pending_list)
    }

    if (item.attendance_datetime) {
      item.attendance_date = _date.intlDate(item.attendance_datetime);
      item.attendance_time = _date.intlTime(item.attendance_datetime);
      item.attendance_time_format = _date.getAMPMFromDate(item.attendance_datetime)
      item.attendance_datetime = _date.intlDateTime(item.attendance_datetime)
    }

    item.created_format = _date.intlDateTime(item.created);
    if (item.modified) {
      item.modified_format = _date.intlDateTime(item.modified);
    }
    if (item.cancelled_date) {
      item.cancelled_date_format = _date.intlDateTime(item.cancelled_date);
    }

    item.files = await _query.getFiles({
      ref_id: item.id,
      ref_key: table,
    });



    if (item.files) {

      item.HIPAA_file = item.files.filter(i => {
        if (i.file_type === 'HIPAA') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");

      item.ROI_file = item.files.filter(i => {
        if (i.file_type === 'ROI') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");

      item.VOB_file = item.files.filter(i => {
        if (i.file_type === 'VOB') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");

      item.NOTAS_MEDICAS_file = item.files.filter(i => {
        if (i.file_type === 'NOTAS MÉDICAS') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");

      item.medical_guide_file = item.files.filter(i => {
        if (i.file_type === 'GUÍA MÉDICA') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");

    }

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let response;
    const user = res.locals.user;
    const data = req.body;
    data.code = await _query.getCode({ table });

    if (data.request_date) {
      data.request_date = _date.mysqlDateTime(_date.convertToValidDate(data.request_date))
    } else {
      data.request_date = null
    }

    if (data.cancelled_date) {
      data.cancelled_date = _date.mysqlDateTime(_date.convertToValidDate(data.cancelled_date))
    } else {
      data.cancelled_date = null
    }

    if (data.pregnant_start) {
      data.pregnant_start = _date.mysqlDateTime(_date.convertToValidDate(data.pregnant_start))
    } else {
      data.pregnant_start = null
    }

    updateInsured(data, user)

    data.color = await getEventColor(data.$event_state_id);

    response = await _query.insert({
      user,
      table,
      data: {
        ...data,
        copay: _utility.cleanCurrency(data.copay),
        coinsurance: _utility.cleanCurrency(data.coinsurance),
        deductible: _utility.cleanCurrency(data.deductible),
      },
      log: true
    });

    for (let i = 0; i < data.itinerary.length; i++) {
      const itinerary = data.itinerary[i];

      if (!itinerary.attendance_date || !itinerary.attendance_time) {
        throw new BaseError(
          "NO DATA UPDATED",
          401,
          true,
          `Es requerida la fecha en el itinerario.`,
          `Es requerida la fecha en el itinerario.`
        );
      }

      if (!_utility.isValidDate(itinerary.attendance_date) || !_utility.isValidTime(itinerary.attendance_time)) {
        throw new BaseError(
          "NO DATA UPDATED",
          401,
          true,
          `Es requerida la fecha en el itinerario.`,
          `Es requerida la fecha en el itinerario.`
        );
      }

    }

    for (let i = 0; i < data.itinerary.length; i++) {
      const itinerary = data.itinerary[i];
      itinerary.event_id = response.id;

      if (itinerary.attendance_time) {
        itinerary.attendance_time = itinerary.attendance_time.replace(/\s?[ap]\.\sm\.$/, '').trim();
      }

      if (itinerary.attendance_date && itinerary.attendance_time) {
        itinerary.attendance_datetime = _date.mergeDateAndTime(itinerary.attendance_date, itinerary.attendance_time, itinerary.attendance_time_format);
      } else {
        itinerary.attendance_datetime = null
      }

      itinerary.code = await _query.getCode({ table: 't_itinerary' });

      await _query.insert({
        user,
        table: 't_itinerary',
        data: itinerary
      });
    }

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

router.put("/sort/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data: {
        sort: data.sort,
      },
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

router.put("/general/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;


    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data: {
        ...data,
      },
      options: {
        modified: false
      }
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

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    console.log(9);

    if (data.request_date) {
      data.request_date = _date.mysqlDateTime(_date.convertToValidDate(data.request_date))
    } else {
      data.request_date = null
    }

    if (data.cancelled_date) {
      data.cancelled_date = _date.mysqlDateTime(_date.convertToValidDate(data.cancelled_date))
    } else {
      data.cancelled_date = null
    }

    if (data.pregnant_start) {
      data.pregnant_start = _date.mysqlDateTime(_date.convertToValidDate(data.pregnant_start))
    } else {
      data.pregnant_start = null
    }

    updateInsured(data, user)

    data.color = await getEventColor(data.$event_state_id);

    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data: {
        ...data,
        copay: _utility.cleanCurrency(data.copay),
        deductible: _utility.cleanCurrency(data.deductible),
      },
      log: true
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
