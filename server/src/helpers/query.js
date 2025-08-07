import pool from "../databases/main.js";
import pool_global from "../databases/global.js";
import mysql from "mysql";
import { _constant, _role, _utility, _date } from "./index.js";

export async function getProfilePic({ ref_key, ref_id }) {
  const [file] = await pool.query(
    "SELECT id, url, thumb, small, description, ref_key, $file_type_id, file_type, type, icon FROM t_file WHERE ref_key=? AND ref_id=? AND $file_type_id=188 AND  c_status & 4 ORDER BY id DESC",
    [ref_key, ref_id]
  );
  return file;
}

export async function getFiles({ ref_key, ref_id }) {
  const files = await pool.query(
    "SELECT id, url, thumb, small, description, ref_key, $file_type_id, file_type, type, icon FROM t_file WHERE ref_key=? AND ref_id=? AND c_status & 4 ORDER BY id DESC",
    [ref_key, ref_id]
  );
  return files;
}

export async function getPDF({ ref_key, ref_id }) {
  const [item] = await pool.query(
    "SELECT url, description FROM t_file WHERE ref_key=? AND ref_id=? AND c_status & 4 ORDER BY id DESC LIMIT 1",
    [ref_key, ref_id]
  );
  return item;
}

export async function getCode({ table }) {
  const sql = `SELECT code FROM ${table} ORDER BY code DESC limit 1`;
  const [item] = await pool.query(sql);
  return item?.code ? ++item.code : _constant.codes[table] + 1;
}

export async function getColumns(table, COLUMN_KEY = true) {
  var columns = await pool.query(
    `SELECT COLUMN_NAME, COLUMN_KEY, EXTRA, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${process.env.DB_NAME}' AND TABLE_NAME = '${table}' ORDER BY COLUMN_NAME DESC`
  );
  return COLUMN_KEY ? columns : columns.map((column) => column["COLUMN_NAME"]);
}

async function validateColumns(table, columns) {
  const items = await getColumns(table, false);
  return columns.every((i) => items.includes(i));
}

