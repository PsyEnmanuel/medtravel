import excelToJson from 'convert-excel-to-json';
import pool from "../databases/main.js";
import pool_global from "../databases/global.js";
import path from "path";
import { _date, _query, _utility } from '../helpers/index.js';

(async function () {
    try {
        console.log('start');
        const items = await pool.query(`select * from t_event`)

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.diagnosis) {
                item.diagnosis = JSON.parse(item.diagnosis)
                for (let j = 0; j < item.diagnosis.length; j++) {
                    const diag = item.diagnosis[j];

                    const [icd10] = await pool.query(`select * from t_ICD10 where id=?`, [diag.id])

                    if (icd10) {
                        diag.group_desc = icd10.group_desc
                        diag.chapter_desc = icd10.chapter_desc
                    } else {
                        console.log('error', diag, item.id);
                    }

                }
                item.diagnosis = JSON.stringify(item.diagnosis);
                await pool.query(`update t_event set diagnosis=? where id=?`, [item.diagnosis, item.id])
            }

            if (item.presumptive_diagnosis) {
                item.presumptive_diagnosis = JSON.parse(item.presumptive_diagnosis)
                for (let j = 0; j < item.presumptive_diagnosis.length; j++) {
                    const diag = item.presumptive_diagnosis[j];

                    const [icd10] = await pool.query(`select * from t_ICD10 where id=?`, [diag.id])

                    if (icd10) {
                        diag.group_desc = icd10.group_desc
                        diag.chapter_desc = icd10.chapter_desc
                    } else {
                        console.log('error', diag, item.id);
                    }

                }
                item.presumptive_diagnosis = JSON.stringify(item.presumptive_diagnosis);
                await pool.query(`update t_event set presumptive_diagnosis=? where id=?`, [item.presumptive_diagnosis, item.id])
            }

        }

        console.log('Updated!!!!')

    } catch (err) {
        console.log(err);
    }
})()