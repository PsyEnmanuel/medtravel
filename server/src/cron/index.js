import cron from "node-cron";
import { _comunication, _query, _date } from "../helpers/index.js";
import { format, addDays, isSaturday, startOfDay, endOfDay } from "date-fns";
import pool from "../databases/main.js";

const user = {
  id: 1,
  unixroles: 1,
  account_id: 1,
  description: "Enmanuel Martínez",
};

async function closeComment() {
  try {
    const { items, sql } = await _query.getRows({
      table: "t_comment",
      user,
      query: {
        where: {
          blocked: 0,
          "lt:created": _date.mysqlDateTime(new Date()),
        },
        order: {
          book_date: "ASC",
        },
      },
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      await _query.update({
        id: item.id,
        user,
        table: "t_comment",
        data: {
          blocked: 1,
        },
      });
    }
    console.log(`Comentarios bloqueados ${items.length}`);
  } catch (error) {
    console.log(error);
  }
}

cron.schedule(
  "0 6 * * *",
  async () => {
    try {
      closeComment();
    } catch (error) {
      console.log(error);
    }
  },
  {
    scheduled: true,
    timezone: "America/Santo_Domingo",
  }
);
