import express, { response } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { BaseError } from "../utils/errors.js";
import { _query, _date, _utility } from "../helpers/index.js";
import pool from "../databases/main.js";
const router = express.Router();
const table = "t_insured";

router.use(isAuthenticated);

async function checkIfinsuredExist(user, data) {
  if (data.ident_no) {
    const { items, total, sql } = await _query.getRows({
      table,
      user,
      query: {
        where: {
          ident_no: data.ident_no,
          c_status: 4,
        },
      },
    });

    if (items.length) {
      return true;
    }
    return false;
  }
}

async function insertPolicyDependant(user, id, data) {

  if (!data.policy_number || !data.titular_id || !data.insurance_id || !id) {
    return null;
  }

  const [policy] = await pool.query(`select * from t_policy where policy_number=? and insurance_id=? and c_status=4 and relationship='Titular' and titular_id=?`, [data.policy_number, data.insurance_id, data.titular_id])

  if (!policy) {
    return null;
  }
  const dat = {
    insured_id: id,
    insured_description: data.fullname,
    insured_code: data.insured_code,
    $relationship_id: data.$relationship_id,
    customer_id: policy.customer_id,
    customer_description: policy.customer_description,
    titular_id: policy.titular_id,
    titular_description: policy.titular_description,
    policy_number: policy.policy_number,
    $insured_type_id: 164,
    insurance: policy.insurance,
    insurance_id: policy.insurance_id,
    frequency: policy.frequency,
    $frequency_id: policy.$frequency_id,
    renewal_date: policy.renewal_date,
    insurance_plan: policy.insurance_plan,
    insurance_plan_type: policy.insurance_plan_type,
    $policy_branch_id: policy.$policy_branch_id,
    $policy_type_id: policy.$policy_type_id,
    intermediary: policy.intermediary,
    international_manager: policy.international_manager,
    agency_manager: policy.agency_manager,
    director: policy.director,
    deductible: policy.deductible,
    validity_date_start: policy.validity_date_start,
    validity_date_end: policy.validity_date_end,
    contacts: policy.contacts,
  }

  dat.code = await _query.getCode({ table: 't_policy' });

  const response = await _query.insert({
    user,
    table: 't_policy',
    data: dat,
  });

  if (response) {

    const policies = [{
      "id": String(response.id),
      "policy_number": String(dat.policy_number),
      "insured_code": String(dat.insured_code),
      "insurance_id": String(dat.insurance_id),
      "insurance": String(dat.insurance)
    }]

    await pool.query(`UPDATE t_insured SET policies=? WHERE id=?`, [JSON.stringify(policies), id])

    return true
  } else {
    return null;
  }
}

function getInverseRelationship(selectedDescription, $sex_id = null) {
  const normalized = selectedDescription.trim().toUpperCase();

  const relationshipMap = {
    "HIJA": ["PADRE", "MADRE"],
    "HIJO": ["PADRE", "MADRE"],
    "HIJASTRA": ["PADRE", "MADRE"],
    "PADRE": ["HIJA", "HIJO"],
    "MADRE": ["HIJA", "HIJO"],
    "HERMANX": ["HERMANX"],
    "CÓNYUGE": ["CÓNYUGE"],
    "COMPAÑERO DE VIDA": ["COMPAÑERO DE VIDA"],
    "PRIMO HERMANO": ["PRIMO HERMANO"],
    "TITULAR": ["TITULAR"],
    "FAMILIAR": ["FAMILIAR"],
    "TÍX": ["SOBRINX"],
    "TÍX MATERNX": ["SOBRINX"],
    "TÍX PATERNO": ["SOBRINX"]
  };

  const possibleInverses = relationshipMap[normalized];

  if (!possibleInverses) {
    console.warn(`Relación no reconocida: ${selectedDescription}`);
    return selectedDescription; // fallback: retorna la misma
  }

  if (possibleInverses.length === 1) {
    return possibleInverses[0];
  }

  if ($sex_id) {
    if ($sex_id === 5 && possibleInverses.includes("PADRE")) return "PADRE";
    if ($sex_id === 6 && possibleInverses.includes("MADRE")) return "MADRE";
    if ($sex_id === 5 && possibleInverses.includes("HIJO")) return "HIJO";
    if ($sex_id === 6 && possibleInverses.includes("HIJA")) return "HIJA";
  }

  // Si no se puede determinar por sexo, devuelve la primera opción
  return possibleInverses[0];
}

