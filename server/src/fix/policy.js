import excelToJson from 'convert-excel-to-json';
import pool from "../databases/main.js";
import pool_global from "../databases/global.js";
import path from "path";
import { _date, _query, _utility } from '../helpers/index.js';

function fixString(str) {
    // Convert the entire string to lowercase first
    let correctedStr = str.toLowerCase();

    // Replace the incorrect character with 'ñ'
    correctedStr = correctedStr.replace('?', 'ñ');

    // Capitalize the first letter of each word
    correctedStr = correctedStr.replace(/(?:^|\s)\S/g, function (char) {
        return char.toUpperCase();
    });

    return correctedStr;
}

async function provider() {
    try {

        const user = {
            id: 1,
            description: 'IMPORT',
            account_id: 1,
            unixroles: 1
        }

        const excel = excelToJson({
            sourceFile: path.resolve('../server/src/provider.xlsx'),
        });

        const items = excel.Sheet1;

        for (let i = 1; i < items.length; i++) {
            const item = items[i];

            const code = await _query.getCode({ table: 't_provider' });

            const [cat] = await pool.query(`SELECT * FROM t_category WHERE description=?`, [item['B']])

            if (item['A']) {

                const [country] = await pool_global.query(`SELECT * FROM countries WHERE iso3=? or translations LIKE ?`, [item['K'], `%${item['K']}%`]);
                const translation = JSON.parse(country.translations)
                if (item['I'] === 'PENSILVANIA') {
                    item['I'] = 'PENNSYLVANIA'
                }
                const [state] = await pool_global.query(`SELECT * FROM states WHERE name=?`, [item['I']]);

                if (item['H'] === 'NEW YORK') {
                    item['H'] = 'New York City'
                }
                const [city] = await pool_global.query(`SELECT * FROM cities WHERE name=?`, [item['H'].trim()]);

                if (item['C'] === 'NO') {
                    item['C'] = 0
                } else {
                    item['C'] = 1
                }

                await _query.insert({
                    user,
                    table: 't_provider',
                    data: {
                        code: code,
                        description: item['A'],
                        ident_no: item['D'],
                        ambassador: item['C'],
                        $provider_type_id: cat.id,
                        country_id: country.id,
                        country: translation.es,
                        state_id: state && state.id,
                        state: state && state.name,
                        city_id: city && city.id,
                        city: city && city.name,
                        phone: item['E'],
                        webpage: item['F'],
                        link_gps: item['M'],
                        zip_code: item['J'],
                        address: item['G'],
                    },
                });

            }

        }

        console.log('complete');
    } catch (error) {
        console.log(error);
    }
}

async function doctor() {
    try {
        await pool.query(`TRUNCATE TABLE t_doctor`)
        const user = {
            id: 1,
            description: 'IMPORT',
            account_id: 1,
            unixroles: 1
        }

        const excel = excelToJson({
            sourceFile: path.resolve('../server/src/doctor.xlsx'),
        });

        const items = excel.Sheet1;

        for (let i = 1; i < items.length; i++) {
            const item = items[i];

            const code = await _query.getCode({ table: 't_doctor' });

            if (item['H'] == 'M') {
                item['H'] = 5
            } else if (item['H'] == 'F') {
                item['H'] = 6
            }


            if (item['G']) {

                if (item['G'] === 'JÓVENES Y ADULTOS') {
                    item['G'] = [185, 182]
                }
                if (item['G'] === 'ADULTOS, GERIÁTRICOS') {
                    item['G'] = [182, 186]
                }
                if (item['G'] === 'ADULTOS') {
                    item['G'] = [182]
                }
                if (item['G'] === 'PEDIÁTRICO') {
                    item['G'] = [184]
                }
                if (item['G'] === 'PEDIÁTRICO Y ADULTOS') {
                    item['G'] = [184, 182]
                }
            }

            if (item['J']) {
                const [provider] = await pool.query(`SELECT * FROM t_provider WHERE description=?`, [item['J']])
                if (provider) {
                    item['J'] = [{
                        id: String(provider.id),
                        description: provider.description
                    }]
                } else {
                    item.note = item['J']
                    item['J'] = []
                }
            }

            if (item['K']) {
                const [speciality] = await pool.query(`SELECT * FROM t_speciality WHERE description=?`, [item['K'].trim()])
                if (speciality) {
                    speciality.sub = JSON.parse(speciality.sub)
                    item['K'] = [{
                        id: String(speciality.id),
                        description: speciality.description,
                        sub: speciality.sub.map((i, index) => {
                            return {
                                checked: 0,
                                description: i.description
                            }
                        })
                    }]
                } else {
                    console.log(item['K']);
                }
            }

            if (item['A']) {
                await _query.insert({
                    user,
                    table: 't_doctor',
                    data: {
                        code: code,
                        firstname: item['A'],
                        lastname: item['B'],
                        description: `${item['A']} ${item['B']}`,
                        email: item['D'],
                        languages: item['E'],
                        exequatur: item['F'],
                        $sex_id: item['H'],
                        bio: item['I'],
                        provider: item['J'],
                        speciality: item['K'],
                        $attention_type_ids: item['G'],
                        note: item.note
                    },
                });

            }

        }

        console.log('complete');
    } catch (error) {
        console.log(error);
    }
};