export async function getRows({
  table,
  user,
  query,
  auth = 1,
  optsServer = {
    columns: "",
  },
}) {
  const opts = {
    args: [],
    argsTotal: [],
    where: " WHERE 1",
    limit: "",
    order: "",
    odir: "DESC",
    join: [],
    groupBy: "",
    columns: "",
    sql: "",
    privilege: "",
    access: "",
  };

  if (query.columns && _utility.isObject(query.columns)) {
    for (const key in query.columns) {
      if (Object.prototype.hasOwnProperty.call(query.columns, key)) {
        const columns = query.columns[key];
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          const str = column === '*' && '*'
          if (str) {
            opts.columns += `${key}.${str}`
          } else {
            const validColumns = await validateColumns(key, columns);
            if (validColumns) {
              opts.columns += `, ${key}.${column}`
            }
          }
        }

      }
    }
  } else {
    opts.columns = "*"
  }

  // if (query.columns && (await validateColumns(table, query.columns))) {
  //   opts.columns = query.columns.join(",");
  // }

  if (auth) {
    opts.privilege = _role.joinPrivileges(table, "read");
    opts.access = _role.canRead(table, user);
  }

  if (query.join?.length) {
    for (let i = 0; i < query.join.length; i++) {
      const j = query.join[i];
      if (j.using) {
        opts.join += ` LEFT JOIN ?? USING(??)`;
        opts.args = opts.args.concat(j.table, j.using);
        opts.argsTotal = opts.argsTotal.concat(j.table, j.using);
        opts.columns += `, ${j.table}.id AS _id`
      } else {
        opts.join += ` LEFT JOIN ?? ON ??=??`;
        opts.args = opts.args.concat(j.table, j.relationA, j.relationB);
        const relationA = j.relationA.split('.')[0]
        const relationB = j.relationB.split('.')[0]
        opts.argsTotal = opts.argsTotal.concat(j.table, j.relationA, j.relationB);
        opts.columns = `${relationA}.*, ${relationB}.*`
      }
    }
  }

  if (query.where) {
    let { where, args } = _utility.prepareWhere(query.where);
    opts.where += where;
    opts.args = opts.args.concat(args);
    opts.argsTotal = opts.argsTotal.concat(args);
  } else {
    // opts.where += ` AND c_status = 4`;
  }

  if (query.groupBy?.length) {
    opts.groupBy = ` GROUP BY`;
    for (let i = 0; i < query.groupBy.length; i++) {
      const v = query.groupBy[i];
      opts.groupBy += `${i ? "," : ""} ??`;
      opts.args.push(v);
      opts.argsTotal.push(v);
    }
  }

  if (query.order && Object.keys(query.order).length > 0) {
    let i = 0;
    opts.order += ` ORDER BY`;
    for (const key in query.order) {
      const value = query.order[key];
      if (query.orderFun) {
        opts.order += `${i ? "," : ""} LENGTH(??) ${value === "DESC" ? "DESC" : "ASC"
          }`;
      } else {
        opts.order += `${i ? "," : ""} ?? ${value === "DESC" ? "DESC" : "ASC"}`;
      }
      opts.args.push(key);
      i++;
    }
  }

  if (query.limit) {
    opts.limit = ` LIMIT ?, ?`;
    const start = _utility.startPage(query.page, query.limit);
    opts.args.push(start, parseInt(query.limit));
  }

  opts.sql = `SELECT ${opts.columns} ${optsServer.columns ? ", " + optsServer.columns : ""
    } FROM ${table} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy
    } ${opts.order} ${opts.limit}`;

  const sql = mysql.format(opts.sql, opts.args);

  const items = await pool.query(sql);

  opts.sqlTotal = `SELECT COUNT(*) as count FROM ${table} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy}`;

  if (opts.groupBy?.length) {
    opts.sqlTotal = `SELECT COUNT(*) as count
    FROM
    (${opts.sqlTotal}) as t`;
  }

  const sqlTotal = mysql.format(opts.sqlTotal, opts.argsTotal);
  const [total] = await pool.query(sqlTotal);

  return {
    items,
    total: total.count,
    sql,
  };
}

export async function getRowsUtils({
  table,
  user,
  query,
  auth = 1,
  optsServer = {
    columns: "",
  },
}) {
  const opts = {
    args: [],
    argsTotal: [],
    where: " WHERE 1",
    limit: "",
    order: "",
    odir: "DESC",
    join: [],
    groupBy: "",
    columns: "*",
    sql: "",
    privilege: "",
    access: "",
  };

  if (query.columns && (await validateColumns(table, query.columns))) {
    opts.columns = query.columns.join(",");
  }

  if (auth) {
    opts.privilege = _role.joinPrivileges(table, "read");
    opts.access = _role.canRead(table, user);
  }

  if (query.join?.length) {
    for (let i = 0; i < query.join.length; i++) {
      const j = query.join[i];
      opts.join += ` LEFT JOIN ?? USING(??)`;
      opts.args = opts.args.concat(j.table, j.using);
      opts.argsTotal = opts.argsTotal.concat(j.table, j.using);
    }
  }

  if (query.where) {
    let { where, args } = _utility.prepareWhere(query.where);
    opts.where += where;
    opts.args = opts.args.concat(args);
    opts.argsTotal = opts.argsTotal.concat(args);
  } else {
    // opts.where += ` AND c_status = 4`;
  }

  if (query.groupBy?.length) {
    opts.groupBy = ` GROUP BY`;
    for (let i = 0; i < query.groupBy.length; i++) {
      const v = query.groupBy[i];
      opts.groupBy += `${i ? "," : ""} ??`;
      opts.args.push(v);
      opts.argsTotal.push(v);
    }
  }

  if (query.order && Object.keys(query.order).length > 0) {
    let i = 0;
    opts.order += ` ORDER BY`;
    for (const key in query.order) {
      const value = query.order[key];
      if (query.orderFun) {
        opts.order += `${i ? "," : ""} LENGTH(??) ${value === "DESC" ? "DESC" : "ASC"
          }`;
      } else {
        opts.order += `${i ? "," : ""} ?? ${value === "DESC" ? "DESC" : "ASC"}`;
      }
      opts.args.push(key);
      i++;
    }
  }

  if (query.limit) {
    opts.limit = ` LIMIT ?, ?`;
    const start = _utility.startPage(query.page, query.limit);
    opts.args.push(start, parseInt(query.limit));
  }

  opts.sql = `SELECT ${opts.columns} ${optsServer.columns ? ", " + optsServer.columns : ""
    } FROM ${table} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy
    } ${opts.order} ${opts.limit}`;

  const sql = mysql.format(opts.sql, opts.args);
  // console.log(sql);
  const items = await pool_global.query(sql);

  opts.sqlTotal = `SELECT COUNT(*) as count FROM ${table} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy}`;

  if (opts.groupBy?.length) {
    opts.sqlTotal = `SELECT COUNT(*) as count
    FROM
    (${opts.sqlTotal}) as t`;
  }

  const sqlTotal = mysql.format(opts.sqlTotal, opts.argsTotal);
  const [total] = await pool_global.query(sqlTotal);

  return {
    items,
    total: total.count,
    sql,
  };
}

