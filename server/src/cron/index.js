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

async function getEventReminder(targetDay) {
  const { items, sql } = await _query.getRows({
    table: "t_event",
    user,
    query: {
      where: {
        reminder: 1,
        "gt:start": _date.mysqlDateTime(targetDay),
        "lt:start": _date.mysqlDateTime(endOfDay(targetDay)),
      },
      order: {
        start: "ASC",
      },
      columns: ["description", "birthdate"],
    },
  });

  return items.map((item, index) => ({
    id: item.id,
    line: index + 1,
    event_type: item.event_type,
    event_reason: item.event_reason,
    name: item.contact_description,
    email: item.email,
    doctor: item.user_description,
    date: _date.intlReadbleDate(item.start),
    time: _date.intlTime(item.start),
  }));
}

async function sendEventReminder() {
  try {
    let daysToadd = 1;
    if (isSaturday(new Date())) {
      daysToadd = 2;
    }
    const targetDay = startOfDay(addDays(new Date(), daysToadd));

    const items = await getEventReminder(targetDay);
    if (!items.length) {
      return;
    }
    const [account] = await pool.query(
      "SELECT * FROM t_account WHERE t_account.id=1"
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      await _comunication.postMarkTemplate({
        MessageStream: "outbound",
        From: `Dermathoclinic CRM <${process.env.MAIL_USER}>`,
        To: [`${item.email}`].join(","),
        TemplateId: "34245077",
        TemplateModel: {
          name: item.name,
          phone: item.phone,
          date: item.date,
          time: item.time,
          company_name: account.description,
          company_instagram: account.instagram,
          company_facebook: account.facebook,
          company_twitter: account.twitter,
          company_address: account.address,
          company_phone: account.phone,
          company_cel: account.cel,
          logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`,
        },
        ReplyTo: `${account.email}`,
      });

      _query.update({
        id: item.id,
        user,
        table: 't_event',
        data: {
          reminder: 0,
        },
      });

    }

  } catch (error) {
    console.log(error);
  }
}

async function sendBirthdayMessage() {
  try {
    const birthday = format(new Date(), "MM-dd");
    const items = await getBirthdays(birthday);

    const [account] = await pool.query(
      "SELECT * FROM t_account WHERE t_account.id=1"
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!i) {
        _comunication.postMarkTemplate({
          MessageStream: "outbound",
          From: `Dermathoclinic CRM <${process.env.MAIL_USER}>`,
          To: [`enmanuelpsy@gmail.com`].join(","),
          TemplateId: "34862082",
          TemplateModel: {
            name: item.name,
            company_name: account.description,
            company_instagram: account.instagram,
            company_facebook: account.facebook,
            company_twitter: account.twitter,
            company_address: account.address,
            company_phone: account.phone,
            company_cel: account.cel,
            logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`,
          },
          ReplyTo: `${account.email}`,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getBirthdays(birthday) {
  const { items } = await _query.getRows({
    table: "t_patient",
    user,
    query: {
      where: {
        "like:birthdate": birthday,
      },
      order: {
        birthdate: "DESC",
      },
      columns: ["description", "birthdate", "email"],
    },
  });
  return items.map((item, index) => ({
    line: index + 1,
    name: item.description,
    email: item.email,
    age: _date.calculateAge(item.birthdate),
  }));
}

async function sendBirthdayList() {
  try {
    const birthday = format(new Date(), "MM-dd");
    const today = format(new Date(), "dd-MM-yyyy");
    const items = await getBirthdays(birthday);

    const [account] = await pool.query(
      "SELECT * FROM t_account WHERE t_account.id=1"
    );

    const response = await _comunication.postMarkTemplate({
      MessageStream: "outbound",
      From: `Dermathoclinic CRM <${process.env.MAIL_USER}>`,
      To: [`dermathoclinicrd@gmail.com`].join(","),
      TemplateId: "34245976",
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        items,
        today,
        logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`,
      },
      ReplyTo: `${account.email}`,
    });
  } catch (error) {
    console.log(error);
  }
}

async function getEventAlert(targetDay) {
  const { items, sql } = await _query.getRows({
    table: "t_event",
    user,
    query: {
      where: {
        alert: 1,
        "gt:start": _date.mysqlDateTime(targetDay),
        "lt:start": _date.mysqlDateTime(endOfDay(targetDay)),
      },
      order: {
        start: "ASC",
      },
      columns: ["description", "birthdate"],
    },
  });

  return items.map((item, index) => ({
    line: index + 1,
    name: item.contact_description,
    start: format(item.start, "hh:mm"),
    event_type: item.event_type,
    event_reason: item.event_reason,
  }));
}

async function sendEventList() {
  try {
    let daysToadd = 1;
    if (isSaturday(new Date())) {
      daysToadd = 2;
    }
    const targetDay = startOfDay(addDays(new Date(), daysToadd));

    const items = await getEventAlert(targetDay);

    if (!items.length) {
      return;
    }

    const [account] = await pool.query(
      "SELECT * FROM t_account WHERE t_account.id=1"
    );

    const response = await _comunication.postMarkTemplate({
      MessageStream: "outbound",
      From: `Dermathoclinic CRM <${process.env.MAIL_USER}>`,
      To: [`dermathoclinicrd@gmail.com`].join(","),
      TemplateId: "34386673",
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        items,
        date: format(targetDay, "dd-MM-yyyy"),
        logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`,
      },
      ReplyTo: `${account.email}`,
    });
  } catch (error) {
    console.log(error);
  }
}

async function closeInvoice() {
  try {
    const { items, sql } = await _query.getRows({
      table: "t_book",
      user,
      query: {
        where: {
          $book_state_id: 51,
          $book_type_id: 98,
          blocked: 0,
          "lt:book_date": _date.mysqlDateTime(new Date()),
        },
        order: {
          book_date: "ASC",
        },
        columns: ["description", "book_date"],
      },
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      await _query.update({
        id: item.id,
        user,
        table: "t_book",
        data: {
          blocked: 1,
        },
      });
    }
    console.log(`Facturas bloqueadas ${items.length}`);
  } catch (error) {
    console.log(error);
  }
}

cron.schedule(
  "0 6 * * *",
  async () => {
    try {
      sendBirthdayList();
      sendEventList();
      sendEventReminder();
      closeInvoice();
    } catch (error) {
      console.log(error);
    }
  },
  {
    scheduled: true,
    timezone: "America/Santo_Domingo",
  }
);