async function speciality() {
    try {

        const user = {
            id: 1,
            description: 'IMPORT',
            account_id: 1,
            unixroles: 1
        }

        const specialities = await pool.query(`select * from t_speciality`)
        for (let i = 0; i < specialities.length; i++) {
            const speciality = specialities[i];
            speciality.sub = JSON.parse(speciality.sub);
            const sub = new Set()
            for (let i = 0; i < speciality.sub.length; i++) {
                const s = speciality.sub[i];

                if (s.includes(",")) {
                    const ss = s.split(",")
                    for (let i = 0; i < ss.length; i++) {
                        const sss = ss[i];
                        sub.add({ description: sss.trim() })
                    }
                } else {
                    sub.add({ description: s.trim() })
                }
            }
            speciality.sub = Array.from(sub);
            await _query.update({
                id: speciality.id,
                user,
                table: 't_speciality',
                data: {
                    sub: speciality.sub
                },
            });

        }
        console.log('complete');
    } catch (error) {
        console.log(error);
    }
}

async function contact() {
    try {
        await pool.query(`TRUNCATE TABLE t_contact`)
        const user = {
            id: 1,
            description: 'IMPORT',
            account_id: 1,
            unixroles: 1
        }

        const excel = excelToJson({
            sourceFile: path.resolve('../server/src/contact.xlsx'),
        });

        const items = excel.Sheet1;

        for (let i = 1; i < items.length; i++) {
            const item = items[i];
            // console.log(item);
            const code = await _query.getCode({ table: 't_contact' });

            if (item['E'] == 'M') {
                item['E'] = 5
            } else if (item['E'] == 'F') {
                item['E'] = 6
            }

            if (item['N']) {
                const [contact_type] = await pool.query(`select * from t_category where description=?`, [item['N']])
                item['N'] = contact_type.id
            }

            if (item['M']) {
                const [contact_position] = await pool.query(`select * from t_category where description=?`, [item['M']])
                if (contact_position) {
                    item['M'] = contact_position.id
                } else {
                    const cresponse = await _query.insert({
                        user,
                        table: 't_category',
                        data: {
                            parent_id: 209,
                            description: item['M'].trim(),
                            level: 1,
                        },
                    });
                    item['M'] = cresponse.id
                }
            }

            if (item['G']) {

                if (item['G'] === 'JÓVENES Y ADULTOS') {
                    item['G'] = [185, 182]
                }
                if (item['G'] === 'ADULTOS, GERIÁTRICOS') {
                    item['G'] = [182, 186]
                }
                if (item['G'] === 'ADULTOS') {
                    item['G'] = [182]
                }
                if (item['G'] === 'PEDIÁTRICO') {
                    item['G'] = [184]
                }
                if (item['G'] === 'PEDIÁTRICO Y ADULTOS') {
                    item['G'] = [184, 182]
                }
            }

            if (item['O']) {
                const [provider] = await pool.query(`SELECT * FROM t_provider WHERE description=?`, [item['O']])
                if (provider) {
                    item['O'] = [{
                        id: provider.id,
                        description: provider.description
                    }]
                } else {
                    item.note = item['O']
                    item['O'] = []
                }
            }

            if (item['O']) {
                await _query.insert({
                    user,
                    table: 't_contact',
                    data: {
                        code: code,
                        firstname: item['A'],
                        lastname: item['B'],
                        description: `${item['A']} ${item['B']}`,
                        phone: item['F'],
                        email: item['G'],
                        $sex_id: item['E'],
                        address: item['H'],
                        country: item['I'],
                        state: item['J'],
                        provider: item['O'],
                        city: item['K'],
                        department: item['L'],
                        $contact_position_id: item['M'],
                        $contact_type_id: item['N'],
                    },
                });
            }

        }

        console.log('complete');
    } catch (error) {
        console.log(error);
    }
};