export async function getRowById({ table, user, query = {}, id, auth = 1 }) {
  const opts = {
    args: [id],
    where: ` WHERE 1 AND ${table}.id=?`,
    odir: "DESC",
    join: [],
    groupBy: "",
    columns: "*",
    sql: "",
    privilege: "",
    access: "",
  };

  if (auth) {
    opts.privilege = _role.joinPrivileges(table, "read");
    opts.access = _role.canRead(table, user);
  }

  if (query.join?.length) {
    for (let i = 0; i < query.join.length; i++) {
      const j = query.join[i];
      opts.join += ` LEFT JOIN ?? USING(??)`;
      opts.args = opts.args.concat(j.table, j.using);
    }
  }

  if (query.where) {
    let { where, args } = _utility.prepareWhere(query.where);
    opts.where += where;
    opts.args = opts.args.concat(args);
  }
  if (query.groupBy?.length) {
    opts.groupBy = ` GROUP BY`;
    for (let i = 0; i < query.groupBy.length; i++) {
      const v = query.groupBy[i];
      opts.groupBy += `${i ? "," : ""} ??`;
      opts.args.push(v);
    }
  }

  opts.sql = `SELECT ${opts.columns} FROM ${table} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy}`;
  const sql = mysql.format(opts.sql, opts.args);

  const [item] = await pool.query(sql);

  return item;
}

export async function insert({ user, table, data, log = false, auth = 1 }) {

  if (auth) {
    const privileges = await _role.tablePrivileges(table, user);
    const privilege = _role.hasPrivileges(privileges, "create");
    if (!privilege) return false;
  }

  let _data = await _utility.prepareData({
    user,
    table,
    data,
  });

  const sql = mysql.format(`INSERT ${table} SET ?`, _data);

  const response = await pool.query(sql);

  let id = response.insertId;

  if (log) {

    let dat = { data: JSON.stringify(_data), ref_key: table, ref_id: id, action: "create", created: _data.created, created_by: _data.created_by, created_by_id: _data.created_by_id }
    const sql = mysql.format(`INSERT t_log SET ?`, [dat]);
    await pool.query(sql);
  }

  return {
    id,
    lines: response.affectedRows,
  };
}

