import express from "express";

import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _utility } from "../helpers/index.js";
import { format, getDaysInMonth, setDate, isEqual, setYear } from "date-fns";
import pool from "../databases/main.js";

const router = express.Router();
const table = "t_policy";

router.use(isAuthenticated);

router.get("/stats", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    const days = getDaysInMonth(new Date());
    const days_array = Array.apply(null, { length: days })
      .map((i, index) => index + 1)
      .map((i) => {
        const day = format(setDate(new Date(), i), "dd-MM-yyyy");
        return day;
      })
      .reduce((acc, curr) => {
        acc[curr] = 0;
        return acc;
      }, {});

    let stats = {
      quantity: 0,
      sex: {
        men: 0,
        women: 0,
      },
      ages_range: {
        "0/10": [],
        "10/20": [],
        "20/30": [],
        "30/40": [],
        "40/50": [],
        "50/70": [],
        "70/+": [],
      },
      eventType: {},
      insurance: {},
      customerList: {},
      amountList: [],
    };
    items.forEach((item) => {

      if (item.$sex_id === 5) {
        stats.sex.men++;
      }
      if (item.$sex_id === 6) {
        stats.sex.women++;
      }

      if (item.birthdate) {
        let age = _date.calculateAge(item.birthdate);
        if (age) {
          switch (true) {
            case age > 0 && age <= 10:
              stats.ages_range["0/10"].push(age);
              break;
            case age > 10 && age <= 20:
              stats.ages_range["10/20"].push(age);
              break;
            case age > 20 && age <= 30:
              stats.ages_range["20/30"].push(age);
              break;
            case age > 30 && age <= 40:
              stats.ages_range["30/40"].push(age);
              break;
            case age > 40 && age <= 50:
              stats.ages_range["40/50"].push(age);
              break;
            case age > 50 && age <= 70:
              stats.ages_range["50/70"].push(age);
              break;
            case age > 70:
              stats.ages_range["70/+"].push(age);
              break;
          }
        }
      }

      if (stats.customerList[item.customer_description]) {
        ++stats.customerList[item.customer_description];
      } else {
        stats.customerList[item.customer_description] = 1;
      }

      if (stats.insurance[item.insurance]) {
        ++stats.insurance[item.insurance];
      } else {
        stats.insurance[item.insurance] = 1;
      }

      if (stats.eventType[item.event_type]) {
        ++stats.eventType[item.event_type];
      } else {
        stats.eventType[item.event_type] = 1;
      }
    });

    stats.insuranceList = Object.keys(stats.insurance).reduce((acc, curr) => {
      acc.push({
        value: stats.insurance[curr],
        label: curr,
      });
      return acc;
    }, []);

    stats.eventTypeList = Object.keys(stats.eventType).reduce((acc, curr) => {
      acc.push({
        value: stats.eventType[curr],
        label: curr,
      });
      return acc;
    }, []);

    stats.customerList = Object.keys(
      _utility.sortObjectByValue(stats.customerList)
    ).reduce((acc, curr) => {
      acc.push({
        value: stats.customerList[curr],
        label: curr,
      });
      return acc;
    }, []);

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

      if (item.birthdate && _date.isValidDate(item.birthdate)) {
        item.age = _date.calculateReadableAge(item.birthdate);
        item.birthday = _date.isBirthday(item.birthdate);
        item.birthdate = _date.intlDate(item.birthdate);
      }

      if (item.validity_date_start && _date.isValidDate(item.validity_date_start)) {
        item.validity_date_start = _date.intlDate(item.validity_date_start);
      }

      if (item.validity_date_end && _date.isValidDate(item.validity_date_end)) {
        item.validity_date_end = _date.intlDate(item.validity_date_end);
      }

      if (item.insurances) {
        item.insurances = JSON.parse(item.insurances);
      } else {
        item.insurances = [];
      }

      if (item.contacts) {
        item.contacts = JSON.parse(item.contacts);
      } else {
        item.contacts = [];
      }

      item.record_format = _utility.separatedByComma(item.code, item.age);
      item.location_format = _utility.separatedByComma(item.country, item.state, item.city);

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

router.get("/insured", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, total, sql } = await _query.getRows({
      table: 't_policy_insured',
      user,
      query: req.query,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

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

    if (item.validity_date_start && _date.isValidDate(item.validity_date_start)) {
      item.validity_date_start = _date.intlDate(item.validity_date_start);
    }

    if (item.validity_date_end && _date.isValidDate(item.validity_date_end)) {
      item.validity_date_end = _date.intlDate(item.validity_date_end);
    }

    if (item.renewal_date && _date.isValidDate(item.renewal_date)) {
      item.renewal_date = _date.intlDate(item.renewal_date);
    }

    if (item.insurances) {
      item.insurances = JSON.parse(item.insurances);
    } else {
      item.insurances = [];
    }

    if (item.contacts) {
      item.contacts = JSON.parse(item.contacts);
    } else {
      item.contacts = [];
    }

    item.files = await _query.getFiles({
      ref_id: item.id,
      ref_key: table,
    });

    if (item.modified) {
      item.modified_format = _date.intlDateTime(item.modified);
    }
    item.created_format = _date.intlDateTime(item.created);

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.get("/insured/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;

    const item = await _query.getRowById({
      id: req.params.id,
      table: 't_policy_insured',
      user,
    });

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
    const data = req.body;

    data.code = await _query.getCode({ table });

    if (data.validity_date_start) {
      data.validity_date_start = _date.mysqlDateTime(
        _date.convertToValidDate(data.validity_date_start)
      );
    } else {
      data.validity_date_start = null
    }

    if (data.validity_date_end) {
      data.validity_date_end = _date.mysqlDateTime(
        _date.convertToValidDate(data.validity_date_end)
      );
    } else {
      data.validity_date_end = null
    }

    if (data.deductible) {
      data.deductible = _utility.cleanCurrency(data.deductible)
    }

    const response = await _query.insert({
      user,
      table,
      data,
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

router.post("/insured", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const response = await _query.insert({
      user,
      table: 't_policy_insured',
      data,
    });

    const insured = await _query.getRowById({
      id: data.insured_id,
      table: "t_insured",
      user
    })

    if (insured) {
      if (insured.policies) {
        insured.policies = JSON.parse(insured.policies)
      } else {
        insured.policies = []
      }

      const policy = await _query.getRowById({
        id: data.policy_id,
        user,
        table: "t_policy"
      })

      insured.policies.push(
        {
          "policy_id": String(data.policy_id),
          "policy_number": String(policy.policy_number),
          "insured_code": data.insured_code,
          "insurance_id": String(policy.insurance_id),
          "insurance": policy.insurance
        }
      );

      await pool.query(`UPDATE t_insured SET policies=? WHERE id=?`, [JSON.stringify(insured.policies), insured.id])
    }

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

router.put("/:id", async function (req, res) {
  try {
    const user = res.locals.user;
    const data = req.body;

    if (data.birthdate) {
      data.birthdate = _date.mysqlDateTime(
        _date.convertToValidDate(data.birthdate)
      );
    } else {
      data.birthdate = null
    }

    if (data.validity_date_start) {
      data.validity_date_start = _date.mysqlDateTime(
        _date.convertToValidDate(data.validity_date_start)
      );
    } else {
      data.validity_date_start = null
    }

    if (data.validity_date_end) {
      data.validity_date_end = _date.mysqlDateTime(
        _date.convertToValidDate(data.validity_date_end)
      );
    } else {
      data.validity_date_end = null
    }

    if (data.deductible) {
      data.deductible = _utility.cleanCurrency(data.deductible)
    }

    const response = await _query.update({
      id: req.params.id,
      user,
      table,
      data,
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

router.put("/insured/:id", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.body;

    const response = await _query.update({
      id: req.params.id,
      user,
      table: 't_policy_insured',
      data,
    });

    const insured = await _query.getRowById({
      id: data.insured_id,
      table: "t_insured",
      user
    })

    if (insured) {
      if (insured.policies) {
        insured.policies = JSON.parse(insured.policies)
        const index = insured.policies.findIndex(i => {
          return i.policy_id == data.policy_id
        })

        const policy = await _query.getRowById({
          id: data.policy_id,
          user,
          table: "t_policy"
        })

        insured.policies[index] =
        {
          "policy_id": String(data.policy_id),
          "policy_number": String(policy.policy_number),
          "insured_code": data.insured_code,
          "insurance_id": String(policy.insurance_id),
          "insurance": policy.insurance
        };
      }
      await pool.query(`UPDATE t_insured SET policies=? WHERE id=?`, [JSON.stringify(insured.policies), insured.id])
    }

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