async function CPT() {
    try {
        await pool.query(`TRUNCATE TABLE t_CPT`)
        const user = {
            id: 1,
            description: 'IMPORT',
            account_id: 1,
            unixroles: 1
        }

        const excel = excelToJson({
            sourceFile: path.resolve('../server/src/t_CPT.xlsx'),
        });

        const items = excel.Sheet1;

        for (let i = 1; i < items.length; i++) {
            const item = items[i];

            await _query.insert({
                user,
                table: 't_CPT',
                data: {
                    code: item['A'],
                    description: item['B'],
                },
            });

        }
        console.log('complete');
    } catch (error) {
        console.log(error);
    }
}

(async function () {
    try {
        // await CPT()

        // await provider()

        // await doctor()

        // await speciality()

        // await contact()

    } catch (error) {
        console.log(error);
    }
})();

async function fixPolicyTitular() {
    try {
        const items = await pool.query(`select * from t_policy_insured where c_status=4`)

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const [insured] = await pool.query(`select * from t_insured where id=?`, [item.titular_id])
            if (insured) {
                if (item.titular_description !== insured.fullname) {
                    const [insured2] = await pool.query(`select * from t_insured where fullname=?`, [item.titular_description])
                    // console.log(item.insurance);
                    if (insured2) {
                        await pool.query(`update t_policy_insured set titular_id=? where id=?`, [insured2.id, item.id])
                        // console.log(insured2.id, item.id, item.titular_description, insured.id, insured.fullname);
                    }
                }
            }
        }

        console.log('complete');
    } catch (error) {
        console.log(error);
    }
}