export async function update({ id, ref_key = "id", user, table, data, log = false, options = { modified: true } }) {
  const privilege = await _role.joinPrivileges(table, "write");
  const access = _role.canWrite(table, user);

  const _data = await _utility.prepareData({
    user,
    table,
    data,
    action: "UPDATE",
    options
  });

  const args = [_data, ref_key, id];
  const where = " WHERE 1 AND ??=?";
  const sql = mysql.format(
    `UPDATE ${table} ${privilege} SET ? ${where} ${access}`,
    args
  );
  const response = await pool.query(sql);

  if (log) {
    let dat = { data: JSON.stringify(_data), ref_key: table, ref_id: id, action: "update", created: _data.modified, created_by: _data.created_by, created_by_id: _data.created_by_id }
    const sql = mysql.format(`INSERT t_log SET ?`, [dat]);
    await pool.query(sql);
  }

  return {
    id,
    lines: response.affectedRows,
  };
}

export async function updatePublic({ id, ref_key = "id", user, table, data }) {
  const _data = await _utility.prepareData({
    user,
    table,
    data,
    action: "UPDATE",
  });

  const args = [_data, ref_key, id];
  const where = " WHERE 1 AND ??=?";
  const sql = mysql.format(`UPDATE ${table} SET ? ${where}`, args);

  const response = await pool.query(sql);

  return {
    id,
    lines: response.affectedRows,
  };
}

export async function getCategoryLevel(parentid) {
  let [item] = await pool.query("SELECT level FROM t_category WHERE id = ?", [
    parentid,
  ]);
  return item.level + 1;
}

export async function getCategoryMultiple(id) {
  return await pool.query(
    "SELECT id, description FROM t_category WHERE id IN(?)",
    [id]
  );
}

export async function getCategoryById(id) {
  let [item] = await pool.query("SELECT * FROM t_category WHERE id = ?", [id]);
  return item;
}

export async function getCategoryChildrenByRef(ref) {
  let [item] = await pool.query("SELECT * FROM t_category WHERE ref = ?", [ref]);
  let items = await pool.query("SELECT * FROM t_category WHERE parent_id = ? and c_status = 4", [item.id]);
  return items;
}

export async function getCategoryDescriptionById(id) {
  let [item] = await pool.query("SELECT * FROM t_category WHERE id = ?", [id]);
  return item ? item.description : null;
}

export async function getCategoryByRef(ref) {
  let [item] = await pool.query("SELECT * FROM t_category WHERE ref = ?", [
    ref,
  ]);
  return item;
}

export async function getSchema() {
  let schema = await pool.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${process.env.DB_NAME}'`
  );

  let tables_unixperms = [];
  let tables_roles = [];
  for (const table of schema) {
    let structure = await pool.query("DESCRIBE " + table["TABLE_NAME"]);

    let index = structure.findIndex((item) => {
      return item.Field == "c_unixperms";
    });
    if (index != -1) {
      let column = await pool.query(
        `SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${process.env.DB_NAME}' AND TABLE_NAME = '${table["TABLE_NAME"]}' AND COLUMN_NAME='c_unixperms'`
      );
      tables_unixperms.push({
        loading: false,
        label: table["TABLE_NAME"],
        value: column[0]["COLUMN_DEFAULT"],
      });

      let [role] = await pool.query(
        `SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${process.env.DB_NAME}' AND TABLE_NAME = '${table["TABLE_NAME"]}' AND COLUMN_NAME='c_roles'`
      );
      tables_roles.push({
        label: table["TABLE_NAME"],
        value: role["COLUMN_DEFAULT"],
        loading: false,
      });
    }
  }
  return { tables_unixperms, tables_roles };
}

export async function getTable() {
  let schema = await pool.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${process.env.DB_NAME}'`
  );
  const hiddenColumns = ["t_action", "t_map", "t_privilege", "t_session"];
  return schema
    .map((row) => row["TABLE_NAME"])
    .filter((i) => hiddenColumns.indexOf(i) === -1);
}
