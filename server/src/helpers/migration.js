import express from "express";
import path from "path";
import { isAuthenticated } from "../middleware/auth.js";
import { _query, _date, _utility } from "../helpers/index.js";
import { format, getDaysInMonth, setDate, isEqual, setYear, isValid } from "date-fns";
import languages from "../data/languages.js"

const router = express.Router();
const table = "t_policy";

router.use(isAuthenticated);

import excelToJson from "convert-excel-to-json";
import pool from "../databases/main.js";
import pool_global from "../databases/global.js";

const validValues = ["Compañero De Vida", "Conyuge", "Conyugue", "Familiar", "Hija", "Hijastra", "Hijo", "Titular"];

(async function () {
  try {
    const items = await pool.query(`select * from t_insured where c_status=4`)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // console.log(item.policies);
      if (!item.policies) {

        const [p] = await pool.query(`select * from t_policy where insured_id=?`, [item.id])

        if (!p) {
          // console.log(1, p);
          // console.log(1, item.created, item.created_by);
        } else {
          const [event] = await pool.query(`select * from t_event where insured_id=?`, [item.id])
          if(event) {
            console.log(1, event, event.insured);
          } else {
            // await pool.query(`update t_insured set c_status=1 where id=?`, [item.id])
          }
        }
        console.log(item.id);
      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
});

function filterValidValues(validValues, inputString) {
  // Normalize valid values and create a mapping to their original forms
  const normalizedMap = new Map(validValues.map((val) => [_utility.normalizeString(val), val]));

  // Normalize input string
  const normalizedInput = _utility.normalizeString(inputString);

  // Create a regex pattern to match normalized valid values
  const pattern = new RegExp([...normalizedMap.keys()].join("|"), "gi");

  // Match only valid words/phrases in normalized input
  const matches = normalizedInput.match(pattern);

  // Map normalized matches back to original valid values
  return matches ? matches.map((match) => normalizedMap.get(match)).join(" ") : "";
}

(async function () {
  try {
    const items = await pool.query(`select * from t_doctor`)

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // if(i) {
      //   continue;
      // }
      const match = item.lastname.normalize().match(/^([^,]+),\s*(.+)$/);
      const match2 = item.description.normalize().match(/^([^,]+),\s*(.+)$/);
      if (match) {
        const lastname = match[1]
        const description = match2[1]
        const postnominal = match[2].split(',')

        if (postnominal) {
          if (postnominal.length) {
            for (let j = 0; j < postnominal.length; j++) {
              const p = postnominal[j];

              const [exist] = await pool.query(`SELECT * FROM t_category WHERE description=? AND parent_id=? AND c_status=4`, [p, 194]);

              if (exist) {
                continue;
              } else {

                await _query.insert({
                  user: {
                    id: 1,
                    description: 'IMPORT',
                    account_id: 1,
                    unixroles: 1
                  },
                  table: 't_category',
                  data: {
                    description: p,
                    parent_id: 194,
                    level: 1,
                  },
                });
              }

            }
            const _postnominal = await pool.query(`select * from t_category where description IN (?)`, [postnominal]);

            if (postnominal) {
              item.$postnominal_ids = _postnominal.map(i => i.id);
              item.postnominal = _postnominal.map(i => i.description);
              const response = await pool.query(`update t_doctor set lastname=?, $postnominal_ids=?, postnominal=?, description=? WHERE id=?`, [lastname, JSON.stringify(item.$postnominal_ids), JSON.stringify(item.postnominal), description, item.id])
            }
          }
        }
      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
});

function transformPolicyBranch(policy_branch) {

  const value = policy_branch.toUpperCase().trim(); // Normalize case and trim spaces
  const extracted = [];

  if (value.includes("LOCAL")) extracted.push("LOCAL");
  if (value.includes("INTERNACIONAL")) extracted.push("INTERNACIONAL");

  return extracted;
}

const fixCode = (code) => {
  if (code.length > 3 && code[3] !== '.') {
    return code.slice(0, 3) + '.' + code.slice(3);
  }
  return code;
};

(async function () {
  try {
    const user = {
      id: 1,
      description: 'IMPORT',
      unixroles: 1
    }
    // const columnsKeys = ["id", "code", "level", "description", "description2"];

    // const excel = excelToJson({
    //   header: {
    //     rows: 1,
    //   },
    //   columnToKey: _utility.mapColumnsToLetters(columnsKeys),
    //   sourceFile: path.join(path.resolve(), 'src/ICD10.xlsx'),
    // });

    // const [sheet] = Object.keys(excel);

    // const items = excel[sheet];

    // for (let i = 0; i < items.length; i++) {
    //   const item = items[i];
    //   item.code = fixCode(item.code)
    //   console.log(item.code);
    //   await _query.insert({
    //     user,
    //     table: "t_ICD10",
    //     data: item
    //   })
    // }

    const events = await pool.query(`select * from t_event`)
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(1);
      if (event.diagnosis) {

        const diagnosis = JSON.parse(event.diagnosis)
        // console.log(diagnosis);
        for (let j = 0; j < diagnosis.length; j++) {
          const diag = diagnosis[j];
          const [icd] = await pool.query(`select * from t_ICD10 where code=?`, [diag.code])
          if (icd) {
            diagnosis[j].id = String(icd.id)
          }
        }
        await pool.query(`update t_event set diagnosis=? where id=?`, [JSON.stringify(diagnosis), event.id])

        const presumptive_diagnosis = JSON.parse(event.presumptive_diagnosis)
        for (let j = 0; j < presumptive_diagnosis.length; j++) {
          const diag = presumptive_diagnosis[j];
          const [icd] = await pool.query(`select * from t_ICD10 where code=?`, [diag.code])
          if (icd) {
            presumptive_diagnosis[j].id = String(icd.id)
          }
        }
        await pool.query(`update t_event set presumptive_diagnosis=? where id=?`, [JSON.stringify(presumptive_diagnosis), event.id])
      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
});

export async function t_policy(options) {
  try {
    const _items = [];

    const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];

    const excel = excelToJson({
      header: {
        rows: 1,
      },
      columnToKey: _utility.mapColumnsToLetters(columnsKeys),
      sourceFile: path.resolve(options?.url),
    });

    const [sheet] = Object.keys(excel);

    const items = excel[sheet];

    items.sort((a, b) => {
      const aType = a.insured_type.toLowerCase();
      const bType = b.insured_type.toLowerCase();
      if (aType === 'titular' && bType !== 'titular') return -1;
      if (aType !== 'titular' && bType === 'titular') return 1;
      return 0;
    });



    console.log(items);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // console.log(item);
      const [exist] = await pool.query(`SELECT * FROM t_policy WHERE policy_number=? AND insured_code=? AND c_status=4`, [item.policy_number, item.insured_code]);

      if (exist) {
        continue;
      }

      item.insurance = options.insurance;
      item.insurance_id = options.insurance_id;

      if (item.relationship) {
        item.relationship = _utility.fixString(item.relationship);
      }

      if (item.titular_description) {
        item.titular_description = _utility.fixString(item.titular_description);
      }

      if (item.ident_no) {
        item.ident_no = _utility.fixString(item.ident_no);
      }

      if (item.sex) {
        item.sex = _utility.fixString(item.sex);
      }


      if (item.relationship) {
        if (item.relationship.toUpperCase().includes("Hijo(a)".toUpperCase())) {
          if (item.sex === "F") {
            item.relationship = "Hija";
          }
          if (item.sex === "M") {
            item.relationship = "Hijo";
          }
        }
        if (["esposo", "esposa", "conyuge", "conyugue"].includes(item.relationship.toLowerCase())) {
          item.relationship = "Conyugue";
        }
        const [relationship_cat] = await pool.query(`select * from t_category where description=?`, [item.relationship]);
        if (relationship_cat) {
          item.$relationship_id = relationship_cat.id;
          item.relationship = relationship_cat.description;
        }
      }

      if (item.policy_branch) {


        const [policy_branch_cat] = await pool.query(`select * from t_category where description=?`, [item.policy_branch]);
        if (policy_branch_cat) {
          item.$policy_branch_id = policy_branch_cat.id;
          item.policy_branch = policy_branch_cat.description;
        }

      }

      if (item.insured_type) {
        const [insured_type_cat] = await pool.query(`select * from t_category where description=?`, [item.insured_type]);
        if (insured_type_cat) {
          item.$insured_type_id = insured_type_cat.id;
          item.insured_type = insured_type_cat.description;
        }
      }

      if (item.policy_type) {
        const [policy_type_cat] = await pool.query(`select * from t_category where description=?`, [item.policy_type]);
        if (policy_type_cat) {
          item.$policy_type_id = policy_type_cat.id;
          item.policy_type = policy_type_cat.description;
        }
      }

      if (item.frequency) {
        const [frequency_cat] = await pool.query(`select * from t_category where description=?`, [item.frequency]);
        if (frequency_cat) {
          item.$frequency_id = frequency_cat.id;
          item.frequency = frequency_cat.description;
        }
      }

      if (item.sex) {
        item.$sex_id = item.sex === "M" ? 5 : 6;
        const [sex_cat] = await pool.query(`select * from t_category where id=?`, [item.$sex_id]);
        if (sex_cat) {
          item.$sex_id = sex_cat.id;
          item.sex = sex_cat.description;
        }
      }

      if (item.ident_no) {
        item.ident_no = item.ident_no.replace(/\s\D/g, "");

        if (item.ident_no.length !== 11) {
          item.ident_no = _utility.padToEleven(item.ident_no);
        }
        let [cedulado] = await pool_global.query(`SELECT * FROM t_cedulados WHERE Cedula=? LIMIT 1`, [item.ident_no]);

        if (cedulado) {
          item.$ident_type_id = 7;
          item.birthdate = _date.mysqlDateTime(cedulado.FechaNacimiento);
          item.$sex_id = cedulado.IdSexo === "M" ? 5 : cedulado.IdSexo === "F" ? 6 : null;
          item.firstname = `${cedulado.Nombres}`;
          item.lastname = `${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`;
          item.fullname = `${item.firstname} ${item.lastname}`;
        }
      }

      if (item.birthdate) {
        item.age = _date.calculateReadableAge(item.birthdate);
      }

      const data = {
        // code: await _query.getCode({ table: 't_policy' }),
        customer_description: item.customer_description,
        policy_number: item.policy_number,
        policy_branch: item.policy_branch,
        $policy_branch_id: item.$policy_branch_id || 163,
        insured_code: item.insured_code,
        insured_code_unique: item.insured_code_unique,
        insured_unique_code: item.insured_unique_code,
        insured_type: item.insured_type,
        $insured_type_id: item.$insured_type_id,
        relationship: item.relationship,
        $relationship_id: item.$relationship_id,
        titular_description: item.titular_description.trim(),
        insured_description: item.insured_description.trim(),
        sex: item.sex,
        $sex_id: item.$sex_id,
        frequency: item.frequency,
        $frequency_id: item.$frequency_id,
        $ident_type_id: item.$ident_type_id,
        age: item.age,
        insurance: item.insurance,
        insurance_id: item.insurance_id,
        insurance_plan: item.insurance_plan,
        insurance_plan_type: item.insurance_plan_type,
        $policy_type_id: item.$policy_type_id,
        policy_type: item.policy_type,
        birthdate: item.birthdate,
        birthdate_format: format(item.birthdate, "dd-MM-yyyy"),
        firstname: item.firstname,
        lastname: item.lastname,
        fullname: `${item.fullname || item.insured_description}`,
        ident_no: item.ident_no,
        intermediary: "Matos Corredores De Seguros Srl",
        international_manager: null,
        agency_manager: null,
        director: null,
        validity_date_start: isValid(item.validity_date_start) ? format(item.validity_date_start, 'yyyy-MM-dd') : '',
        validity_date_end: isValid(item.validity_date_end) ? format(item.validity_date_end, 'yyyy-MM-dd') : '',
        deductible: item.deductible,
      };

      _items.push(data);
    }

    return _items;
  } catch (error) {
    console.log(error);
  }
}

export async function insertPolicy(items, user) {
  try {

    let customer_obj = {};
    let policy_number = null;
    let response_customer;
    for (let i = 0; i < items.length; i++) {
      let response_insured;
      const item = items[i];

      const code = await _query.getCode({ table: "t_policy" });
      const response = await _query.insert({
        user,
        table: "t_policy",
        data: { ...item, code },
      });

      const _data = {
        policies: [
          {
            policy_id: String(response.id),
            policy_number: String(item.policy_number),
            insured_code: String(item.insured_code),
            insurance_id: String(item.insurance_id),
            insurance: String(item.insurance),
          },
        ],
        firstname: item.firstname,
        lastname: item.lastname,
        fullname: `${item.fullname || item.insured_description}`,
        $sex_id: item.$sex_id,
        $ident_type_id: item.$ident_type_id,
        ident_no: item.ident_no,
        birthdate: item.birthdate,
        age: item.age,
      };


      if (item.ident_no) {
        const [exist] = await pool.query(`SELECT * FROM t_insured WHERE ident_no=? AND c_status=4`, [item.ident_no]);
        if (exist) {
          response_insured = exist
        }
      }

      if (!response_insured) {
        _data.code = await _query.getCode({ table: "t_insured" });
        response_insured = await _query.insert({
          user,
          table: "t_insured",
          data: _data,
        });
      } else {
        const [_insured] = await pool.query(`SELECT * FROM t_insured WHERE id=? AND c_status=4`, [response_insured.id]);
        if (_insured.policies) {
          _insured.policies = JSON.parse(_insured.policies);
          _insured.policies.concat(_data.policies)
          await pool.query(`update t_insured set policies=? where id=?`, [JSON.stringify(_insured.policies), _insured.id])
        }
      }

      if (!customer_obj[item.customer_description]) {
        policy_number = item.policy_number;

        if (item.ident_no) {
          const [exist] = await pool.query(`SELECT * FROM t_customer WHERE policy_number=? AND c_status=4`, [item.policy_number]);

          if (exist) {
            response_customer = exist
          }
        }

        if (!response_customer) {
          const __data = {
            code: await _query.getCode({ table: "t_customer" }),
            policy_number: item.policy_number,
            description: item.customer_description,
          };
          response_customer = await _query.insert({
            user,
            table: "t_customer",
            data: __data,
          });
        }

        customer_obj[item.customer_description] = 1;
      }

      const [titular] = await pool.query(`select * from t_insured where fullname=?`, [item.titular_description.trim()]);
      if (!titular) {
        await _query.update({
          id: response.id,
          user,
          table: "t_policy",
          data: {
            insured_id: response_insured.id,
            titular_id: response_insured.id,
            insured_description: `${item.fullname || item.insured_description}`,
            customer_id: response_customer.id,
          },
        });
      } else {
        await _query.update({
          id: response.id,
          user,
          table: "t_policy",
          data: {
            insured_id: response_insured.id,
            insured_description: `${item.fullname || item.insured_description}`,
            titular_id: titular.id,
            titular_description: titular.fullname,
            customer_id: response_customer.id,
          },
        });
      }
    }

    // const colectives = await pool.query(`SELECT policy_number, COUNT(*) as count
    //                                         FROM t_policy
    //                                         GROUP BY policy_number
    //                                         HAVING COUNT(*) > 1;`);

    // for (let i = 0; i < colectives.length; i++) {
    //   const colective = colectives[i];

    //   await pool.query(`update t_policy set policy_branch="Colectivo", $policy_branch_id=162 where policy_number=? and insurance_id=?`, [colective.policy_number, _item.insurance_id]);
    // }

    return true;
  } catch (error) {
    console.log(error);
  }
}

export async function t_provider(options = { url: null }) {
  try {
    const _items = [];

    const columnsKeys = ["description", "provider_type", "ambassador", "ident_no", "phone", "webpage", "address", "city", "state", "zipcode", "country", "", "link_gps"];

    const excel = excelToJson({
      header: {
        rows: 1,
      },
      columnToKey: _utility.mapColumnsToLetters(columnsKeys),
      sourceFile: path.resolve(options?.url),
    });

    const [sheet] = Object.keys(excel);

    const items = excel[sheet];

    for (let i = 1; i < items.length; i++) {
      const item = items[i];

      const code = await _query.getCode({ table: 't_provider' });


      if (item.description) {

        const [exist] = await pool.query(`SELECT * FROM t_provider WHERE description=? AND c_status=4`, [item.description]);

        if (exist) {
          continue;
        }

        if (item.provider_type) {
          const [cat] = await pool.query(`SELECT * FROM t_category WHERE description=?`, [item.provider_type])
          item.$provider_type_id = cat.id
        }

        const [country] = await pool_global.query(`SELECT * FROM countries WHERE iso3=? or translations LIKE ?`, [item.country, `%${item.country}%`]);
        const translation = JSON.parse(country.translations)
        if (item.state === 'PENSILVANIA') {
          item.state = 'PENNSYLVANIA'
        }
        const [state] = await pool_global.query(`SELECT * FROM states WHERE name=?`, [item.state]);

        if (item.city === 'NEW YORK') {
          item.city = 'New York City'
        }
        const [city] = await pool_global.query(`SELECT * FROM cities WHERE name=?`, [item.city.trim()]);

        if (item.ambassador === 'NO') {
          item.ambassador = 0
        } else {
          item.ambassador = 1
        }

        const data = {
          code: code,
          description: item.description,
          ident_no: item.ident_no,
          ambassador: item.ambassador,
          provider_type: item.provider_type,
          $provider_type_id: item.$provider_type_id,
          country_id: country.id,
          country: translation.es,
          state_id: state && state.id,
          state: state && state.name,
          city_id: city && city.id,
          city: city && city.name,
          phone: item.phone,
          webpage: item.webpage,
          link_gps: item.link_gps,
          zipcode: item.zipcode,
          address: item.address,
          imported: 0
        };

        _items.push(data);
      }


    }
    console.log(1, _items);
    return _items;
  } catch (error) {
    console.log(error);
  }
}

export async function t_doctor(options = { url: null }) {
  try {
    const _items = [];

    const columnsKeys = ["firstname", "lastname", "description", "email", "languages", "exequatur", "attention_type", "sex", "bio", "provider_ids", "speciality", "subspecialities_ids"];

    const excel = excelToJson({
      header: {
        rows: 1,
      },
      columnToKey: _utility.mapColumnsToLetters(columnsKeys),
      sourceFile: path.resolve(options?.url),
    });

    const [sheet] = Object.keys(excel);

    const items = excel[sheet];

    for (let i = 1; i < items.length; i++) {
      const item = items[i];

      const [exist] = await pool.query(`SELECT * FROM t_doctor WHERE description=? AND c_status=4`, [item.description]);

      if (exist) {
        continue;
      }

      if (item.firstname) {
        const code = await _query.getCode({ table: 't_doctor' });

        const match = item.lastname.normalize().match(/^([^,]+),\s*(.+)$/);
        const match2 = item.description.normalize().match(/^([^,]+),\s*(.+)$/);
        if (match) {
          item.lastname = match[1]
          item.description = match2[1]
          const postnominal = match[2].split(',')

          if (postnominal) {
            if (postnominal.length) {
              for (let j = 0; j < postnominal.length; j++) {
                const p = postnominal[j];

                const [exist] = await pool.query(`SELECT * FROM t_category WHERE description=? AND parent_id=? AND c_status=4`, [p, 194]);

                if (exist) {
                  continue;
                } else {
                  await _query.insert({
                    user: {
                      id: 1,
                      description: 'IMPORT',
                      account_id: 1,
                      unixroles: 1
                    },
                    table: 't_category',
                    data: {
                      description: p,
                      parent_id: 194,
                      level: 1,
                    },
                  });
                }

              }
              const _postnominal = await pool.query(`select * from t_category where description IN (?)`, [postnominal]);

              if (postnominal) {
                item.$postnominal_ids = _postnominal.map(i => i.id);
                item.postnominal = _postnominal.map(i => i.description);
              }
            }
          }
        }

        if (item.sex == 'M') {
          item.sex = 5
        } else if (item.sex == 'F') {
          item.sex = 6
        }

        if (item.attention_type) {
          item.attention_type = ['JOVENES', 'ADULTOS', 'GERIATRICOS', 'NINOS', 'PEDIATRICO'].filter(i => {
            return _utility.normalizeString(item.attention_type).includes(i)
          });
          if (item.attention_type.length) {
            const attention_type = await pool.query(`select * from t_category where description IN (?)`, [item.attention_type]);

            if (attention_type) {
              item.$attention_type_ids = attention_type.map(i => i.id);
              item.attention_type = attention_type.map(i => i.description);
            }
          }
        }


        if (item.provider_ids) {
          const [provider] = await pool.query(`SELECT * FROM t_provider WHERE description=?`, [item.provider_ids])
          if (provider) {
            item.provider = [{
              id: String(provider.id),
              description: provider.description
            }]
          } else {
            item.provider = []
          }
        }

        if (item.speciality) {
          const [speciality] = await pool.query(`SELECT * FROM t_speciality WHERE description=?`, [item.speciality.trim()])
          if (speciality) {
            speciality.sub = JSON.parse(speciality.sub)
            item.speciality = [{
              id: String(speciality.id),
              description: speciality.description,
              sub: speciality.sub.map((i, index) => {
                return {
                  checked: 0,
                  description: i.description
                }
              })
            }]
          }
        }

        if (item.insured_type) {
          const [insured_type_cat] = await pool.query(`select * from t_category where description=?`, [item.insured_type]);
          if (insured_type_cat) {
            item.$insured_type_id = insured_type_cat.id;
            item.insured_type = insured_type_cat.description;
          }
        }

        if (item.languages) {
          item.languages = item.languages.replace(/ENGLISH/g, 'INGLÉS')
          item.languages = item.languages.replace(/SPANISH/g, 'ESPAÑOL')
          item.languages = item.languages.replace(/FRENCH/g, 'FRANCES')
          item.languages = item.languages.replace(/GERMAN/g, 'ALEMAN')


          const lang = languages.filter(i => i.available).filter(i => {
            return _utility.normalizeString(item.languages).includes(_utility.normalizeString(i.label))
          }).map(i => i)
          if (lang) {
            item.language_ids = lang.map(i => i.value)
            item.language = lang.map(i => i.label)
          }
        }

        const [exist] = await pool.query(`SELECT * FROM t_doctor WHERE firstname=? AND lastname=? AND c_status=4`, [item.firstname, item.lastname]);

        if (exist) {
          continue;
        }

        const data = {
          code: code,
          firstname: item.firstname,
          lastname: item.lastname,
          description: `${item.firstname} ${item.lastname}`,
          email: item.email,
          language_ids: item.language_ids,
          language: item.language,
          exequatur: item.exequatur,
          $sex_id: item.$sex_id,
          bio: item.bio,
          provider: item.provider,
          speciality: item.speciality,
          $attention_type_ids: item.$attention_type_ids,
          attention_type: item.attention_type,
          $postnominal_ids: item.$postnominal_ids,
          postnominal: item.postnominal,
          languages: item.language || item.languages,
          note: item.note,
          imported: 1
        };

        _items.push(data);

      }

    }

    return _items;
  } catch (error) {
    console.log(error);
  }
}

async function fixDependants(insurance_id) {
  try {
    const policies = await pool.query(`select * from t_policy where insured_type="Titular" and insurance_id=?`, insurance_id);

    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];

      if (insurance_id === 11) {
        const [dependant] = await pool.query(`select * from t_policy where policy_number=? and $insured_type_id=164`, [policy.policy_number]);
        if (dependant) {
          console.log(policy.policy_number);
          // console.log(dependant);
          // console.log(1, dependant.id, dependant.titular_id, policy.titular_id);

          // await pool.query(`update t_policy set titular_id=? where id=?`, [policy.titular_id, dependant.id])
        }
      } else {
        const [dependant] = await pool.query(`select * from t_policy where insured_code=? and policy_number=? and $insured_type_id=164`, [policy.insured_code, policy.policy_number]);
        if (dependant) {
          // console.log(dependant);
          // console.log(1, dependant.id, dependant.titular_id, policy.titular_id);

          // await pool.query(`update t_policy set titular_id=? where id=?`, [policy.titular_id, dependant.id])
        }
      }

    }

    console.log(1, 'complete');
  } catch (error) {
    console.log(error);
  }
}

async function fixInsured() {
  try {

    const user = {
      id: 1,
      description: 'IMPORT',
      unixroles: 1
    }

    const policies = await pool.query(`select * from t_policy where insured_id=176 and insurance_id=35`);

    const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];

    const excel = excelToJson({
      header: {
        rows: 1,
      },
      columnToKey: _utility.mapColumnsToLetters(columnsKeys),
      sourceFile: path.resolve('src/AETNA.xlsx'),
    });

    const [sheet] = Object.keys(excel);

    const items = excel[sheet];

    let count = 0
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];
      const [insured] = await pool.query(`select * from t_insured where fullname=?`, [policy.insured_description]);
      if (!insured) {
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          if (!+item.ident_no) {
            if (policy.insured_description === item.insured_description) {
              console.log(count++);
              const _data = {
                policies: [
                  {
                    policy_id: policy.id,
                    policy_number: item.policy_number,
                    insured_code: item.insured_code,
                    insurance_id: String(item.insurance_id),
                    insurance: item.insurance,
                  },
                ],
                firstname: item.firstname,
                lastname: item.lastname,
                fullname: `${item.fullname || item.insured_description}`,
                $sex_id: item.$sex_id,
                $ident_type_id: item.$ident_type_id,
                ident_no: item.ident_no,
                birthdate: item.birthdate,
                age: item.age,
              };

              _data.code = await _query.getCode({ table: "t_insured" });

              console.log(count);

              const response_insured = await _query.insert({
                user,
                table: "t_insured",
                data: _data,
              });

              await pool.query(`update t_policy set insured_id=? where id=?`, [response_insured.id, policy.id])
            }
          }
        }
      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
}

function splitFullName(fullName) {
  // Normalize spaces around the comma
  fullName = fullName.replace(/\s*,\s*/g, ", ");

  // Split into parts and trim spaces
  const [lastName, firstName] = fullName.split(", ").map(s => s.trim());

  return { firstName, lastName };
}

async function fixCommaInNames() {
  try {
    const insured_items = await pool.query(`select * from t_insured`)

    for (let i = 0; i < insured_items.length; i++) {
      const insured = insured_items[i];

      if (insured.fullname.includes(",")) {
        const { firstName, lastName } = splitFullName(insured.fullname)

        await pool.query(`update t_insured set fullname=?, firstname=?, lastname=? where id=?`, [`${firstName} ${lastName}`, firstName, lastName, insured.id])

      }
    }

    const event_items = await pool.query(`select * from t_event`)

    for (let i = 0; i < event_items.length; i++) {
      const event = event_items[i];

      if (event.insured?.includes(",")) {
        const { firstName, lastName } = splitFullName(event.insured)

        await pool.query(`update t_event set insured=? where id=?`, [`${firstName} ${lastName}`, event.id])

      }
    }

    const customer_items = await pool.query(`select * from t_customer`)

    for (let i = 0; i < customer_items.length; i++) {
      const customer = customer_items[i];

      if (customer.description?.includes(",")) {
        const { firstName, lastName } = splitFullName(customer.description)

        await pool.query(`update t_customer set description=? where id=?`, [`${firstName} ${lastName}`, customer.id])

      }
    }

    const policy_items = await pool.query(`select * from t_policy`)

    for (let i = 0; i < policy_items.length; i++) {
      const policy = policy_items[i];

      if (policy.insured_description?.includes(",")) {

        const { firstName, lastName } = splitFullName(policy.insured_description)

        await pool.query(`update t_policy set insured_description=? where id=?`, [`${firstName} ${lastName}`, policy.id])

      }

      if (policy.customer_description?.includes(",")) {

        const { firstName, lastName } = splitFullName(policy.customer_description)

        await pool.query(`update t_policy set customer_description=? where id=?`, [`${firstName} ${lastName}`, policy.id])

      }
      if (policy.titular_description?.includes(",")) {

        const { firstName, lastName } = splitFullName(policy.titular_description)

        await pool.query(`update t_policy set titular_description=? where id=?`, [`${firstName} ${lastName}`, policy.id])

      }
    }

    console.log('complete');
  } catch (error) {
    console.log(error);
  }
}

async function RemovePolizaVida() {
  try {
    const items = await pool.query(`select * from t_policy where insurance_id=32 and c_status=4`)
    // console.log(1, items);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.policy_number.includes('VT')) {
        await pool.query(`update t_policy set c_status=1 where id=?`, [item.id])
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// fixCommaInNames()
// fixInsured()
// fixDependants(11)
RemovePolizaVida()