router.get("/stats", async function (req, res, next) {
  try {
    const user = res.locals.user;

    let { items, sql } = await _query.getRows({
      table,
      user,
      query: req.query,
    });

    let stats = {
      sex: {},
      ages_range: {
        "0/10": [],
        "10/20": [],
        "20/30": [],
        "30/40": [],
        "40/50": [],
        "50/70": [],
        "70/+": [],
      },
      insurances: {}
    };

    items.forEach((item) => {

      if (item.sex) {
        if (stats.sex[item.sex]) {
          stats.sex[item.sex]++;
        } else {
          stats.sex[item.sex] = 1;
        }
      }

      if (item.policies) {
        item.policies = JSON.parse(item.policies)
        for (let j = 0; j < item.policies.length; j++) {
          const policy = item.policies[j];
          if(!policy.insurance) {
            continue;
          }
          if (policy.insurance !== null) {
            if (stats.insurances[policy.insurance]) {
              stats.insurances[policy.insurance] += 1
            } else {
              stats.insurances[policy.insurance] = 1
            }
          }
        }

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

      if (item.birthdate && _date.isValidDate(item.birthdate)) {
        item.age = _date.calculateReadableAge(item.birthdate);
        item.birthday = _date.isBirthday(item.birthdate);
        item.birthdate = _date.intlDate(item.birthdate);
      }

      if (item.insurances) {
        item.insurances = JSON.parse(item.insurances);
      } else {
        item.insurances = [];
      }

      if (item.provider) {
        item.provider = JSON.parse(item.provider);
      } else {
        item.provider = [];
      }

      if (item.relations) {
        item.relations = JSON.parse(item.relations);
      } else {
        item.relations = [];
      }

      if (item.language_ids) {
        item.language_ids = JSON.parse(item.language_ids)
        item.language = JSON.parse(item.language)
      } else {
        item.language_ids = []
        item.language = []
      }

      const { items: policies } = await _query.getRows({
        auth: 0,
        user,
        table: 't_policy',
        query: {
          groupBy: ["t_policy.id"],
          join: [{ table: 't_policy_insured', relationA: 't_policy_insured.policy_id', relationB: 't_policy.id' }],
          where: {
            insured_id: item.id,
            't_policy_insured.c_status': 4
          }
        }
      })

      item.policies = policies

      item.record_format = _utility.separatedByComma(item.code, item.age);
      item.location_format = _utility.separatedByComma(item.country, item.state, item.city);

      if (item.modified) {
        item.modified_format = _date.intlDateTime(item.modified);
      }
      item.created_format = _date.intlDateTime(item.created);

      item.files = await _query.getFiles({
        ref_id: item.id,
        ref_key: table,
      });

      if (item.files) {
        item.profile = item.files.filter(i => {
          if (i.file_type === 'FOTO PERFIL') {
            return true
          } else {
            return false
          }
        }).reduce((acc, curr) => {
          return curr
        }, "");
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

router.get("/exist", async function (req, res, next) {
  try {
    const user = res.locals.user;
    const data = req.query;

    const exist = await checkIfinsuredExist(user, data);

    if (exist) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with ident: ${data.ident_no} exist.`,
        `El asegurado con cédula ${data.ident_no} ya existe`
      );
    } else {
      return res.json(false);
    }
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
      item.birthday = _date.isBirthday(item.birthdate);
      item.birthdate = _date.intlDate(item.birthdate);
    }

    if (item.insurances) {
      item.insurances = JSON.parse(item.insurances);
    } else {
      item.insurances = [];
    }

    if (item.language_ids) {
      item.language_ids = JSON.parse(item.language_ids)
      item.language = JSON.parse(item.language)
    } else {
      item.language_ids = []
      item.language = []
    }

    const { items: policies } = await _query.getRows({
      user,
      table: 't_policy',
      query: {
        groupBy: ["t_policy.id"],
        join: [{ table: 't_policy_insured', relationA: 't_policy_insured.policy_id', relationB: 't_policy.id' }],
        where: {
          insured_id: item.id,
          't_policy_insured.c_status': 4
        }
      }
    })

    item.policies = policies

    if (item.provider) {
      item.provider = JSON.parse(item.provider);
    } else {
      item.provider = [];
    }

    if (item.relations) {
      item.relations = JSON.parse(item.relations);
    } else {
      item.relations = [];
    }

    item.files = await _query.getFiles({
      ref_id: item.id,
      ref_key: table,
    });

    if (item.files) {
      item.profile = item.files.filter(i => {
        if (i.file_type === 'FOTO PERFIL') {
          return true
        } else {
          return false
        }
      }).reduce((acc, curr) => {
        return curr
      }, "");
    }

    if (item.modified) {
      item.modified_format = _date.intlDateTime(item.modified);
    }
    item.created_format = _date.intlDateTime(item.created);

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

function removeusingSet(arr) {
  let outputArray = Array.from(new Set(arr));
  return outputArray;
}

router.post("/merge", async function (req, res, next) {
  try {
    const data = removeusingSet(req.body.data);
    const user = res.locals.user;

    let item = await _query.getRowById({
      id: data[0],
      table,
      user,
    });

    let policies = []

    for (let i = 1; i < data.length; i++) {
      const d = data[i];

      let newItem = await _query.getRowById({
        id: d,
        table,
        user,
      });

      if (item.ident_no) {
        item.ident_no = item.ident_no.replace(/\D/g, "");
      }
      if (newItem.ident_no) {
        newItem.ident_no = newItem.ident_no.replace(/\D/g, "");
      }

      await pool.query(
        `UPDATE t_event SET insured_id=? WHERE insured_id=?`,
        [item.id, d]
      );

      await pool.query(
        `UPDATE t_policy SET insured_id=?, insured_description=? WHERE insured_id=?`,
        [item.id, item.fullname, d]
      );

      await _query.update({
        user,
        id: d,
        table: "t_insured",
        data: {
          c_status: 1,
        },
      });
    }


    const { items: _policies } = await _query.getRows({
      user,
      table: 't_policy',
      query: {
        where: {
          insured_id: item.id,
          c_status: 4
        },
      }
    })

    item.policies = _policies

    for (let i = 0; i < _policies.length; i++) {
      const item = _policies[i];
      policies.push({
        policy_id: String(item.id),
        policy_number: String(item.policy_number),
        insured_code: String(item.insured_code),
        insurance_id: String(item.insurance_id),
        insurance: String(item.insurance),
      })

      await _query.update({
        authenticate: 0,
        user,
        id: item.id,
        table: "t_insured",
        data: {
          policies: policies,
        },
      });

    }

    req.io.emit("update", {
      table,
      item: data,
      id: response.id
    });

    res.status(200).json(true);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/", async function (req, res, next) {
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

    data.code = await _query.getCode({ table });
    if (data.firstname && data.lastname) {
      data.fullname = `${data.firstname} ${data.lastname}`.trim()
    }

    if (data.ident_no) {
      const exist = await checkIfinsuredExist(user, data);

      if (exist) {
        throw new BaseError(
          "NOT FOUND",
          404,
          true,
          `User with ident: ${data.ident_no} exist.`,
          `El asegurado con cédula ${data.ident_no} ya existe`
        );
      }
    }

    const response = await _query.insert({
      user,
      table,
      data,
    });

    await insertPolicyDependant(user, response.id, data)

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

    if (data.firstname && data.lastname) {
      data.fullname = `${data.firstname} ${data.lastname}`.trim()
    }

    if (data.relations) {
      for (let i = 0; i < data.relations.length; i++) {
        const relation = data.relations[i];

        if (relation.$relationship_id) {
          const cat_desc = await _query.getCategoryDescriptionById(relation.$relationship_id);

          if (cat_desc) {
            const rel = getInverseRelationship(cat_desc, data.$sex_id);
            const [cat_rel] = await pool.query(`SELECT * FROM t_category WHERE description=? AND parent_id=? AND c_status=4`, [rel, 151])
            if (cat_rel) {
              const [insured] = await pool.query(`SELECT * FROM t_insured WHERE id=? AND c_status=4`, [relation.id]);

              if (insured) {
                const dat_rel = {
                  id: String(req.params.id),
                  description: data.fullname,
                  $relationship_id: String(cat_rel.id),
                  relationship: rel
                }
                if (!insured.relations || !insured.relations.length) {
                  insured.relations = [dat_rel]
                } else {
                  insured.relations = JSON.parse(insured.relations)
                  const index = insured.relations.findIndex(i => req.params.id === i.id);

                  if (index !== -1) {
                    insured.relations[index] = dat_rel
                  } else {
                    insured.relations.push(dat_rel)
                  }
                }

                await pool.query(`UPDATE t_insured SET relations=? WHERE id=? AND c_status=4`, [JSON.stringify(insured.relations), insured.id]);
              }
            }
          }
        }
      }
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

      const { items: events } = await _query.getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            insured_id: id,
          },
        },
      });

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await _query.update({
          user,
          id: event.id,
          table: "t_event",
          data: { insured_id: null },
        });
      }
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