async function fixPolicyInsured() {
    try {
        const items = await pool.query(`select * from t_policy_insured`);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const [policy] = await pool.query(`select * from t_policy where policy_number=?`, [item.policy_number]);
            if (policy) {
                console.log(1, policy.id);
                await pool.query(`update t_policy_insured set policy_id=? where policy_number=?`, [policy.id, item.policy_number]);
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


function getFullName(fullName) {

    fullName = fullName.replace(/\s*,\s*/g, ", ");

    const [lastName, firstName] = fullName.split(", ").map(s => s.trim());

    return `${firstName} ${lastName}`;
}


async function checkPolicyInsured() {
    try {

        const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];

        const excel = excelToJson({
            header: {
                rows: 1,
            },
            columnToKey: _utility.mapColumnsToLetters(columnsKeys),
            sourceFile: path.resolve(`../server/src/BMI.xlsx`),
        });

        const [sheet] = Object.keys(excel);

        const items_xlsx = excel[sheet];
        const validate = []
        const items = await pool.query(`select insured_code, t_policy_insured.id, t_policy_insured.c_status, insurance, insured_description, insured_id from t_policy_insured left join t_policy on t_policy_insured.policy_id = t_policy.id order by c_status desc`);
        for (let i = 0; i < items.length; i++) {

            const item = items[i];
            const [insured] = await pool.query(`select * from t_insured where id=?`, [item.insured_id]);
            if (insured) {
                if (validate.includes(item.insured_code)) {
                    continue;
                }
                if (insured.fullname !== item.insured_description) {
                    const [x] = items_xlsx.filter(i => {
                        return i.insured_code === item.insured_code
                    }).map(x => {
                        const { firstName, lastName } = splitFullName(x.insured_description.replace(/\?/g, 'ñ'))
                        x.firstName = firstName
                        x.lastName = lastName
                        x.fullname = `${firstName} ${lastName}`
                        x.$sex_id = x.sex === 'F' ? 6 : 5;
                        x.sex = x.sex === 'F' ? 'Femenino' : 'Masculino'
                        return x
                    })
                    console.log(x);
                    if (x) {
                        validate.push(item.insured_code)
                        let dat = [x.firstName, x.lastName, x.fullname, x.email, x.sex, x.$sex_id, x.birthdate || null, insured.id];
                        await pool.query(`update t_insured set firstname=?, lastname=?, fullname=?, email=?, sex=?, $sex_id=?, birthdate=?, c_status=4 where id=?`, dat)
                        await pool.query(`update t_policy_insured set c_status=4 where id=?`, [item.id])
                    }
                }
            }
        }
        console.log('complete');
    } catch (error) {
        console.log(error);
    }
}

async function removeDuplicatesInsured() {
    try {
        const items = await pool.query(`SELECT id, fullname, COUNT(fullname) FROM t_insured WHERE c_status=4 GROUP BY fullname HAVING COUNT(fullname) > 1;`)

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const insureds = await pool.query(`SELECT id, fullname FROM t_insured WHERE fullname=?`, [item.fullname])
            for (let i = 0; i < insureds.length; i++) {
                const insured = insureds[i];
                const [policy] = await pool.query(`SELECT * from t_policy_insured where insured_id=?`, [insured.id])
                if (!policy) {
                    console.log(insured);
                } else {
                    if (policy.insured_description !== insured.fullname) {
                        console.log(policy.insured_description, insured.fullname);
                        console.log(policy);
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteInsured(insurance_id) {
    const items = await pool.query(`SELECT * FROM t_insured WHERE JSON_CONTAINS(policies, JSON_OBJECT('insurance_id', '${insurance_id}'), '$');`)

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await pool.query(`update t_insured set c_status=1 where id=?`, [item.id])

    }

    console.log('deleteInsured');
}

async function deletePolicies(insurance_id) {
    const items = await pool.query(`SELECT * FROM t_policy where insurance_id=?`, [insurance_id])

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const policies = await pool.query(`SELECT * FROM t_policy_insured where policy_id=? and c_status=4`, [item.id])

        for (let j = 0; j < policies.length; j++) {
            const policy = policies[j];
            await pool.query(`update t_policy_insured set c_status=1 where id=?`, [policy.id])

        }

    }

    console.log('deletePolicies');
}

async function importBMI() {
    try {

        const user = {
            id: 1,
            description: 'IMPORT',
            unixroles: 1
        }


        const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];

        const excel = excelToJson({
            header: {
                rows: 1,
            },
            columnToKey: _utility.mapColumnsToLetters(columnsKeys),
            sourceFile: path.resolve(`../server/src/BMI.xlsx`),
        });

        const [sheet] = Object.keys(excel);

        const items_xlsx = excel[sheet];

        for (let i = 0; i < items_xlsx.length; i++) {
            const x = items_xlsx[i];

            const data = {
                ident_no: _utility.padToEleven(x.ident_no),
                fullname: getFullName(fixString(x.insured_description)),
                $sex_id: x.sex === 'F' ? 6 : 5,
                sex: x.sex === 'F' ? 'Femenino' : 'Masculino',
                birthdate: x.birthdate ? x.birthdate : null,
                age: x.birthdate ? _date.calculateReadableAge(x.birthdate) : x.age,
                email: x.email
            }

            data.code = await _query.getCode({ table: 't_insured' });

            const [insured_exist] = await pool.query(`select * from t_insured where ident_no=? and c_status=4`, [data.ident_no])

            if (!insured_exist) {

                await _query.insert({
                    user,
                    table: 't_insured',
                    data: data
                })

            }

        }

        for (let i = 0; i < items_xlsx.length; i++) {
            const x = items_xlsx[i];

            const [policy] = await pool.query(`select * from t_policy where policy_number=?`, [x.policy_number]);
            const data = {
                titular_description: getFullName(fixString(x.titular_description)),
                insured_description: getFullName(fixString(x.insured_description)),
                policy_id: policy.id,
                insured_code: x.insured_code,
                $insured_type_id: x.insured_type === 'DEPENDIENTE' ? 164 : 165,
            }


            const [titular] = await pool.query(`select * from t_insured where fullname=? and c_status=4`, [data.titular_description]);
            const [insured] = await pool.query(`select * from t_insured where fullname=? and c_status=4`, [data.insured_description]);

            if (titular) {

                data.titular_id = titular.id
                data.insured_id = insured.id

                const [relationship_cat] = await pool.query(`select * from t_category where description=?`, [x.relationship]);
                if (relationship_cat) {
                    data.$relationship_id = relationship_cat.id;
                    data.relationship = relationship_cat.description;
                }

                await _query.insert({
                    user,
                    table: 't_policy_insured',
                    data: data
                })

            } else {
                // console.log(1);
            }

        }

        console.log('complete');

    } catch (error) {
        console.log(error);
    }
}

async function importHumano() {
    try {

        const user = {
            id: 1,
            description: 'IMPORT',
            unixroles: 1
        }


        const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];

        const excel = excelToJson({
            header: {
                rows: 1,
            },
            columnToKey: _utility.mapColumnsToLetters(columnsKeys),
            sourceFile: path.resolve(`../server/src/humano2.xlsx`),
        });

        const [sheet] = Object.keys(excel);

        const items_xlsx = excel[sheet];

        for (let i = 0; i < items_xlsx.length; i++) {
            const x = items_xlsx[i];

            const data = {
                ident_no: _utility.padToEleven(x.ident_no),
                fullname: fixString(x.insured_description),
                $sex_id: x.sex === 'F' ? 6 : 5,
                sex: x.sex === 'F' ? 'Femenino' : 'Masculino',
                birthdate: x.birthdate ? x.birthdate : null,
                age: x.birthdate ? _date.calculateReadableAge(x.birthdate) : x.age,
            }

            data.code = await _query.getCode({ table: 't_insured' });

            await _query.insert({
                user,
                table: 't_insured',
                data: data
            })

        }

        for (let i = 0; i < items_xlsx.length; i++) {
            const x = items_xlsx[i];

            const [policy] = await pool.query(`select * from t_policy where policy_number=?`, [x.policy_number]);
            const data = {
                titular_description: fixString(x.titular_description),
                insured_description: fixString(x.insured_description),
                policy_id: policy.id,
                insured_code: x.insured_code,
                $insured_type_id: x.insured_type === 'DEPENDIENTE' ? 164 : 165,
            }


            const [titular] = await pool.query(`select * from t_insured where fullname=? and c_status=4`, [data.titular_description]);
            const [insured] = await pool.query(`select * from t_insured where fullname=? and c_status=4`, [data.insured_description]);

            if (titular) {

                data.titular_id = titular.id
                data.insured_id = insured.id

                const [relationship_cat] = await pool.query(`select * from t_category where description=?`, [x.relationship]);
                if (relationship_cat) {
                    data.$relationship_id = relationship_cat.id;
                    data.relationship = relationship_cat.description;
                }

                await _query.insert({
                    user,
                    table: 't_policy_insured',
                    data: data
                })

            } else {
                // console.log(1);
            }

        }

        console.log('complete');

    } catch (error) {
        console.log(error);
    }
}

async function checkEvent() {
    try {
        const items = await pool.query(`select * from t_event;`)
        let count = 0
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const policies = await pool.query(`select insured_code, t_policy_insured.id, t_policy_insured.c_status, insurance, insured_description, insured_id from t_policy_insured left join t_policy on t_policy_insured.policy_id = t_policy.id where insured_id=? order by c_status desc`, [item.insured_id]);
            for (let i = 0; i < policies.length; i++) {
                const policy = policies[i];
                if (policy.insurance === 'BMI') {
                    const insured = await pool.query(`select * from t_insured where fullname=? and c_status=4`, [item.insured]);
                    await pool.query(`update t_event set insured_id=? where id=?`, [insured.id, item.id])
                    // ++count
                }
                if (policy.insurance === 'HUMANO SEGUROS') {
                    const insured = await pool.query(`select * from t_insured where fullname=? and c_status=4`, [item.insured]);
                    await pool.query(`update t_event set insured_id=? where id=?`, [insured.id, item.id])
                    // ++count
                }

            }
        }
        console.log(count);
    } catch (error) {
        console.log(error);
    }
}

async function deleteRows() {
    await pool.query(`delete from t_insured where c_status=1`)
    await pool.query(`delete from t_policy_insured where c_status=1`)
}

async function catFixes() {
    await pool.query('update `t_policy_insured` set insured_type="DEPENDIENTE", `$insured_type_id`=164 WHERE insured_type="titular"')
    await pool.query('update t_policy_insured set $relationship_id=358, relationship="CÓNYUGE" WHERE relationship="conyugue"')
}

async function fixDuplicated() {
    try {
        const items = await pool.query(`SELECT fullname, COUNT(fullname) FROM t_insured WHERE c_status=4 GROUP BY fullname HAVING COUNT(fullname) > 1;`)

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const insureds = await pool.query(`select * from t_insured where fullname=?`, [item.fullname]);

            for (let j = 0; j < insureds.length; j++) {
                const insured = insureds[j];

                const [event] = await pool.query(`select * from t_event where insured_id=?`, [insured.id])
                if (event) {
                    // console.log(j, 'event', insured.id, insured.fullname);
                    continue;
                }

                const [policy] = await pool.query(`select * from t_policy_insured where insured_id=?`, [insured.id])
                if (policy) {
                    // console.log(j, 'policy', insured.id, insured.fullname);
                    continue;
                }
                if (j) {
                    await pool.query(`update t_insured set c_status=1 where id=?`, [insured.id]);
                }

            }


        }

        const _items = await pool.query(`SELECT fullname, COUNT(fullname) FROM t_insured WHERE c_status=4 GROUP BY fullname HAVING COUNT(fullname) > 1;`)

        for (let i = 0; i < _items.length; i++) {
            const item = _items[i];

            const insureds = await pool.query(`select * from t_insured where fullname=?`, [item.fullname]);
            let firstId = null
            for (let j = 0; j < insureds.length; j++) {
                const insured = insureds[j];
                if (!j) {
                    firstId = insured.id;
                }
                const [event] = await pool.query(`select * from t_event where insured_id=?`, [insured.id])
                if (event) {
                    // console.log(j, 'event', insured.id, insured.fullname);
                    if (j) {
                        await pool.query(`update t_event set id=? where insured_id=?`, [firstId, insured.id])
                    }
                }

                const [policy] = await pool.query(`select * from t_policy_insured where insured_id=?`, [insured.id])
                if (policy) {
                    // console.log(j, 'policy', insured.id, insured.fullname);
                    if (j) {
                        await pool.query(`update t_policy_insured set insured_id=? where insured_id=?`, [firstId, insured.id])
                    }
                }

                if (j) {
                    await pool.query(`update t_insured set c_status=1 where id=?`, [insured.id]);
                }
            }
        }

        console.log('complete');

    } catch (error) {
        console.log(error);
    }
}

(async function () {
    try {
        const insureds = await pool.query(`SELECT * FROM t_insured`)

        for (let i = 0; i < insureds.length; i++) {
            const insured = insureds[i];

            const policies = await pool.query(`SELECT * FROM t_policy_insured WHERE c_status=4 and insured_id=?`, [insured.id]);

            insured.policies = []

            for (let k = 0; k < policies.length; k++) {
                const policy = policies[k];
                console.log(policy);
                const [_policy] = await pool.query(`SELECT * FROM t_policy WHERE c_status=4 and id=?`, [policy.policy_id]);

                if (!_policy) {
                    continue;
                }
                let dat = {
                    policy_id: String(_policy.id),
                    policy_number: String(_policy.policy_number),
                    insured_code: policy.insured_code ? String(policy.insured_code) : null,
                    insurance_id: String(_policy.insurance_id),
                    insurance: _policy.insurance,
                }

                if (insured.policies) {
                    insured.policies.push(dat)
                } else {
                    insured.policies = [dat]
                }


            }

            if (!insured.policies.length) {
                insured.policies = null
            } else {
                insured.policies = JSON.stringify(insured.policies)
            }
            await pool.query(`update t_insured set policies=? where id=?`, [insured.policies, insured.id])

        }
        console.log('complete policies insured');
    } catch (error) {
        console.log(error);
    }
});

(async function () {
    try {

        await deleteInsured(9)
        await deletePolicies(9)
        console.log(1);
        await deleteInsured(18)
        await deletePolicies(18)
        console.log(2);

        await importBMI()
        console.log(3);

        await importHumano()
        console.log(4);

        await checkEvent();
        console.log(5);

        await catFixes();
        console.log(6);

        await fixDuplicated()
        console.log(7);

        await deleteRows();
        console.log(8);


    } catch (error) {
        console.log(error);
    }
});