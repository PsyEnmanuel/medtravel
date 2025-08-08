
import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { _query } from "../helpers/index.js";
import pool from "../databases/main.js";
import icd_group from "../icd_group.js";
const table = "t_ICD10";

const router = express.Router();
router.use(isAuthenticated);

function isCodeInRange(code, rangeStart, rangeEnd) {
  const baseCode = code.split('.')[0].toUpperCase();

  const letter = baseCode.charAt(0);
  const number = parseInt(baseCode.slice(1), 10);

  const startLetter = rangeStart.charAt(0);
  const startNumber = parseInt(rangeStart.slice(1), 10);

  const endLetter = rangeEnd.charAt(0);
  const endNumber = parseInt(rangeEnd.slice(1), 10);

  if (letter < startLetter || letter > endLetter) return false;

  if (letter === startLetter && number < startNumber) return false;
  if (letter === endLetter && number > endNumber) return false;

  return true;
}

async function groupICD10() {
  const user = { id: 1, account_id: 1, unixroles: 1 };
  const items = await pool.query(`select * from ${table}`);
  for (const item of items) {
    const code = item.code.toUpperCase();
    const group = icd_group.find(g => {
      const [start, end] = g.code_range.split('–');
      return isCodeInRange(code, start, end);
    });

    const itemToUpdate = {
      chapter_desc: group ? group.chapter : null,
      group_desc: group ? group.code_range : null,
    };
    // console.log(itemToUpdate)
    await _query.update({
      id: item.id,
      user,
      table,
      data: itemToUpdate,
    });
  }

  console.log('Updated!!!!')
}

await groupICD10()