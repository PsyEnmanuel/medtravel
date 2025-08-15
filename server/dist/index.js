import * as path from "path";
import path__default from "path";
import dotenv from "dotenv";
import express, { response } from "express";
import fs from "fs";
import createError from "http-errors";
import http from "http";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mysql from "mysql";
import * as util from "util";
import Ajv from "ajv";
import AjvErrors from "ajv-errors";
import axios from "axios";
import { format as format$1, transports, createLogger } from "winston";
import ejs from "ejs";
import multer from "multer";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { format, isValid, differenceInDays, getDaysInMonth, setDate, formatDistanceToNow, setDefaultOptions } from "date-fns";
import excelToJson from "convert-excel-to-json";
import { load } from "@pspdfkit/nodejs";
import PDFMerger from "pdf-merger-js";
import { pdfToImg } from "pdftoimg-js";
import PdfPrinter from "pdfmake";
import morgan from "morgan";
import { gray, redBright, cyanBright, yellowBright, greenBright, green, cyan, yellow, red } from "colorette";
import { Server } from "socket.io";
import { es } from "date-fns/locale";
dotenv.config({
  path: path.join(path.join(path.resolve(), `.env.${process.env.NODE_ENV}`))
});
({
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST,
  PORT: process.env.PORT
});
const pool$1 = mysql.createPool({
  connectionLimit: 20,
  host: "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
pool$1.getConnection((err, connection) => {
  if (err) {
    console.log(err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }
  if (connection)
    connection.release();
  return;
});
pool$1.query = util.promisify(pool$1.query);
const ajv = new Ajv({ allErrors: true });
AjvErrors(ajv);
ajv.addKeyword("$isNotEmpty", {
  type: "string",
  validate: function(schema, data2) {
    return typeof data2 === "string" && data2.trim() !== "";
  },
  errors: false
});
const validate_json = (schema) => {
  return (req, res, next) => {
    const validate = ajv.compile(schema);
    const valid = validate(req.body);
    if (!valid) {
      const errors = validate.errors;
      return res.status(400).json(errors);
    }
    next();
  };
};
const operation = {
  bi: "&",
  eq: "=",
  ne: "!=",
  gt: ">",
  ge: ">=",
  lt: "<",
  le: "<=",
  like: "LIKE",
  isnull: "ISNULL",
  notnull: "ISNOTNULL",
  orlike: "ORLIKE",
  in: "IN",
  jc: "JSON_CONTAINS",
  js: "JSON_SEARCH",
  jo: "JSON_OVERLAPS",
  regexp: "REGEXP"
};
const permissions = {
  owner_read: 256,
  owner_write: 128,
  owner_delete: 64,
  role_read: 32,
  role_write: 16,
  role_delete: 8,
  other_read: 4,
  other_write: 2,
  other_delete: 1
};
const codes = {
  t_file: 9e7,
  t_insured: 1e6,
  t_policy: 5e6,
  t_lodging: 4e6,
  t_customer: 1e6,
  t_history: 2e8,
  t_prescription: 3e8,
  t_cosmiatry: 3e8,
  t_template: 2e3,
  t_provider: 2e3,
  t_catalogue: 4e6,
  t_book: 9e7,
  t_inventory: 8e7,
  t_event: 7e7,
  t_broker: 4e5,
  t_doctor: 3e5,
  t_contact: 3e5,
  t_task: 3e5,
  t_itinerary: 2e8
};
const sizes = [
  { type: "thumb", resize: 300 },
  { type: "small", resize: 750 }
];
const tableWithNoAccountId = ["t_role", "t_privilege", "t_account"];
function getAMPMFromDate(dateString) {
  const date = new Date(dateString);
  const hours = date.getUTCHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${ampm}`;
}
function cleanTimeFormat(timeString) {
  return timeString.replace(/\s?[ap]\.\s?m\./gi, "").trim();
}
function extractAMPM(timeString) {
  return /\ba\.\s?m\./i.test(timeString) ? "AM" : "PM";
}
function mergeDateAndTime(date, time, amPm) {
  const [day, month, year] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const formattedHour = amPm === "PM" && hour < 12 ? hour + 12 : amPm === "AM" && hour === 12 ? 0 : hour;
  return new Date(year, month - 1, day, formattedHour, minute);
}
function isBirthday(date) {
  const today = /* @__PURE__ */ new Date();
  const birthDate = new Date(date);
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  return birthMonth === todayMonth && birthDay === todayDay;
}
function convertToValidDateWithTime(dateString) {
  if (dateString.includes("-"))
    ;
  let parts = dateString.split(", ");
  let datePart = parts[0];
  let dateParts = datePart.split(/[\/ ]/);
  let day = parseInt(dateParts[0], 10);
  let month = parseInt(dateParts[1], 10) - 1;
  let year = parseInt(dateParts[2], 10);
  let dateWithoutTime = new Date(year, month, day);
  return dateWithoutTime;
}
convertToValidDateWithTime("12-09-2024");
function convertToValidDate(dateString) {
  let delimiter = "/";
  if (dateString.includes("-")) {
    delimiter = "-";
  }
  const [day, month, year] = dateString.split(delimiter).map(Number);
  const convertedDate = new Date(year, month - 1, day);
  return convertedDate;
}
function getEndOfDay(date) {
  let endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}
function isValidDate$1(dateString) {
  const date = new Date(dateString);
  return !isNaN(date);
}
function calculateAge(birthdate) {
  const dob = new Date(birthdate);
  const today = /* @__PURE__ */ new Date();
  const diffTime = Math.abs(today - dob);
  const ageMilliseconds = new Date(diffTime).getFullYear() - 1970;
  const age = Math.floor(ageMilliseconds);
  return age;
}
function calculateReadableAge(birthDate) {
  const today = /* @__PURE__ */ new Date();
  const birth = new Date(birthDate);
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (months < 0 || months === 0 && today.getDate() < birth.getDate()) {
    years--;
    months += 12;
  }
  if (days < 0) {
    months--;
    const tempDate = new Date(today.getFullYear(), today.getMonth(), 0);
    days = tempDate.getDate() - birth.getDate() + today.getDate();
  }
  let ageString = "";
  if (years > 0) {
    ageString += years + (years === 1 ? " año" : " años");
    return ageString;
  }
  if (months > 0) {
    ageString += months + (months === 1 ? " mes, " : " meses, ");
  }
  if (days > 0) {
    ageString += days + (days === 1 ? " día" : " días");
  }
  return ageString;
}
function intlDateTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric"
  }).format(date).replace(/\//g, "-");
}
function intlDate(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replace(/\//g, "-");
}
function intlTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "numeric"
  }).format(date);
}
function intlDay(date) {
  return cleanTimeFormat(new Intl.DateTimeFormat("es-DO", {
    weekday: "long"
  }).format(date));
}
function intlTimeClean(date) {
  return cleanTimeFormat(new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "numeric"
  }).format(date));
}
function intlReadbleDateTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric"
  }).format(date);
}
function intlReadbleDate(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date).replace(/DE/gi, "");
}
function addCurrentTimeToDate(date) {
  let currentTime = (/* @__PURE__ */ new Date()).getTime();
  date.setHours(new Date(currentTime).getHours());
  date.setMinutes(new Date(currentTime).getMinutes());
  date.setSeconds(new Date(currentTime).getSeconds());
  return date;
}
function mysqlDateTime(date) {
  const addZero = (number) => number < 10 ? "0" + number : number;
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(
    date.getSeconds()
  )}`;
}
function formatDateTime(inputDate) {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
  return formattedDateTime;
}
async function postMarkTemplate(data2) {
  var _a;
  try {
    const response2 = await axios({
      method: "post",
      url: "https://api.postmarkapp.com/email/withTemplate",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_API
      },
      data: data2
    });
    return response2;
  } catch (error) {
    console.log(error);
    throw {
      code: (error == null ? void 0 : error.code) || null,
      err: ((_a = error == null ? void 0 : error.response) == null ? void 0 : _a.body) || null,
      msg: "Email no pudo ser enviado"
    };
  }
}
async function postMarkErrors(data2) {
  var _a;
  try {
    const response2 = await axios({
      method: "post",
      url: "https://api.postmarkapp.com/email",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_SAONAS_API
      },
      data: data2
    });
    return response2;
  } catch (error) {
    console.log(error);
    throw {
      code: (error == null ? void 0 : error.code) || null,
      err: ((_a = error == null ? void 0 : error.response) == null ? void 0 : _a.body) || null,
      msg: "Email no pudo ser enviado"
    };
  }
}
function fixString(str) {
  if (!str)
    return str;
  let correctedStr = String(str).toLowerCase();
  correctedStr = correctedStr.replace("?", "ñ");
  correctedStr = correctedStr.replace(/(?:^|\s)\S/g, function(char) {
    return char.toUpperCase();
  });
  return correctedStr;
}
function padToEleven(num) {
  if (!num) {
    return num;
  }
  return num.toString().padStart(11, "0");
}
function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
function mapColumnsToLetters(columnsKeys) {
  return columnsKeys.reduce((acc, key, index) => {
    const letter = String.fromCharCode(65 + index);
    acc[letter] = key;
    return acc;
  }, {});
}
function separatedByComma(...params) {
  return params.filter(Boolean).join(", ");
}
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function sortObjectByValue(obj) {
  const entries = Object.entries(obj);
  entries.sort((a, b) => b[1] - a[1]);
  const sortedObject = Object.fromEntries(entries);
  return sortedObject;
}
function isDevEnvironment() {
  return process.env.NODE_ENV === "development" ? true : false;
}
function currency(number, currency2 = "USD", currencyDisplay = "narrowSymbol") {
  if (!number && number !== 0) {
    return 0;
  }
  if (isNaN(number)) {
    return 0;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency2,
    currencyDisplay
  }).format(number);
}
function cleanCurrency(currencyString) {
  if (!currencyString) {
    return null;
  }
  const cleanedString = String(currencyString).replace(/[^0-9.]/g, "");
  const sanitizedString = cleanedString.replace(/\.+/g, ".");
  const parsedNumber = parseFloat(sanitizedString);
  if (isNaN(parsedNumber)) {
    return 0;
  }
  return parsedNumber;
}
function startPage(page, limit) {
  if (page > 1) {
    return (page - 1) * limit;
  } else {
    return 0;
  }
}
function hexcode() {
  return Math.floor(1e5 + Math.random() * 9e5);
}
function binaryToArray(binaryNumber) {
  const result = [];
  let position = 1;
  while (binaryNumber > 0) {
    if (binaryNumber & 1) {
      result.push(position);
    }
    position <<= 1;
    binaryNumber >>= 1;
  }
  return result;
}
function prepareWhereNull(opts, key) {
  const newObj = { ...opts };
  newObj.where += ` AND ?? IS NULL`;
  newObj.args.push(key);
  return newObj;
}
function prepareWhereNotNull(opts, key) {
  const newObj = { ...opts };
  newObj.where += ` AND ?? IS NOT NULL`;
  newObj.args.push(key);
  return newObj;
}
function prepareOrLike(opts, arr, column) {
  const newObj = { ...opts };
  for (let j = 0; j < arr.length; j++) {
    const ele = arr[j];
    if (j) {
      newObj.where += ` AND`;
    }
    newObj.where += ` ?? LIKE ?`;
    newObj.args.push(column, `%${ele}%`);
  }
  return newObj;
}
function prepareWhereOr(opts, obj) {
  let newObj = { ...opts };
  if (obj && Object.values(obj).length === 0) {
    return newObj;
  }
  newObj.where += ` AND (`;
  let i = 0;
  for (const key in obj) {
    const value = obj[key];
    if (key.includes(":")) {
      newObj = prepareWildcard(newObj, key, value, "OR", i);
      i++;
      continue;
    }
    newObj.where += ` ${!i ? "" : "OR"} ?? = ?`;
    newObj.args.push(key, value);
    i++;
  }
  newObj.where += ` )`;
  return newObj;
}
function prepareWildcard(opts, key, value, logicalOperator = "AND", _i = 0) {
  let newObj = { ...opts };
  const [m, column] = key.split(":");
  const op = operation[m];
  if (!op) {
    return;
  }
  if (op === "ISNULL") {
    newObj = prepareWhereNull(newObj, column);
    return newObj;
  }
  if (op === "ISNOTNULL") {
    newObj = prepareWhereNotNull(newObj, column);
    return newObj;
  }
  if (op === "ORLIKE") {
    const arr = value.split(" ");
    if (logicalOperator === "AND") {
      newObj.where += ` AND (`;
    } else {
      newObj.where += ` ${!_i ? "" : "OR"} (`;
    }
    if (column.includes(",")) {
      column.split(",").forEach((k, i) => {
        newObj.where += ` ${i ? "OR" : ""} (`;
        newObj = prepareOrLike(newObj, arr, k);
        newObj.where += ")";
      });
    } else {
      newObj = prepareOrLike(newObj, arr, column);
    }
    newObj.where += ")";
    return newObj;
  }
  if (op === "IN") {
    newObj.where += ` AND ?? ${op} (?)`;
    newObj.args.push(column, value);
    return newObj;
  }
  if (op === "LIKE") {
    newObj.where += ` AND ?? ${op} ?`;
    newObj.args.push(column, "%" + value + "%");
    return newObj;
  }
  if (op === "NOT IN") {
    newObj.where += ` AND COALESCE(??,-1) ${op} (?)`;
    newObj.args.push(column, value);
    return newObj;
  }
  if (op === "JSON_CONTAINS") {
    newObj.where += ` AND JSON_CONTAINS(??, ?)`;
    newObj.args.push(column, JSON.stringify(value));
    return newObj;
  }
  if (op === "JSON_OVERLAPS") {
    value = JSON.stringify(value);
    newObj.where += ` AND JSON_OVERLAPS(??, ?)`;
    newObj.args.push(column, value);
    return newObj;
  }
  if (op === "JSON_SEARCH") {
    const [col, col_id] = column.split("|");
    newObj.where += ` AND JSON_SEARCH(??, 'all', ?, NULL, '$[*].${col_id || "id"}') IS NOT NULL`;
    newObj.args.push(col, value);
    return newObj;
  }
  if (logicalOperator === "AND") {
    newObj.where += ` AND ?? ${op} ?`;
  } else {
    newObj.where += ` ${!_i ? "" : "OR"} ?? ${op} ?`;
  }
  newObj.args.push(column, value);
  return newObj;
}
function prepareWhere(where) {
  let opts = {
    args: [],
    where: ""
  };
  for (const key in where) {
    const value = where[key];
    if (value === void 0) {
      continue;
    }
    if (value === null) {
      opts = prepareWhereNull(opts, key);
      continue;
    }
    if (key === "or") {
      opts = prepareWhereOr(opts, value);
      continue;
    }
    if (key.includes(":")) {
      opts = prepareWildcard(opts, key, value);
      continue;
    }
    if (value.constructor === Object) {
      for (const k in value) {
        if (Object.hasOwnProperty.call(value, k)) {
          const v = value[k];
          if (k === "from") {
            opts.where += ` AND ?? >= ?`;
            opts.args.push(key, convertToValidDate(v));
            continue;
          }
          if (k === "to") {
            opts.where += ` AND ?? <= ?`;
            opts.args.push(key, getEndOfDay(convertToValidDate(v)));
            continue;
          }
        }
      }
      continue;
    }
    opts.where += ` AND ?? = ?`;
    opts.args.push(key, value);
    continue;
  }
  return opts;
}
function isValidDate(dateStr) {
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match)
    return false;
  const [_, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function isValidTime(timeStr) {
  const regex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/;
  return regex.test(timeStr);
}
function normalizeToUpperCase(value) {
  if (typeof value !== "string")
    return value;
  return value.toLocaleUpperCase().trim();
}
async function prepareData({ user, table: table2, data: data2, action = "CREATE", options }) {
  const _data = {};
  delete data2.id;
  delete data2.color;
  const columns = await getColumns(table2);
  const column_names = columns.map((i) => i.COLUMN_NAME);
  columns.map((i) => i.COLUMN_TYPE);
  for (const key in data2) {
    const value = data2[key];
    const index = column_names.indexOf(key);
    if (index !== -1) {
      if (/^\$(.*?)_ids/.test(key)) {
        if (value.length) {
          const cat = key.replace(/^\$(.*?)_ids/, "$1");
          const cats = await getCategoryMultiple(value);
          _data[cat] = JSON.stringify(cats.map((i) => normalizeToUpperCase(i.description)));
          _data[key] = JSON.stringify(value.map(String));
        } else {
          const cat = key.replace(/^\$(.*?)_ids/, "$1");
          _data[cat] = null;
          _data[key] = null;
        }
        continue;
      }
      if ([void 0, null, "null", "", 0].includes(value)) {
        if (/^\$(.*?)_ids/.test(key)) {
          const cat = key.replace(/^\$(.*?)_ids/, "$1");
          _data[key] = [];
          _data[cat] = [];
        } else if (/^\$(.*?)_id/.test(key)) {
          const cat = key.replace(/^\$(.*?)_id/, "$1");
          _data[key] = null;
          _data[cat] = null;
        } else if (value === null || value === "" || value === 0) {
          _data[key] = value;
        }
        continue;
      }
      if (/^\$(.*?)_id/.test(key)) {
        const cat = key.replace(/^\$(.*?)_id/, "$1");
        const { description, color } = await getCategoryById(value);
        _data[cat] = normalizeToUpperCase(description);
        _data[key] = value;
        if (color) {
          _data.color = color;
        }
        continue;
      }
      if (value.constructor === Array) {
        _data[key] = JSON.stringify(value);
        continue;
      }
      if (value.constructor === Object) {
        _data[key] = JSON.stringify(value);
        continue;
      }
      if (table2 === "t_user" || table2 === "t_file" || ["link_gps", "webpage", "token", "password", "reset_password_token", "instagram", "linkedin", "social"].includes(key)) {
        _data[key] = value;
      } else {
        _data[key] = normalizeToUpperCase(value);
      }
    }
  }
  if (table2 === "t_privilege") {
    return _data;
  }
  switch (action) {
    case "CREATE":
      console.log(user);
      _data.account_id = (user == null ? void 0 : user.account_id) || 1;
      _data.created_by = (user == null ? void 0 : user.description) || "System";
      _data.created_by_id = (user == null ? void 0 : user.id) || 1;
      _data.created = mysqlDateTime(/* @__PURE__ */ new Date());
      break;
    case "UPDATE":
      delete _data.created;
      if (options == null ? void 0 : options.modified) {
        _data.modified_by = (user == null ? void 0 : user.description) || "System";
        _data.modified_by_id = (user == null ? void 0 : user.id) || 1;
        _data.modified = mysqlDateTime(/* @__PURE__ */ new Date());
      }
      if (_data.hasOwnProperty("modified_arr")) {
        const modified_arr = {
          modified_by: _data.modified_by,
          modified_by_id: _data.modified_by_id,
          modified: _data.modified,
          modified_format: intlDateTime(/* @__PURE__ */ new Date())
        };
        if (!_data.modified_arr) {
          _data.modified_arr = [modified_arr];
        } else {
          _data.modified_arr = JSON.parse(_data.modified_arr);
          _data.modified_arr.push(modified_arr);
        }
        _data.modified_arr = JSON.stringify(_data.modified_arr);
      }
      break;
  }
  return _data;
}
const pool = mysql.createPool({
  connectionLimit: 20,
  host: "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME_GLOBAL
});
pool.getConnection((err, connection) => {
  if (err) {
    console.log(err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }
  if (connection)
    connection.release();
  return;
});
pool.query = util.promisify(pool.query);
async function getProfilePic({ ref_key, ref_id }) {
  const [file] = await pool$1.query(
    "SELECT id, url, thumb, small, description, ref_key, $file_type_id, file_type, type, icon FROM t_file WHERE ref_key=? AND ref_id=? AND $file_type_id=188 AND  c_status & 4 ORDER BY id DESC",
    [ref_key, ref_id]
  );
  return file;
}
async function getFiles({ ref_key, ref_id }) {
  const files = await pool$1.query(
    "SELECT id, url, thumb, small, description, ref_key, $file_type_id, file_type, type, icon FROM t_file WHERE ref_key=? AND ref_id=? AND c_status & 4 ORDER BY id DESC",
    [ref_key, ref_id]
  );
  return files;
}
async function getPDF({ ref_key, ref_id }) {
  const [item] = await pool$1.query(
    "SELECT url, description FROM t_file WHERE ref_key=? AND ref_id=? AND c_status & 4 ORDER BY id DESC LIMIT 1",
    [ref_key, ref_id]
  );
  return item;
}
async function getCode({ table: table2 }) {
  const sql = `SELECT code FROM ${table2} ORDER BY code DESC limit 1`;
  const [item] = await pool$1.query(sql);
  return (item == null ? void 0 : item.code) ? ++item.code : codes[table2] + 1;
}
async function getColumns(table2, COLUMN_KEY = true) {
  var columns = await pool$1.query(
    `SELECT COLUMN_NAME, COLUMN_KEY, EXTRA, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${process.env.DB_NAME}' AND TABLE_NAME = '${table2}' ORDER BY COLUMN_NAME DESC`
  );
  return COLUMN_KEY ? columns : columns.map((column) => column["COLUMN_NAME"]);
}
async function validateColumns(table2, columns) {
  const items = await getColumns(table2, false);
  return columns.every((i) => items.includes(i));
}
async function getRows({
  table: table2,
  user,
  query,
  auth = 1,
  optsServer = {
    columns: "",
    having: ""
  }
}) {
  var _a, _b, _c;
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
    access: ""
  };
  if (query.columns && isObject(query.columns)) {
    for (const key in query.columns) {
      if (Object.prototype.hasOwnProperty.call(query.columns, key)) {
        const columns = query.columns[key];
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          const str = column === "*" && "*";
          if (str) {
            opts.columns += `${key}.${str}`;
          } else {
            const validColumns = await validateColumns(key, columns);
            if (validColumns) {
              opts.columns += `, ${key}.${column}`;
            }
          }
        }
      }
    }
  } else {
    opts.columns = "*";
  }
  if (auth) {
    opts.privilege = joinPrivileges(table2, "read");
    opts.access = canRead(table2, user);
  }
  if ((_a = query.join) == null ? void 0 : _a.length) {
    for (let i = 0; i < query.join.length; i++) {
      const j = query.join[i];
      if (j.using) {
        opts.join += ` LEFT JOIN ?? USING(??)`;
        opts.args = opts.args.concat(j.table, j.using);
        opts.argsTotal = opts.argsTotal.concat(j.table, j.using);
        opts.columns += `, ${j.table}.id AS _id`;
      } else {
        opts.join += ` LEFT JOIN ?? ON ??=??`;
        opts.args = opts.args.concat(j.table, j.relationA, j.relationB);
        const relationA = j.relationA.split(".")[0];
        const relationB = j.relationB.split(".")[0];
        opts.argsTotal = opts.argsTotal.concat(j.table, j.relationA, j.relationB);
        opts.columns = `${relationA}.*, ${relationB}.*`;
      }
    }
  }
  if (query.where) {
    let { where, args } = prepareWhere(query.where);
    opts.where += where;
    opts.args = opts.args.concat(args);
    opts.argsTotal = opts.argsTotal.concat(args);
  }
  if ((_b = query.groupBy) == null ? void 0 : _b.length) {
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
        opts.order += `${i ? "," : ""} LENGTH(??) ${value === "DESC" ? "DESC" : "ASC"}`;
      } else {
        opts.order += `${i ? "," : ""} ?? ${value === "DESC" ? "DESC" : "ASC"}`;
      }
      opts.args.push(key);
      i++;
    }
  }
  if (query.limit) {
    opts.limit = ` LIMIT ?, ?`;
    const start = startPage(query.page, query.limit);
    opts.args.push(start, parseInt(query.limit));
  }
  opts.sql = `SELECT ${opts.columns} ${optsServer.columns ? ", " + optsServer.columns : ""} FROM ${table2} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy} ${optsServer.having || ""} ${opts.order} ${opts.limit}`;
  const sql = mysql.format(opts.sql, opts.args);
  const items = await pool$1.query(sql);
  opts.sqlTotal = `SELECT COUNT(*) as count FROM ${table2} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy} ${optsServer.having || ""}`;
  if ((_c = opts.groupBy) == null ? void 0 : _c.length) {
    opts.sqlTotal = `SELECT COUNT(*) as count
    FROM
    (${opts.sqlTotal}) as t`;
  }
  const sqlTotal = mysql.format(opts.sqlTotal, opts.argsTotal);
  const [total] = await pool$1.query(sqlTotal);
  return {
    items,
    total: total.count,
    sql,
    sqlTotal
  };
}
async function getRowsUtils({
  table: table2,
  user,
  query,
  auth = 1,
  optsServer = {
    columns: ""
  }
}) {
  var _a, _b, _c;
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
    access: ""
  };
  if (query.columns && await validateColumns(table2, query.columns)) {
    opts.columns = query.columns.join(",");
  }
  if (auth) {
    opts.privilege = joinPrivileges(table2, "read");
    opts.access = canRead(table2, user);
  }
  if ((_a = query.join) == null ? void 0 : _a.length) {
    for (let i = 0; i < query.join.length; i++) {
      const j = query.join[i];
      opts.join += ` LEFT JOIN ?? USING(??)`;
      opts.args = opts.args.concat(j.table, j.using);
      opts.argsTotal = opts.argsTotal.concat(j.table, j.using);
    }
  }
  if (query.where) {
    let { where, args } = prepareWhere(query.where);
    opts.where += where;
    opts.args = opts.args.concat(args);
    opts.argsTotal = opts.argsTotal.concat(args);
  }
  if ((_b = query.groupBy) == null ? void 0 : _b.length) {
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
        opts.order += `${i ? "," : ""} LENGTH(??) ${value === "DESC" ? "DESC" : "ASC"}`;
      } else {
        opts.order += `${i ? "," : ""} ?? ${value === "DESC" ? "DESC" : "ASC"}`;
      }
      opts.args.push(key);
      i++;
    }
  }
  if (query.limit) {
    opts.limit = ` LIMIT ?, ?`;
    const start = startPage(query.page, query.limit);
    opts.args.push(start, parseInt(query.limit));
  }
  opts.sql = `SELECT ${opts.columns} ${optsServer.columns ? ", " + optsServer.columns : ""} FROM ${table2} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy} ${opts.order} ${opts.limit}`;
  const sql = mysql.format(opts.sql, opts.args);
  const items = await pool.query(sql);
  opts.sqlTotal = `SELECT COUNT(*) as count FROM ${table2} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy}`;
  if ((_c = opts.groupBy) == null ? void 0 : _c.length) {
    opts.sqlTotal = `SELECT COUNT(*) as count
    FROM
    (${opts.sqlTotal}) as t`;
  }
  const sqlTotal = mysql.format(opts.sqlTotal, opts.argsTotal);
  const [total] = await pool.query(sqlTotal);
  return {
    items,
    total: total.count,
    sql
  };
}
async function getRowById({ table: table2, user, query = {}, id, auth = 1 }) {
  var _a, _b;
  const opts = {
    args: [id],
    where: ` WHERE 1 AND ${table2}.id=?`,
    odir: "DESC",
    join: [],
    groupBy: "",
    columns: "*",
    sql: "",
    privilege: "",
    access: ""
  };
  if (auth) {
    opts.privilege = joinPrivileges(table2, "read");
    opts.access = canRead(table2, user);
  }
  if ((_a = query.join) == null ? void 0 : _a.length) {
    for (let i = 0; i < query.join.length; i++) {
      const j = query.join[i];
      opts.join += ` LEFT JOIN ?? USING(??)`;
      opts.args = opts.args.concat(j.table, j.using);
    }
  }
  if (query.where) {
    let { where, args } = prepareWhere(query.where);
    opts.where += where;
    opts.args = opts.args.concat(args);
  }
  if ((_b = query.groupBy) == null ? void 0 : _b.length) {
    opts.groupBy = ` GROUP BY`;
    for (let i = 0; i < query.groupBy.length; i++) {
      const v = query.groupBy[i];
      opts.groupBy += `${i ? "," : ""} ??`;
      opts.args.push(v);
    }
  }
  opts.sql = `SELECT ${opts.columns} FROM ${table2} ${opts.join} ${opts.privilege} ${opts.where} ${opts.access} ${opts.groupBy}`;
  const sql = mysql.format(opts.sql, opts.args);
  const [item] = await pool$1.query(sql);
  return item;
}
async function insert({ user, table: table2, data: data2, log = false, auth = 1 }) {
  if (auth) {
    const privileges = await tablePrivileges(table2, user);
    const privilege = hasPrivileges(privileges, "create");
    if (!privilege)
      return false;
  }
  let _data = await prepareData({
    user,
    table: table2,
    data: data2
  });
  const sql = mysql.format(`INSERT ${table2} SET ?`, _data);
  const response2 = await pool$1.query(sql);
  let id = response2.insertId;
  if (log) {
    let dat = { data: JSON.stringify(_data), ref_key: table2, ref_id: id, action: "create", created: _data.created, created_by: _data.created_by, created_by_id: _data.created_by_id };
    const sql2 = mysql.format(`INSERT t_log SET ?`, [dat]);
    await pool$1.query(sql2);
  }
  return {
    id,
    lines: response2.affectedRows
  };
}
async function update({ id, ref_key = "id", user, table: table2, data: data2, log = false, options = { modified: true } }) {
  const privilege = await joinPrivileges(table2, "write");
  const access = canWrite(table2, user);
  const _data = await prepareData({
    user,
    table: table2,
    data: data2,
    action: "UPDATE",
    options
  });
  const args = [_data, ref_key, id];
  const where = " WHERE 1 AND ??=?";
  const sql = mysql.format(
    `UPDATE ${table2} ${privilege} SET ? ${where} ${access}`,
    args
  );
  const response2 = await pool$1.query(sql);
  if (log) {
    let dat = { data: JSON.stringify(_data), ref_key: table2, ref_id: id, action: "update", created: _data.modified, created_by: _data.created_by, created_by_id: _data.created_by_id };
    const sql2 = mysql.format(`INSERT t_log SET ?`, [dat]);
    await pool$1.query(sql2);
  }
  return {
    id,
    lines: response2.affectedRows
  };
}
async function updatePublic({ id, ref_key = "id", user, table: table2, data: data2 }) {
  const _data = await prepareData({
    user,
    table: table2,
    data: data2,
    action: "UPDATE"
  });
  const args = [_data, ref_key, id];
  const where = " WHERE 1 AND ??=?";
  const sql = mysql.format(`UPDATE ${table2} SET ? ${where}`, args);
  const response2 = await pool$1.query(sql);
  return {
    id,
    lines: response2.affectedRows
  };
}
async function getCategoryLevel(parentid) {
  let [item] = await pool$1.query("SELECT level FROM t_category WHERE id = ?", [
    parentid
  ]);
  return item.level + 1;
}
async function getCategoryMultiple(id) {
  return await pool$1.query(
    "SELECT id, description FROM t_category WHERE id IN(?)",
    [id]
  );
}
async function getCategoryById(id) {
  let [item] = await pool$1.query("SELECT * FROM t_category WHERE id = ?", [id]);
  return item;
}
async function getCategoryDescriptionById(id) {
  let [item] = await pool$1.query("SELECT * FROM t_category WHERE id = ?", [id]);
  return item ? item.description : null;
}
async function getCategoryByRef(ref) {
  let [item] = await pool$1.query("SELECT * FROM t_category WHERE ref = ?", [
    ref
  ]);
  return item;
}
async function getSchema() {
  let schema = await pool$1.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${process.env.DB_NAME}'`
  );
  let tables_unixperms = [];
  let tables_roles = [];
  for (const table2 of schema) {
    let structure = await pool$1.query("DESCRIBE " + table2["TABLE_NAME"]);
    let index = structure.findIndex((item) => {
      return item.Field == "c_unixperms";
    });
    if (index != -1) {
      let column = await pool$1.query(
        `SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${process.env.DB_NAME}' AND TABLE_NAME = '${table2["TABLE_NAME"]}' AND COLUMN_NAME='c_unixperms'`
      );
      tables_unixperms.push({
        loading: false,
        label: table2["TABLE_NAME"],
        value: column[0]["COLUMN_DEFAULT"]
      });
      let [role] = await pool$1.query(
        `SELECT COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='${process.env.DB_NAME}' AND TABLE_NAME = '${table2["TABLE_NAME"]}' AND COLUMN_NAME='c_roles'`
      );
      tables_roles.push({
        label: table2["TABLE_NAME"],
        value: role["COLUMN_DEFAULT"],
        loading: false
      });
    }
  }
  return { tables_unixperms, tables_roles };
}
async function getTable() {
  let schema = await pool$1.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${process.env.DB_NAME}'`
  );
  const hiddenColumns = ["t_action", "t_map", "t_privilege", "t_session"];
  return schema.map((row) => row["TABLE_NAME"]).filter((i) => hiddenColumns.indexOf(i) === -1);
}
const getBody = async ({ table: table2, data: data2, account, file = "body" }) => {
  try {
    return await ejs.renderFile(
      path__default.join(path__default.resolve(), `views/template/pdf/${table2}/${file}.ejs`),
      {
        data: data2,
        account
      }
    );
  } catch (error) {
    console.log(error);
  }
};
function generateConciliation({ item, items }) {
  try {
    const header = [
      { text: "FECHA", style: "th", noWrap: true },
      { text: "PROVEEDOR", style: "th", noWrap: true },
      { text: "PRESTADOR DE\nSERVICIOS", style: "th", alignment: "center" },
      { text: "CONCEPTO", style: "th" },
      { text: "MONTO\nFACTURADO", style: "thR", alignment: "right" },
      { text: "DESCUENTO DE\nAJUSTE", style: "thR", alignment: "right" },
      { text: "MONTO A\nPROCESAR", style: "thR", alignment: "right" },
      { text: "DEDUCIBLE", style: "thR" },
      { text: "COPAGO", style: "thR" },
      { text: "CUBIERTO", style: "thR" },
      { text: "PAGO\nASEGURADORA", style: "thR", alignment: "right" },
      { text: "RESP.\nASEGURADORA", style: "thR", alignment: "right" },
      { text: "AUTORIZACIÓN", style: "th" },
      { text: "NOTA", style: "th" }
    ];
    const body = [header];
    items.forEach((r) => {
      body.push([
        { text: intlDate(r.book_date), alignment: "center", noWrap: true },
        r.provider_description,
        r.doctor_description,
        r.item_description,
        { text: currency(r.billed_amount), style: "num" },
        { text: currency(r.discount), style: "num" },
        { text: currency(r.coverage), style: "num" },
        { text: currency(r.deducible), style: "num" },
        { text: currency(r.copago), style: "num" },
        { text: currency(r.covered), style: "num" },
        { text: currency(r.insurance_payment), style: "num" },
        { text: currency(r.insurance_responsability), style: "num" },
        r.insurance_claim || "",
        r.note || ""
      ]);
    });
    const docDefinition = {
      pageSize: "LETTER",
      pageOrientation: "landscape",
      // márgenes más estrechos
      pageMargins: [12, 18, 12, 18],
      defaultStyle: { fontSize: 7, lineHeight: 1.15 },
      content: [
        item.insured_description ? { text: item.insured_description, bold: true, fontSize: 9, margin: [0, 0, 0, 6] } : {},
        {
          table: {
            headerRows: 1,
            // valores más bajos para que todo quepa
            widths: [32, 60, 60, "*", 46, 50, 50, 40, 40, 44, 60, 60, 50, 55],
            body
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? "#0d2f57" : rowIndex % 2 ? "#f5f8fb" : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#c8d4e0",
            vLineColor: () => "#c8d4e0",
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 2,
            paddingBottom: () => 2
          },
          dontBreakRows: true,
          keepWithHeaderRows: 1
        }
      ],
      styles: {
        th: { color: "white", bold: true },
        thR: { color: "white", bold: true, alignment: "right" },
        num: { alignment: "right" }
      }
    };
    const logoB64 = convertImagetoBase64("logoText.png");
    const dd = {
      pageSize: "LETTER",
      pageOrientation: "landscape",
      pageMargins: [0, 90, 0, 60],
      header: (currentPage, pageCount, pageSize) => {
        return {
          stack: [
            // Fondo gris
            {
              canvas: [
                { type: "rect", x: 0, y: 0, w: pageSize.width, h: 40, color: "#f2f2f2" }
              ]
            },
            // Contenido del header
            {
              margin: [40, -35, 40, 0],
              columns: [
                {
                  image: "logoBupa",
                  // tu logo base64
                  width: 60,
                  alignment: "center",
                  margin: [0, -5, 0, 0]
                  // para centrar verticalmente
                },
                {
                  text: "Explicación de Beneficios",
                  style: "headerTitle",
                  alignment: "center",
                  margin: [0, 10, 0, 0]
                },
                {
                  stack: [
                    { text: "07-07-2025", fontSize: 9 },
                    { text: `Página ${currentPage} de ${pageCount}`, fontSize: 9 }
                  ],
                  width: 80,
                  margin: [0, 5, 0, 0]
                  // centra verticalmente el bloque derecho
                }
              ]
            }
          ]
        };
      },
      footer: (currentPage) => {
        if (currentPage === 1) {
          return {
            margin: [40, 0, 40, 20],
            stack: [
              { text: "ESTE DOCUMENTO NO ES UNA FACTURA.", style: "footerNote", alignment: "center" },
              { text: "Este documento es una explicación de los beneficios pagaderos bajo su seguro de salud.", style: "footerText", alignment: "center" }
            ]
          };
        }
        return null;
      },
      content: [
        {
          margin: [40, 0, 40, 0],
          columns: [
            {
              width: "60%",
              stack: [
                { text: "Asegurado Principal", style: "sectionTitle" },
                { text: item.insured_description, style: "text" },
                { text: "DOMICILIO REGISTRADO", style: "text" },
                { text: "SANTO DOMINGO, DOMINICAN REPUBLIC", style: "text", margin: [0, 0, 0, 10] },
                { text: "Número de Póliza", style: "sectionTitle" },
                { text: item.policy_number, style: "text", margin: [0, 0, 0, 10] },
                { text: "Producto", style: "sectionTitle" },
                { text: "NOMBRE DEL PLAN", style: "text", margin: [0, 0, 0, 10] },
                { text: "Agente", style: "sectionTitle" },
                { text: "MATOS CORREDORES DE SEGUROS, SRL", style: "text" }
              ]
            },
            {
              width: "40%",
              stack: [
                { text: "Servicio al Cliente", style: "sectionTitle" },
                { text: "Para cualquier pregunta puede contactarnos a través de", style: "text" },
                { text: "https://www.momatos.com/contactanos y enviarnos una consulta.", style: "text" },
                { text: "También puede contactarnos en nuestra línea de Servicio al Cliente al:", style: "text" },
                { text: "(809) 620-0000", style: "phone" },
                { text: "o consulte nuestra página web:", style: "text" },
                { text: "https://www.momatos.com", style: "text" }
              ]
            }
          ]
        },
        {
          style: { fontSize: 7, lineHeight: 1.15 },
          table: {
            headerRows: 1,
            // valores más bajos para que todo quepa
            widths: [32, 60, 60, "*", 46, 50, 50, 40, 40, 44, 60, 60, 50, 55],
            body
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? "#EAEAEA" : rowIndex % 2 ? "#f5f8fb" : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#c8d4e0",
            vLineColor: () => "#c8d4e0",
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 2,
            paddingBottom: () => 2
          },
          dontBreakRows: true,
          keepWithHeaderRows: 1,
          pageBreak: "before"
        }
      ],
      styles: {
        headerTitle: { fontSize: 14, bold: true },
        sectionTitle: { fontSize: 9, bold: true, margin: [0, 5, 0, 1] },
        text: { fontSize: 9 },
        phone: { fontSize: 9, bold: true },
        footerNote: { fontSize: 9, bold: true },
        footerText: { fontSize: 8 },
        th: { color: "black", bold: true, lineHeight: 0.7 },
        thR: { color: "black", bold: true, alignment: "right", lineHeight: 0.7 },
        num: { alignment: "right" }
      },
      images: {
        logoBupa: logoB64
        // aquí usamos tu función para obtener base64
      }
    };
    return { docDefinition: dd };
  } catch (error) {
    console.log(error);
  }
}
let browser;
const uploadDir = path__default.join(path__default.resolve(), "/privated/uploads/");
const imagesBase64Dir$1 = path__default.join(path__default.resolve(), "/public/base64/");
function getFilePathFromUrl(fileUrl) {
  const url = new URL(fileUrl);
  const relativePath = url.pathname.replace("/privated/uploads/", "");
  const filePath2 = path__default.join(uploadDir, relativePath);
  return filePath2;
}
async function pdfToImg2(pdf_document) {
  try {
    const images = await pdfToImg(pdf_document, {
      pages: "all",
      imgType: "png",
      scale: 2,
      background: "white"
    });
    let files = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filename = `tempora${i}.png`;
      const pdfFolder = path__default.join(process.cwd(), "privated", "uploads", "tmp");
      if (!fs.existsSync(pdfFolder)) {
        await fs.promises.mkdir(pdfFolder, { recursive: true });
      }
      const tmpImage = path__default.join(pdfFolder, filename);
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      await fs.writeFileSync(tmpImage, buffer);
      files.push(filename);
    }
    return files;
  } catch (error) {
    console.log(error);
  }
}
function convertImagetoBase64(file) {
  const imageBuffer = fs.readFileSync(`${imagesBase64Dir$1}/${file}`);
  const base64Image = imageBuffer.toString("base64");
  return `data:image/png;base64,${base64Image}`;
}
function convertImageUrltoBase64(filePath2) {
  const imageBuffer = fs.readFileSync(filePath2);
  const base64Image = imageBuffer.toString("base64");
  return `data:image/png;base64,${base64Image}`;
}
const storage = multer.diskStorage({
  destination: uploadDir
});
function createFolders(destination, arr) {
  for (const item of arr) {
    destination += "/" + item;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }
  }
}
function checkImageFile(file) {
  return /(\.|\/)(gif|jpg|jpeg|tiff|jfif|png|webp)$/i.test(file);
}
function checkDocFile(file) {
  return /(\.|\/)(pdf|xls|xlsx|doc|docx|sheet)$/i.test(file);
}
function checkDCMFile(file) {
  return /(\.|\/)(dcm)$/i.test(file);
}
function checkPdfFile(file) {
  return /(\.|\/)(pdf)$/i.test(file);
}
function checkWordFile(file) {
  return /(\.|\/)(doc|docx|dot|dotx|txt|wps)$/i.test(file);
}
function checkExcelFile(file) {
  return /(\.|\/)(xls|xlsx|sheet|csv)$/i.test(file);
}
function checkVideoFile(file) {
  return /(\.|\/)(mp4|webm)$/i.test(file);
}
function checkAudioFile(file) {
  return /(\.|\/)(mp3)$/i.test(file);
}
function checkFileType(file) {
  const filetypes = /(\.|\/)(gif|jpg|jpeg|tiff|png|pdf|xls|xlsx|doc|docx|sheet|mp4|mp3|webm|webp|jfif|dot|dotx|txt|wps|dcm)$/i;
  const extname = filetypes.test(path__default.extname(file.originalname).toLowerCase());
  if (extname) {
    return true;
  } else {
    return false;
  }
}
const uploadMultiple = multer({
  storage,
  limits: { fileSize: 3e7 },
  fileFilter: function(req, file, cb) {
    let res = checkFileType(file);
    if (!res) {
      cb(new Error("Solo Archivos Permitidos"));
    } else {
      cb(null, true);
    }
  }
}).array("file");
async function uploadDestination({ account, table: table2, id, file }) {
  createFolders(file.destination, [account.domain, table2, id]);
  const filename = file.filename + "." + file.originalname.split(".").pop();
  const data2 = {
    url: publicPath({ account, table: table2, id, filename }),
    type: null
  };
  let destination;
  let target;
  if (id) {
    destination = `${file.destination}/${account.domain}/${table2}/${id}/`;
    target = `${destination}/${filename}`;
  } else {
    destination = `${file.destination}/tmp`;
    target = `${destination}/${filename}`;
    `${process.env.DOMAIN}/privated/uploads/tmp/${filename}`;
  }
  fs.renameSync(file.path, target);
  if (checkImageFile(file.originalname)) {
    data2.type = "image";
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const resizedFile = await resizeFile({
        target,
        destination,
        filename,
        size
      });
      data2[size.type] = publicPath({
        account,
        table: table2,
        id,
        filename: resizedFile
      });
    }
    return data2;
  }
  if (checkVideoFile(file.originalname)) {
    data2.type = "video";
    data2.icon = "video";
    return data2;
  }
  if (checkAudioFile(file.originalname)) {
    data2.type = "audio";
    data2.icon = "audio";
    return data2;
  }
  if (checkDocFile(file.originalname)) {
    data2.type = "document";
    if (checkWordFile(file.originalname)) {
      data2.icon = "word";
    } else if (checkPdfFile(file.originalname)) {
      data2.icon = "pdf";
    } else if (checkExcelFile(file.originalname)) {
      data2.icon = "excel";
    }
    return { ...data2, destination, filename };
  }
  if (checkDCMFile(file.originalname)) {
    data2.type = "dcm";
    data2.icon = "dcm";
    return { ...data2, destination, filename };
  }
}
async function resizeFile({ target, destination, filename, size }) {
  try {
    if (size) {
      filename = `${size.type}/${filename}`;
      createFolders(destination, [size.type]);
    }
    await sharp(target, { failOnError: false }).resize((size == null ? void 0 : size.resize) || 1200, (size == null ? void 0 : size.resize) || 1200, {
      withoutEnlargement: true
    }).jpeg({ quality: 80 }).withMetadata().toFile(`${destination}/${filename}`);
    return filename;
  } catch (error) {
    console.log("sharp-error", error);
  }
}
function publicPath({ account, table: table2, id, filename }) {
  if (id) {
    return `${process.env.DOMAIN}/privated/uploads/${account.domain}/${table2}/${id}/${filename}`;
  } else {
    return `${process.env.DOMAIN}/privated/uploads/tmp/${filename}`;
  }
}
function filePath(file) {
  file = file.replace(/.+?(?=upload)/, "");
  return path__default.join(path__default.resolve(), "/privated", file);
}
async function imageToPDF(images) {
  const paths = [];
  for (let i = 0; i < images.length; i++) {
    const buf = await crypto.randomBytes(20);
    const token = buf.toString("hex");
    const filename = `${token}.pdf`;
    const image = images[i];
    const pngImage = fs.readFileSync(image);
    const instance = await load({ document: pngImage });
    const buffer = await instance.exportPDF();
    const newpdfPath = path__default.join(uploadDir, filename);
    paths.push(newpdfPath);
    fs.writeFileSync(newpdfPath, Buffer.from(buffer));
    instance.close();
  }
  return paths;
}
async function mergePDF(files) {
  const merger = new PDFMerger();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (fs.existsSync(file)) {
      await merger.add(file);
    }
  }
  return await merger.saveAsBuffer();
}
function replaceFile(target, value) {
  return fs.writeFileSync(target, value);
}
async function createBrowser() {
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // headless: 'new',
    headless: true,
    protocolTimeout: 6e4
  });
}
async function generatePDF({
  account,
  table: table2,
  id,
  filename,
  data: data2,
  bodyTemplate,
  landscape = false,
  header = false,
  footer = false,
  format: format2 = "letter",
  scale = 1,
  width = null,
  height = null,
  margin = {
    top: "180px",
    bottom: "100px",
    right: "0",
    left: "0"
  }
}) {
  const opts = {
    destination: null,
    filename: `${filename}.pdf`,
    headerTemplate: "<div></div>",
    footerTemplate: "<div></div>"
  };
  if (!browser) {
    await createBrowser();
  }
  const page = await browser.newPage();
  await page.setContent(bodyTemplate);
  if (id) {
    createFolders(uploadDir, [account.domain, table2, id]);
    opts.destination = `${uploadDir}/${account.domain}/${table2}/${id}/${opts.filename}`;
  } else {
    opts.destination = `${uploadDir}/tmp/${opts.filename}`;
  }
  if (header) {
    const headerFile = path__default.join(
      path__default.resolve(),
      `views/template/pdf/${header}/header.ejs`
    );
    if (fs.existsSync(headerFile)) {
      opts.headerTemplate = await ejs.renderFile(headerFile, {
        data: {
          ...data2,
          account
        }
      });
    }
  }
  if (footer) {
    const footerFile = path__default.join(
      path__default.resolve(),
      `views/template/pdf/${footer}/footer.ejs`
    );
    if (fs.existsSync(footerFile)) {
      opts.footerTemplate = await ejs.renderFile(footerFile, {
        data: {
          ...data2,
          account
        }
      });
    }
  }
  const options = {
    path: opts.destination,
    scale,
    displayHeaderFooter: true,
    printBackground: true,
    omitBackground: true,
    margin,
    headerTemplate: opts.headerTemplate,
    footerTemplate: opts.footerTemplate,
    landscape
  };
  if (width || height) {
    if (width) {
      options.width = width;
    }
    if (height) {
      options.height = height;
    }
  } else {
    options.format = format2;
  }
  await page.pdf(options);
  await page.close();
  return publicPath({
    account,
    table: table2,
    id,
    filename: opts.filename
  });
}
async function generatePDFWithPdfmake({
  account,
  table: table2,
  filename,
  docDefinition,
  id = null,
  fonts = null,
  outputPath = null
}) {
  const defaultFonts = fonts || {
    Roboto: {
      normal: path__default.resolve("fonts/noway-regular-webfont.ttf"),
      bold: path__default.resolve("fonts/noway-bold-webfont.ttf"),
      medium: path__default.resolve("fonts/noway-medium-webfont.ttf"),
      italics: path__default.resolve("fonts/noway_regular_italic-webfont.ttf"),
      bolditalics: path__default.resolve("fonts/noway_bold_italic-webfont.ttf")
    },
    OpenSans: {
      normal: path__default.resolve("fonts/OpenSans-Regular.ttf"),
      bold: path__default.resolve("fonts/OpenSans-Bold.ttf"),
      semibold: path__default.resolve("fonts/OpenSans-Semibold.ttf"),
      italic: path__default.resolve("fonts/OpenSans-Italic.ttf")
    }
  };
  const printer = new PdfPrinter(defaultFonts);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const pdfFilename = `${filename}.pdf`;
  let pdfFolder;
  if (outputPath) {
    pdfFolder = path__default.dirname(outputPath);
  } else if (id) {
    pdfFolder = path__default.join(process.cwd(), "privated", "uploads", account.domain, table2, id.toString());
  } else {
    pdfFolder = path__default.join(process.cwd(), "privated", "uploads", "tmp");
  }
  if (!fs.existsSync(pdfFolder)) {
    await fs.promises.mkdir(pdfFolder, { recursive: true });
  }
  const pdfPath = outputPath || path__default.join(pdfFolder, pdfFilename);
  const writeStream = fs.createWriteStream(pdfPath);
  pdfDoc.pipe(writeStream);
  pdfDoc.end();
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
  return publicPath({
    account,
    table: table2,
    id,
    filename: pdfFilename
  });
}
async function getFinalMapUrl(shortUrl) {
  if (!browser) {
    await createBrowser();
  }
  const page = await browser.newPage();
  await page.goto(shortUrl, { waitUntil: "networkidle2" });
  const finalUrl = page.url();
  await browser.close();
  return finalUrl;
}
function extractMapInfo(url) {
  const decodedUrl = decodeURIComponent(url);
  const nameMatch = decodedUrl.match(/maps\/place\/([^\/@]+)/);
  const placeName = nameMatch ? nameMatch[1].replace(/\+/g, " ") : null;
  const coordsMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const lat = coordsMatch ? parseFloat(coordsMatch[1]) : null;
  const lng = coordsMatch ? parseFloat(coordsMatch[2]) : null;
  return {
    placeName,
    lat,
    lng
  };
}
function joinPrivileges(table2, action) {
  return ` LEFT OUTER JOIN (SELECT * FROM t_privilege GROUP BY c_related_uid) tbl_privilege ON tbl_privilege.c_related_table = '${table2}' AND tbl_privilege.c_action = '${action}' AND ((tbl_privilege.c_type = 'object' and tbl_privilege.c_related_uid = ${table2}.id))`;
}
function hasPrivileges(privileges, require2) {
  let index = privileges.findIndex((privilege) => {
    return privilege.c_title.toUpperCase() == require2.toUpperCase();
  });
  return index != -1;
}
async function tablePrivileges(table2, user) {
  try {
    const query = `
      select ac.c_title
      from
          t_action as ac
          left outer join t_privilege as pr
              on pr.c_related_table = '${table2}'
                  and pr.c_action = ac.c_title
                  and pr.c_type = 'table'
      where
          (ac.c_apply_object = 0) and (
              (${user.unixroles} & 1 <> 0)
              or (pr.c_group = 'user' and pr.c_who = ${user.id})
              or (pr.c_group = 'role' and (pr.c_who & ${user.unixroles} <> 0)))
      `;
    return await pool$1.query(query);
  } catch (error) {
    console.log(error);
  }
}
function canRead(table2, user) {
  let access = `AND (
      ((${table2}.c_owner = ${user.id}) AND (${table2}.c_unixperms & ${permissions["owner_read"]})) 
      OR ((${table2}.c_roles & ${user.unixroles} ) AND ( ${table2}.c_unixperms & ${permissions["role_read"]})) 
      OR (${table2}.c_unixperms & ${permissions["other_read"]})
      OR (tbl_privilege.c_group = 'user' and tbl_privilege.c_who = ${user.id})
      OR (tbl_privilege.c_group = 'owner' and ${table2}.c_owner = ${user.id})
      OR (tbl_privilege.c_group = 'owner_role' and (${table2}.c_roles & ${user.unixroles} <> 0))
      OR (tbl_privilege.c_group = 'role' and (tbl_privilege.c_who & ${user.unixroles} <> 0))
      OR ${user.unixroles} & 1)`;
  if (tableWithNoAccountId.indexOf(table2) === -1) {
    access += `AND ${table2}.account_id = ${user.account_id}`;
  }
  return access;
}
function canWrite(table2, user) {
  let access = `AND ((( ${table2}.c_owner = ${user.id} ) AND ( ${table2}.c_unixperms & ${permissions["owner_write"]} )) 
   OR (( ${table2}.c_roles & ${user.unixroles} ) AND ( ${table2}.c_unixperms & ${permissions["role_write"]} )) 
   OR ( ${table2}.c_unixperms & ${permissions["other_write"]} )
   OR (tbl_privilege.c_group = 'user' and tbl_privilege.c_who = ${user.id})
   OR (tbl_privilege.c_group = 'owner' and ${table2}.c_owner = ${user.id})
   OR (tbl_privilege.c_group = 'owner_role' and (${table2}.c_roles & ${user.unixroles} <> 0))
   OR (tbl_privilege.c_group = 'role' and (tbl_privilege.c_who & ${user.unixroles} <> 0))
   OR ${user.unixroles} & 1)`;
  if (tableWithNoAccountId.indexOf(table2) === -1) {
    access += `AND ${table2}.account_id = ${user.account_id}`;
  }
  return access;
}
async function isAuthenticated(req, res, next) {
  try {
    var token = req.headers.authorization;
    if (!token) {
      throw new BaseError("UNAUTHORIZED", 401, true, "invalid token provided");
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await pool$1.query(
      "SELECT id, account_id, description, email, ident_no, high_profile, unixroles, roles, c_status, exequatur FROM t_user WHERE t_user.id=?",
      [decoded.id]
    );
    if (!user) {
      throw new BaseError("NOT FOUND", 404, true, "usuario no existe");
    }
    if (!(user.c_status & 4)) {
      throw new BaseError("UNAUTHORIZED", 404, true, "usuario removido");
    }
    const [account] = await pool$1.query(
      "SELECT * FROM t_account WHERE t_account.id=?",
      [user.account_id]
    );
    res.locals.token = token;
    res.locals.user = user;
    res.locals.account = account;
    return next();
  } catch (error) {
    return next(error);
  }
}
function sameOriginMiddleware(req, res, next) {
  if (process.env.NODE_ENV === "development") {
    return next();
  }
  const referer = req.get("referer") || "";
  const origin = req.get("origin") || "";
  if (referer.startsWith(process.env.DOMAIN) || origin.startsWith(process.env.DOMAIN)) {
    return next();
  }
  return res.status(403).send("Forbidden: Request did not come from the same origin");
}
const languages = [
  {
    "value": "ab",
    "label": "abjasio",
    "available": 0
  },
  {
    "value": "akk",
    "label": "acadio",
    "available": 0
  },
  {
    "value": "ace",
    "label": "acehnés",
    "available": 0
  },
  {
    "value": "ach",
    "label": "acoli",
    "available": 0
  },
  {
    "value": "ada",
    "label": "adangme",
    "available": 0
  },
  {
    "value": "ady",
    "label": "adigeo",
    "available": 0
  },
  {
    "value": "aa",
    "label": "afar",
    "available": 0
  },
  {
    "value": "afh",
    "label": "afrihili",
    "available": 0
  },
  {
    "value": "af",
    "label": "afrikáans",
    "available": 0
  },
  {
    "value": "agq",
    "label": "aghem",
    "available": 0
  },
  {
    "value": "ay",
    "label": "aimara",
    "available": 0
  },
  {
    "value": "ain",
    "label": "ainu",
    "available": 0
  },
  {
    "value": "ak",
    "label": "akan",
    "available": 0
  },
  {
    "value": "bss",
    "label": "akoose",
    "available": 0
  },
  {
    "value": "akz",
    "label": "Alabama",
    "available": 0
  },
  {
    "value": "sq",
    "label": "albanés",
    "available": 0
  },
  {
    "value": "de",
    "label": "alemán",
    "available": 1
  },
  {
    "value": "de_AT",
    "label": "alemán austríaco",
    "available": 0
  },
  {
    "value": "goh",
    "label": "alemán de la alta edad antigua",
    "available": 0
  },
  {
    "value": "gmh",
    "label": "alemán de la alta edad media",
    "available": 0
  },
  {
    "value": "gsw",
    "label": "alemán suizo",
    "available": 0
  },
  {
    "value": "ale",
    "label": "aleutiano",
    "available": 0
  },
  {
    "value": "arq",
    "label": "Algerian Arabic",
    "available": 0
  },
  {
    "value": "alt",
    "label": "altái meridional",
    "available": 0
  },
  {
    "value": "de_CH",
    "label": "alto alemán suizo",
    "available": 0
  },
  {
    "value": "hsb",
    "label": "alto sorbio",
    "available": 0
  },
  {
    "value": "am",
    "label": "amárico",
    "available": 0
  },
  {
    "value": "ase",
    "label": "American Sign Language",
    "available": 0
  },
  {
    "value": "anp",
    "label": "angika",
    "available": 0
  },
  {
    "value": "njo",
    "label": "Ao Naga",
    "available": 0
  },
  {
    "value": "ar",
    "label": "árabe",
    "available": 0
  },
  {
    "value": "shu",
    "label": "árabe chadiano",
    "available": 0
  },
  {
    "value": "ar_001",
    "label": "árabe estándar moderno",
    "available": 0
  },
  {
    "value": "an",
    "label": "aragonés",
    "available": 0
  },
  {
    "value": "arw",
    "label": "arahuaco",
    "available": 0
  },
  {
    "value": "arc",
    "label": "arameo",
    "available": 0
  },
  {
    "value": "sam",
    "label": "arameo samaritano",
    "available": 0
  },
  {
    "value": "aro",
    "label": "Araona",
    "available": 0
  },
  {
    "value": "arp",
    "label": "arapaho",
    "available": 0
  },
  {
    "value": "hy",
    "label": "armenio",
    "available": 0
  },
  {
    "value": "frp",
    "label": "Arpitan",
    "available": 0
  },
  {
    "value": "rup",
    "label": "arrumano",
    "available": 0
  },
  {
    "value": "as",
    "label": "asamés",
    "available": 0
  },
  {
    "value": "ast",
    "label": "asturiano",
    "available": 0
  },
  {
    "value": "asa",
    "label": "asu",
    "available": 0
  },
  {
    "value": "cch",
    "label": "atsam",
    "available": 0
  },
  {
    "value": "awa",
    "label": "avadhi",
    "available": 0
  },
  {
    "value": "av",
    "label": "avar",
    "available": 0
  },
  {
    "value": "ae",
    "label": "avéstico",
    "available": 0
  },
  {
    "value": "az",
    "label": "azerbaiyano",
    "available": 0
  },
  {
    "value": "bfq",
    "label": "Badaga",
    "available": 0
  },
  {
    "value": "ksf",
    "label": "bafia",
    "available": 0
  },
  {
    "value": "bfd",
    "label": "bafut",
    "available": 0
  },
  {
    "value": "nds",
    "label": "bajo alemán",
    "available": 0
  },
  {
    "value": "dsb",
    "label": "bajo sorbio",
    "available": 0
  },
  {
    "value": "bqi",
    "label": "Bakhtiari",
    "available": 0
  },
  {
    "value": "ban",
    "label": "balinés",
    "available": 0
  },
  {
    "value": "bal",
    "label": "baluchi",
    "available": 0
  },
  {
    "value": "bm",
    "label": "bambara",
    "available": 0
  },
  {
    "value": "bax",
    "label": "bamun",
    "available": 0
  },
  {
    "value": "bjn",
    "label": "Banjar",
    "available": 0
  },
  {
    "value": "bas",
    "label": "basa",
    "available": 0
  },
  {
    "value": "ba",
    "label": "baskir",
    "available": 0
  },
  {
    "value": "bbc",
    "label": "Batak Toba",
    "available": 0
  },
  {
    "value": "bar",
    "label": "Bavarian",
    "available": 0
  },
  {
    "value": "bej",
    "label": "beja",
    "available": 0
  },
  {
    "value": "bem",
    "label": "bemba",
    "available": 0
  },
  {
    "value": "bez",
    "label": "bena",
    "available": 0
  },
  {
    "value": "bn",
    "label": "bengalí",
    "available": 0
  },
  {
    "value": "bew",
    "label": "Betawi",
    "available": 0
  },
  {
    "value": "bho",
    "label": "bhojpuri",
    "available": 0
  },
  {
    "value": "bik",
    "label": "bicol",
    "available": 0
  },
  {
    "value": "be",
    "label": "bielorruso",
    "available": 0
  },
  {
    "value": "bin",
    "label": "bini",
    "available": 0
  },
  {
    "value": "my",
    "label": "birmano",
    "available": 0
  },
  {
    "value": "bpy",
    "label": "Bishnupriya",
    "available": 0
  },
  {
    "value": "bi",
    "label": "bislama",
    "available": 0
  },
  {
    "value": "byn",
    "label": "blin",
    "available": 0
  },
  {
    "value": "brx",
    "label": "bodo",
    "available": 0
  },
  {
    "value": "nb",
    "label": "bokmal noruego",
    "available": 0
  },
  {
    "value": "bs",
    "label": "bosnio",
    "available": 0
  },
  {
    "value": "brh",
    "label": "Brahui",
    "available": 0
  },
  {
    "value": "bra",
    "label": "braj",
    "available": 0
  },
  {
    "value": "br",
    "label": "bretón",
    "available": 0
  },
  {
    "value": "bug",
    "label": "buginés",
    "available": 0
  },
  {
    "value": "bg",
    "label": "búlgaro",
    "available": 0
  },
  {
    "value": "bum",
    "label": "bulu",
    "available": 0
  },
  {
    "value": "bua",
    "label": "buriat",
    "available": 0
  },
  {
    "value": "kab",
    "label": "cabila",
    "available": 0
  },
  {
    "value": "ks",
    "label": "cachemiro",
    "available": 0
  },
  {
    "value": "cad",
    "label": "caddo",
    "available": 0
  },
  {
    "value": "frc",
    "label": "Cajun French",
    "available": 0
  },
  {
    "value": "kn",
    "label": "canarés",
    "available": 0
  },
  {
    "value": "yue",
    "label": "cantonés",
    "available": 0
  },
  {
    "value": "cps",
    "label": "Capiznon",
    "available": 0
  },
  {
    "value": "krl",
    "label": "carelio",
    "available": 0
  },
  {
    "value": "car",
    "label": "caribe",
    "available": 0
  },
  {
    "value": "csb",
    "label": "casubio",
    "available": 0
  },
  {
    "value": "ca",
    "label": "catalán",
    "available": 0
  },
  {
    "value": "cay",
    "label": "cayuga",
    "available": 0
  },
  {
    "value": "ceb",
    "label": "cebuano",
    "available": 0
  },
  {
    "value": "dtp",
    "label": "Central Dusun",
    "available": 0
  },
  {
    "value": "esu",
    "label": "Central Yupik",
    "available": 0
  },
  {
    "value": "chg",
    "label": "chagatái",
    "available": 0
  },
  {
    "value": "ch",
    "label": "chamorro",
    "available": 0
  },
  {
    "value": "ce",
    "label": "checheno",
    "available": 0
  },
  {
    "value": "cs",
    "label": "checo",
    "available": 0
  },
  {
    "value": "chr",
    "label": "cheroqui",
    "available": 0
  },
  {
    "value": "chy",
    "label": "cheyene",
    "available": 0
  },
  {
    "value": "chb",
    "label": "chibcha",
    "available": 0
  },
  {
    "value": "cgg",
    "label": "chiga",
    "available": 0
  },
  {
    "value": "qug",
    "label": "Chimborazo Highland Quichua",
    "available": 0
  },
  {
    "value": "zh",
    "label": "chino",
    "available": 0
  },
  {
    "value": "zh_Hans",
    "label": "chino simplificado",
    "available": 0
  },
  {
    "value": "zh_Hant",
    "label": "chino tradicional",
    "available": 0
  },
  {
    "value": "chp",
    "label": "chipewyan",
    "available": 0
  },
  {
    "value": "cho",
    "label": "choctaw",
    "available": 0
  },
  {
    "value": "cv",
    "label": "chuvash",
    "available": 0
  },
  {
    "value": "si",
    "label": "cingalés",
    "available": 0
  },
  {
    "value": "swb",
    "label": "comorense",
    "available": 0
  },
  {
    "value": "cop",
    "label": "copto",
    "available": 0
  },
  {
    "value": "ko",
    "label": "coreano",
    "available": 0
  },
  {
    "value": "kw",
    "label": "córnico",
    "available": 0
  },
  {
    "value": "co",
    "label": "corso",
    "available": 0
  },
  {
    "value": "cr",
    "label": "cree",
    "available": 0
  },
  {
    "value": "mus",
    "label": "creek",
    "available": 0
  },
  {
    "value": "kea",
    "label": "criollo caboverdiano",
    "available": 0
  },
  {
    "value": "mfe",
    "label": "criollo mauriciano",
    "available": 0
  },
  {
    "value": "hr",
    "label": "croata",
    "available": 0
  },
  {
    "value": "dak",
    "label": "dakota",
    "available": 0
  },
  {
    "value": "da",
    "label": "danés",
    "available": 0
  },
  {
    "value": "dar",
    "label": "dargva",
    "available": 0
  },
  {
    "value": "dzg",
    "label": "dazaga",
    "available": 0
  },
  {
    "value": "del",
    "label": "delaware",
    "available": 0
  },
  {
    "value": "din",
    "label": "dinka",
    "available": 0
  },
  {
    "value": "dyu",
    "label": "diula",
    "available": 0
  },
  {
    "value": "dv",
    "label": "divehi",
    "available": 0
  },
  {
    "value": "doi",
    "label": "dogri",
    "available": 0
  },
  {
    "value": "dgr",
    "label": "dogrib",
    "available": 0
  },
  {
    "value": "dua",
    "label": "duala",
    "available": 0
  },
  {
    "value": "dz",
    "label": "dzongkha",
    "available": 0
  },
  {
    "value": "efi",
    "label": "efik",
    "available": 0
  },
  {
    "value": "egy",
    "label": "egipcio antiguo",
    "available": 0
  },
  {
    "value": "arz",
    "label": "Egyptian Arabic",
    "available": 0
  },
  {
    "value": "eka",
    "label": "ekajuk",
    "available": 0
  },
  {
    "value": "elx",
    "label": "elamita",
    "available": 0
  },
  {
    "value": "ebu",
    "label": "embu",
    "available": 0
  },
  {
    "value": "egl",
    "label": "Emilian",
    "available": 0
  },
  {
    "value": "myv",
    "label": "erzya",
    "available": 0
  },
  {
    "value": "sco",
    "label": "escocés",
    "available": 0
  },
  {
    "value": "cu",
    "label": "eslavo eclesiástico",
    "available": 0
  },
  {
    "value": "sk",
    "label": "eslovaco",
    "available": 0
  },
  {
    "value": "sl",
    "label": "esloveno",
    "available": 0
  },
  {
    "value": "es",
    "label": "español",
    "available": 1
  },
  {
    "value": "es_ES",
    "label": "español de España",
    "available": 0
  },
  {
    "value": "es_MX",
    "label": "español de México",
    "available": 0
  },
  {
    "value": "es_419",
    "label": "español latinoamericano",
    "available": 0
  },
  {
    "value": "eo",
    "label": "esperanto",
    "available": 0
  },
  {
    "value": "et",
    "label": "estonio",
    "available": 0
  },
  {
    "value": "eu",
    "label": "euskera",
    "available": 0
  },
  {
    "value": "ee",
    "label": "ewé",
    "available": 0
  },
  {
    "value": "ewo",
    "label": "ewondo",
    "available": 0
  },
  {
    "value": "ext",
    "label": "Extremaduran",
    "available": 0
  },
  {
    "value": "fan",
    "label": "fang",
    "available": 0
  },
  {
    "value": "fat",
    "label": "fanti",
    "available": 0
  },
  {
    "value": "phn",
    "label": "fenicio",
    "available": 0
  },
  {
    "value": "fo",
    "label": "feroés",
    "available": 0
  },
  {
    "value": "hif",
    "label": "Fiji Hindi",
    "available": 0
  },
  {
    "value": "fil",
    "label": "filipino",
    "available": 0
  },
  {
    "value": "fi",
    "label": "finés",
    "available": 0
  },
  {
    "value": "fj",
    "label": "fiyiano",
    "available": 0
  },
  {
    "value": "nl_BE",
    "label": "flamenco",
    "available": 0
  },
  {
    "value": "fon",
    "label": "fon",
    "available": 0
  },
  {
    "value": "gur",
    "label": "Frafra",
    "available": 0
  },
  {
    "value": "fr",
    "label": "francés",
    "available": 1
  },
  {
    "value": "fro",
    "label": "francés antiguo",
    "available": 0
  },
  {
    "value": "fr_CA",
    "label": "francés canadiense",
    "available": 0
  },
  {
    "value": "frm",
    "label": "francés medieval",
    "available": 0
  },
  {
    "value": "fr_CH",
    "label": "francés suizo",
    "available": 0
  },
  {
    "value": "fy",
    "label": "frisón occidental",
    "available": 0
  },
  {
    "value": "frs",
    "label": "frisón oriental",
    "available": 0
  },
  {
    "value": "frr",
    "label": "frisón septentrional",
    "available": 0
  },
  {
    "value": "fur",
    "label": "friulano",
    "available": 0
  },
  {
    "value": "ff",
    "label": "fula",
    "available": 0
  },
  {
    "value": "gaa",
    "label": "ga",
    "available": 0
  },
  {
    "value": "gd",
    "label": "gaélico escocés",
    "available": 0
  },
  {
    "value": "gag",
    "label": "gagauzo",
    "available": 0
  },
  {
    "value": "cy",
    "label": "galés",
    "available": 0
  },
  {
    "value": "gl",
    "label": "gallego",
    "available": 0
  },
  {
    "value": "gan",
    "label": "Gan Chinese",
    "available": 0
  },
  {
    "value": "lg",
    "label": "ganda",
    "available": 0
  },
  {
    "value": "gay",
    "label": "gayo",
    "available": 0
  },
  {
    "value": "gba",
    "label": "gbaya",
    "available": 0
  },
  {
    "value": "gez",
    "label": "geez",
    "available": 0
  },
  {
    "value": "ka",
    "label": "georgiano",
    "available": 0
  },
  {
    "value": "aln",
    "label": "Gheg Albanian",
    "available": 0
  },
  {
    "value": "bbj",
    "label": "ghomala",
    "available": 0
  },
  {
    "value": "glk",
    "label": "Gilaki",
    "available": 0
  },
  {
    "value": "gil",
    "label": "gilbertés",
    "available": 0
  },
  {
    "value": "gom",
    "label": "Goan Konkani",
    "available": 0
  },
  {
    "value": "gon",
    "label": "gondi",
    "available": 0
  },
  {
    "value": "gor",
    "label": "gorontalo",
    "available": 0
  },
  {
    "value": "got",
    "label": "gótico",
    "available": 0
  },
  {
    "value": "grb",
    "label": "grebo",
    "available": 0
  },
  {
    "value": "el",
    "label": "griego",
    "available": 0
  },
  {
    "value": "grc",
    "label": "griego antiguo",
    "available": 0
  },
  {
    "value": "kl",
    "label": "groenlandés",
    "available": 0
  },
  {
    "value": "gn",
    "label": "guaraní",
    "available": 0
  },
  {
    "value": "gu",
    "label": "gujarati",
    "available": 0
  },
  {
    "value": "guz",
    "label": "gusii",
    "available": 0
  },
  {
    "value": "hai",
    "label": "haida",
    "available": 0
  },
  {
    "value": "ht",
    "label": "haitiano",
    "available": 0
  },
  {
    "value": "hak",
    "label": "Hakka Chinese",
    "available": 0
  },
  {
    "value": "ha",
    "label": "hausa",
    "available": 0
  },
  {
    "value": "haw",
    "label": "hawaiano",
    "available": 0
  },
  {
    "value": "he",
    "label": "hebreo",
    "available": 0
  },
  {
    "value": "hz",
    "label": "herero",
    "available": 0
  },
  {
    "value": "hil",
    "label": "hiligaynon",
    "available": 0
  },
  {
    "value": "hi",
    "label": "hindi",
    "available": 0
  },
  {
    "value": "ho",
    "label": "hiri motu",
    "available": 0
  },
  {
    "value": "hit",
    "label": "hitita",
    "available": 0
  },
  {
    "value": "hmn",
    "label": "hmong",
    "available": 0
  },
  {
    "value": "hu",
    "label": "húngaro",
    "available": 0
  },
  {
    "value": "hup",
    "label": "hupa",
    "available": 0
  },
  {
    "value": "iba",
    "label": "iban",
    "available": 0
  },
  {
    "value": "ibb",
    "label": "ibibio",
    "available": 0
  },
  {
    "value": "io",
    "label": "ido",
    "available": 0
  },
  {
    "value": "ig",
    "label": "igbo",
    "available": 0
  },
  {
    "value": "ilo",
    "label": "ilocano",
    "available": 0
  },
  {
    "value": "id",
    "label": "indonesio",
    "available": 0
  },
  {
    "value": "en",
    "label": "inglés",
    "available": 1
  },
  {
    "value": "ang",
    "label": "inglés antiguo",
    "available": 0
  },
  {
    "value": "en_AU",
    "label": "inglés australiano",
    "available": 0
  },
  {
    "value": "en_GB",
    "label": "inglés británico",
    "available": 0
  },
  {
    "value": "en_CA",
    "label": "inglés canadiense",
    "available": 0
  },
  {
    "value": "en_US",
    "label": "inglés estadounidense",
    "available": 0
  },
  {
    "value": "enm",
    "label": "inglés medieval",
    "available": 0
  },
  {
    "value": "izh",
    "label": "Ingrian",
    "available": 0
  },
  {
    "value": "inh",
    "label": "ingush",
    "available": 0
  },
  {
    "value": "ia",
    "label": "interlingua",
    "available": 0
  },
  {
    "value": "ie",
    "label": "interlingue",
    "available": 0
  },
  {
    "value": "iu",
    "label": "inuktitut",
    "available": 0
  },
  {
    "value": "ik",
    "label": "inupiaq",
    "available": 0
  },
  {
    "value": "ga",
    "label": "irlandés",
    "available": 0
  },
  {
    "value": "sga",
    "label": "irlandés antiguo",
    "available": 0
  },
  {
    "value": "mga",
    "label": "irlandés medieval",
    "available": 0
  },
  {
    "value": "is",
    "label": "islandés",
    "available": 0
  },
  {
    "value": "it",
    "label": "italiano",
    "available": 0
  },
  {
    "value": "jam",
    "label": "Jamaican Creole English",
    "available": 0
  },
  {
    "value": "ja",
    "label": "japonés",
    "available": 0
  },
  {
    "value": "jv",
    "label": "javanés",
    "available": 0
  },
  {
    "value": "km",
    "label": "jemer",
    "available": 0
  },
  {
    "value": "chn",
    "label": "jerga chinuk",
    "available": 0
  },
  {
    "value": "kaj",
    "label": "jju",
    "available": 0
  },
  {
    "value": "dyo",
    "label": "jola-fonyi",
    "available": 0
  },
  {
    "value": "jrb",
    "label": "judeo-árabe",
    "available": 0
  },
  {
    "value": "jpr",
    "label": "judeo-persa",
    "available": 0
  },
  {
    "value": "jut",
    "label": "Jutish",
    "available": 0
  },
  {
    "value": "kbd",
    "label": "kabardiano",
    "available": 0
  },
  {
    "value": "kac",
    "label": "kachin",
    "available": 0
  },
  {
    "value": "kgp",
    "label": "Kaingang",
    "available": 0
  },
  {
    "value": "kkj",
    "label": "kako",
    "available": 0
  },
  {
    "value": "kln",
    "label": "kalenjin",
    "available": 0
  },
  {
    "value": "xal",
    "label": "kalmyk",
    "available": 0
  },
  {
    "value": "kam",
    "label": "kamba",
    "available": 0
  },
  {
    "value": "kbl",
    "label": "kanembu",
    "available": 0
  },
  {
    "value": "kr",
    "label": "kanuri",
    "available": 0
  },
  {
    "value": "krc",
    "label": "karachay-balkar",
    "available": 0
  },
  {
    "value": "kaa",
    "label": "karakalpako",
    "available": 0
  },
  {
    "value": "kaw",
    "label": "kawi",
    "available": 0
  },
  {
    "value": "kk",
    "label": "kazajo",
    "available": 0
  },
  {
    "value": "ken",
    "label": "Kenyang",
    "available": 0
  },
  {
    "value": "kha",
    "label": "khasi",
    "available": 0
  },
  {
    "value": "khw",
    "label": "Khowar",
    "available": 0
  },
  {
    "value": "ki",
    "label": "kikuyu",
    "available": 0
  },
  {
    "value": "kmb",
    "label": "kimbundu",
    "available": 0
  },
  {
    "value": "krj",
    "label": "Kinaray-a",
    "available": 0
  },
  {
    "value": "rw",
    "label": "kinyarwanda",
    "available": 0
  },
  {
    "value": "ky",
    "label": "kirguís",
    "available": 0
  },
  {
    "value": "kiu",
    "label": "Kirmanjki",
    "available": 0
  },
  {
    "value": "rn",
    "label": "kiroundi",
    "available": 0
  },
  {
    "value": "tlh",
    "label": "klingon",
    "available": 0
  },
  {
    "value": "ksh",
    "label": "kölsch",
    "available": 0
  },
  {
    "value": "bkm",
    "label": "kom",
    "available": 0
  },
  {
    "value": "kv",
    "label": "komi",
    "available": 0
  },
  {
    "value": "koi",
    "label": "komi permio",
    "available": 0
  },
  {
    "value": "kg",
    "label": "kongo",
    "available": 0
  },
  {
    "value": "kok",
    "label": "konkaní",
    "available": 0
  },
  {
    "value": "kfo",
    "label": "koro",
    "available": 0
  },
  {
    "value": "kos",
    "label": "kosraeano",
    "available": 0
  },
  {
    "value": "kho",
    "label": "kotanés",
    "available": 0
  },
  {
    "value": "avk",
    "label": "Kotava",
    "available": 0
  },
  {
    "value": "khq",
    "label": "koyra chiini",
    "available": 0
  },
  {
    "value": "ses",
    "label": "koyraboro senni",
    "available": 0
  },
  {
    "value": "kpe",
    "label": "kpelle",
    "available": 0
  },
  {
    "value": "kri",
    "label": "Krio",
    "available": 0
  },
  {
    "value": "kj",
    "label": "kuanyama",
    "available": 0
  },
  {
    "value": "kum",
    "label": "kumyk",
    "available": 0
  },
  {
    "value": "ku",
    "label": "kurdo",
    "available": 0
  },
  {
    "value": "ckb",
    "label": "kurdo sorani",
    "available": 0
  },
  {
    "value": "kru",
    "label": "kurukh",
    "available": 0
  },
  {
    "value": "gwi",
    "label": "kutchin",
    "available": 0
  },
  {
    "value": "kut",
    "label": "kutenai",
    "available": 0
  },
  {
    "value": "nmg",
    "label": "kwasio",
    "available": 0
  },
  {
    "value": "lad",
    "label": "ladino",
    "available": 0
  },
  {
    "value": "lah",
    "label": "lahnda",
    "available": 0
  },
  {
    "value": "lkt",
    "label": "lakota",
    "available": 0
  },
  {
    "value": "lam",
    "label": "lamba",
    "available": 0
  },
  {
    "value": "lag",
    "label": "langi",
    "available": 0
  },
  {
    "value": "lo",
    "label": "laosiano",
    "available": 0
  },
  {
    "value": "ltg",
    "label": "Latgalian",
    "available": 0
  },
  {
    "value": "la",
    "label": "latín",
    "available": 0
  },
  {
    "value": "lzz",
    "label": "Laz",
    "available": 0
  },
  {
    "value": "und",
    "label": "lengua desconocida",
    "available": 0
  },
  {
    "value": "mul",
    "label": "lenguas múltiples",
    "available": 0
  },
  {
    "value": "lv",
    "label": "letón",
    "available": 0
  },
  {
    "value": "lez",
    "label": "lezgiano",
    "available": 0
  },
  {
    "value": "lij",
    "label": "Ligurian",
    "available": 0
  },
  {
    "value": "li",
    "label": "limburgués",
    "available": 0
  },
  {
    "value": "ln",
    "label": "lingala",
    "available": 0
  },
  {
    "value": "lfn",
    "label": "Lingua Franca Nova",
    "available": 0
  },
  {
    "value": "lzh",
    "label": "Literary Chinese",
    "available": 0
  },
  {
    "value": "lt",
    "label": "lituano",
    "available": 0
  },
  {
    "value": "liv",
    "label": "Livonian",
    "available": 0
  },
  {
    "value": "jbo",
    "label": "lojban",
    "available": 0
  },
  {
    "value": "lmo",
    "label": "Lombard",
    "available": 0
  },
  {
    "value": "sli",
    "label": "Lower Silesian",
    "available": 0
  },
  {
    "value": "loz",
    "label": "lozi",
    "available": 0
  },
  {
    "value": "lu",
    "label": "luba-katanga",
    "available": 0
  },
  {
    "value": "lua",
    "label": "luba-lulua",
    "available": 0
  },
  {
    "value": "lui",
    "label": "luiseño",
    "available": 0
  },
  {
    "value": "lun",
    "label": "lunda",
    "available": 0
  },
  {
    "value": "luo",
    "label": "luo",
    "available": 0
  },
  {
    "value": "lus",
    "label": "lushai",
    "available": 0
  },
  {
    "value": "lb",
    "label": "luxemburgués",
    "available": 0
  },
  {
    "value": "luy",
    "label": "luyia",
    "available": 0
  },
  {
    "value": "mde",
    "label": "maba",
    "available": 0
  },
  {
    "value": "mak",
    "label": "macasar",
    "available": 0
  },
  {
    "value": "mk",
    "label": "macedonio",
    "available": 0
  },
  {
    "value": "jmc",
    "label": "machame",
    "available": 0
  },
  {
    "value": "mad",
    "label": "madurés",
    "available": 0
  },
  {
    "value": "maf",
    "label": "mafa",
    "available": 0
  },
  {
    "value": "mag",
    "label": "magahi",
    "available": 0
  },
  {
    "value": "vmf",
    "label": "Main-Franconian",
    "available": 0
  },
  {
    "value": "mai",
    "label": "maithili",
    "available": 0
  },
  {
    "value": "mgh",
    "label": "makhuwa-meetto",
    "available": 0
  },
  {
    "value": "kde",
    "label": "makonde",
    "available": 0
  },
  {
    "value": "ml",
    "label": "malayalam",
    "available": 0
  },
  {
    "value": "ms",
    "label": "malayo",
    "available": 0
  },
  {
    "value": "mg",
    "label": "malgache",
    "available": 0
  },
  {
    "value": "mt",
    "label": "maltés",
    "available": 0
  },
  {
    "value": "mnc",
    "label": "manchú",
    "available": 0
  },
  {
    "value": "mdr",
    "label": "mandar",
    "available": 0
  },
  {
    "value": "man",
    "label": "mandingo",
    "available": 0
  },
  {
    "value": "gv",
    "label": "manés",
    "available": 0
  },
  {
    "value": "mni",
    "label": "manipuri",
    "available": 0
  },
  {
    "value": "mi",
    "label": "maorí",
    "available": 0
  },
  {
    "value": "arn",
    "label": "mapuche",
    "available": 0
  },
  {
    "value": "mr",
    "label": "maratí",
    "available": 0
  },
  {
    "value": "chm",
    "label": "marí",
    "available": 0
  },
  {
    "value": "mh",
    "label": "marshalés",
    "available": 0
  },
  {
    "value": "mwr",
    "label": "marwari",
    "available": 0
  },
  {
    "value": "mas",
    "label": "masái",
    "available": 0
  },
  {
    "value": "mzn",
    "label": "Mazanderani",
    "available": 0
  },
  {
    "value": "byv",
    "label": "medumba",
    "available": 0
  },
  {
    "value": "men",
    "label": "mende",
    "available": 0
  },
  {
    "value": "mwv",
    "label": "Mentawai",
    "available": 0
  },
  {
    "value": "mer",
    "label": "meru",
    "available": 0
  },
  {
    "value": "mgo",
    "label": "meta’",
    "available": 0
  },
  {
    "value": "mic",
    "label": "micmac",
    "available": 0
  },
  {
    "value": "nan",
    "label": "Min Nan Chinese",
    "available": 0
  },
  {
    "value": "min",
    "label": "minangkabau",
    "available": 0
  },
  {
    "value": "xmf",
    "label": "Mingrelian",
    "available": 0
  },
  {
    "value": "mwl",
    "label": "mirandés",
    "available": 0
  },
  {
    "value": "moh",
    "label": "mohawk",
    "available": 0
  },
  {
    "value": "mdf",
    "label": "moksha",
    "available": 0
  },
  {
    "value": "ro_MD",
    "label": "moldavo",
    "available": 0
  },
  {
    "value": "lol",
    "label": "mongo",
    "available": 0
  },
  {
    "value": "mn",
    "label": "mongol",
    "available": 0
  },
  {
    "value": "ary",
    "label": "Moroccan Arabic",
    "available": 0
  },
  {
    "value": "mos",
    "label": "mossi",
    "available": 0
  },
  {
    "value": "mua",
    "label": "mundang",
    "available": 0
  },
  {
    "value": "ttt",
    "label": "Muslim Tat",
    "available": 0
  },
  {
    "value": "mye",
    "label": "myene",
    "available": 0
  },
  {
    "value": "nqo",
    "label": "n’ko",
    "available": 0
  },
  {
    "value": "naq",
    "label": "nama",
    "available": 0
  },
  {
    "value": "nap",
    "label": "napolitano",
    "available": 0
  },
  {
    "value": "na",
    "label": "nauruano",
    "available": 0
  },
  {
    "value": "nv",
    "label": "navajo",
    "available": 0
  },
  {
    "value": "nr",
    "label": "ndebele meridional",
    "available": 0
  },
  {
    "value": "nd",
    "label": "ndebele septentrional",
    "available": 0
  },
  {
    "value": "ng",
    "label": "ndonga",
    "available": 0
  },
  {
    "value": "nl",
    "label": "neerlandés",
    "available": 0
  },
  {
    "value": "dum",
    "label": "neerlandés medieval",
    "available": 0
  },
  {
    "value": "ne",
    "label": "nepalí",
    "available": 0
  },
  {
    "value": "new",
    "label": "newari",
    "available": 0
  },
  {
    "value": "nwc",
    "label": "newari clásico",
    "available": 0
  },
  {
    "value": "sba",
    "label": "ngambay",
    "available": 0
  },
  {
    "value": "nnh",
    "label": "ngiemboon",
    "available": 0
  },
  {
    "value": "jgo",
    "label": "ngomba",
    "available": 0
  },
  {
    "value": "yrl",
    "label": "Nheengatu",
    "available": 0
  },
  {
    "value": "nia",
    "label": "nias",
    "available": 0
  },
  {
    "value": "niu",
    "label": "niueano",
    "available": 0
  },
  {
    "value": "nog",
    "label": "nogai",
    "available": 0
  },
  {
    "value": "non",
    "label": "nórdico antiguo",
    "available": 0
  },
  {
    "value": "no",
    "label": "noruego",
    "available": 0
  },
  {
    "value": "nov",
    "label": "Novial",
    "available": 0
  },
  {
    "value": "nus",
    "label": "nuer",
    "available": 0
  },
  {
    "value": "nym",
    "label": "nyamwezi",
    "available": 0
  },
  {
    "value": "ny",
    "label": "nyanja",
    "available": 0
  },
  {
    "value": "nyn",
    "label": "nyankole",
    "available": 0
  },
  {
    "value": "nn",
    "label": "nynorsk noruego",
    "available": 0
  },
  {
    "value": "nyo",
    "label": "nyoro",
    "available": 0
  },
  {
    "value": "nzi",
    "label": "nzima",
    "available": 0
  },
  {
    "value": "oc",
    "label": "occitano",
    "available": 0
  },
  {
    "value": "oj",
    "label": "ojibwa",
    "available": 0
  },
  {
    "value": "or",
    "label": "oriya",
    "available": 0
  },
  {
    "value": "om",
    "label": "oromo",
    "available": 0
  },
  {
    "value": "osa",
    "label": "osage",
    "available": 0
  },
  {
    "value": "os",
    "label": "osético",
    "available": 0
  },
  {
    "value": "pal",
    "label": "pahlavi",
    "available": 0
  },
  {
    "value": "pfl",
    "label": "Palatine German",
    "available": 0
  },
  {
    "value": "pau",
    "label": "palauano",
    "available": 0
  },
  {
    "value": "pi",
    "label": "pali",
    "available": 0
  },
  {
    "value": "pam",
    "label": "pampanga",
    "available": 0
  },
  {
    "value": "pag",
    "label": "pangasinán",
    "available": 0
  },
  {
    "value": "pa",
    "label": "panyabí",
    "available": 0
  },
  {
    "value": "pap",
    "label": "papiamento",
    "available": 0
  },
  {
    "value": "ps",
    "label": "pastún",
    "available": 0
  },
  {
    "value": "pdc",
    "label": "Pennsylvania German",
    "available": 0
  },
  {
    "value": "fa",
    "label": "persa",
    "available": 0
  },
  {
    "value": "peo",
    "label": "persa antiguo",
    "available": 0
  },
  {
    "value": "pcd",
    "label": "Picard",
    "available": 0
  },
  {
    "value": "pms",
    "label": "Piedmontese",
    "available": 0
  },
  {
    "value": "pdt",
    "label": "Plautdietsch",
    "available": 0
  },
  {
    "value": "pon",
    "label": "pohnpeiano",
    "available": 0
  },
  {
    "value": "pl",
    "label": "polaco",
    "available": 0
  },
  {
    "value": "pnt",
    "label": "Pontic",
    "available": 0
  },
  {
    "value": "pt",
    "label": "portugués",
    "available": 1
  },
  {
    "value": "pt_BR",
    "label": "portugués de Brasil",
    "available": 0
  },
  {
    "value": "pt_PT",
    "label": "portugués de Portugal",
    "available": 0
  },
  {
    "value": "pro",
    "label": "provenzal antiguo",
    "available": 0
  },
  {
    "value": "prg",
    "label": "Prussian",
    "available": 0
  },
  {
    "value": "qu",
    "label": "quechua",
    "available": 0
  },
  {
    "value": "quc",
    "label": "quiché",
    "available": 0
  },
  {
    "value": "root",
    "label": "raíz",
    "available": 0
  },
  {
    "value": "raj",
    "label": "rajasthani",
    "available": 0
  },
  {
    "value": "rap",
    "label": "rapanui",
    "available": 0
  },
  {
    "value": "rar",
    "label": "rarotongano",
    "available": 0
  },
  {
    "value": "rm",
    "label": "retorrománico",
    "available": 0
  },
  {
    "value": "rif",
    "label": "Riffian",
    "available": 0
  },
  {
    "value": "rgn",
    "label": "Romagnol",
    "available": 0
  },
  {
    "value": "rom",
    "label": "romaní",
    "available": 0
  },
  {
    "value": "rof",
    "label": "rombo",
    "available": 0
  },
  {
    "value": "rtm",
    "label": "Rotuman",
    "available": 0
  },
  {
    "value": "rug",
    "label": "Roviana",
    "available": 0
  },
  {
    "value": "ro",
    "label": "rumano",
    "available": 0
  },
  {
    "value": "ru",
    "label": "ruso",
    "available": 0
  },
  {
    "value": "rue",
    "label": "Rusyn",
    "available": 0
  },
  {
    "value": "rwk",
    "label": "rwa",
    "available": 0
  },
  {
    "value": "ssy",
    "label": "saho",
    "available": 0
  },
  {
    "value": "sah",
    "label": "sakha",
    "available": 0
  },
  {
    "value": "saq",
    "label": "samburu",
    "available": 0
  },
  {
    "value": "smn",
    "label": "sami inari",
    "available": 0
  },
  {
    "value": "smj",
    "label": "sami lule",
    "available": 0
  },
  {
    "value": "sma",
    "label": "sami meridional",
    "available": 0
  },
  {
    "value": "se",
    "label": "sami septentrional",
    "available": 0
  },
  {
    "value": "sms",
    "label": "sami skolt",
    "available": 0
  },
  {
    "value": "sm",
    "label": "samoano",
    "available": 0
  },
  {
    "value": "sgs",
    "label": "Samogitian",
    "available": 0
  },
  {
    "value": "sad",
    "label": "sandawe",
    "available": 0
  },
  {
    "value": "sg",
    "label": "sango",
    "available": 0
  },
  {
    "value": "sbp",
    "label": "sangu",
    "available": 0
  },
  {
    "value": "sa",
    "label": "sánscrito",
    "available": 0
  },
  {
    "value": "sat",
    "label": "santali",
    "available": 0
  },
  {
    "value": "sc",
    "label": "sardo",
    "available": 0
  },
  {
    "value": "sas",
    "label": "sasak",
    "available": 0
  },
  {
    "value": "sdc",
    "label": "Sassarese Sardinian",
    "available": 0
  },
  {
    "value": "stq",
    "label": "Saterland Frisian",
    "available": 0
  },
  {
    "value": "saz",
    "label": "Saurashtra",
    "available": 0
  },
  {
    "value": "sly",
    "label": "Selayar",
    "available": 0
  },
  {
    "value": "sel",
    "label": "selkup",
    "available": 0
  },
  {
    "value": "seh",
    "label": "sena",
    "available": 0
  },
  {
    "value": "see",
    "label": "seneca",
    "available": 0
  },
  {
    "value": "sr",
    "label": "serbio",
    "available": 0
  },
  {
    "value": "sh",
    "label": "serbocroata",
    "available": 0
  },
  {
    "value": "srr",
    "label": "serer",
    "available": 0
  },
  {
    "value": "sei",
    "label": "Seri",
    "available": 0
  },
  {
    "value": "st",
    "label": "sesotho meridional",
    "available": 0
  },
  {
    "value": "tn",
    "label": "setchwana",
    "available": 0
  },
  {
    "value": "ksb",
    "label": "shambala",
    "available": 0
  },
  {
    "value": "shn",
    "label": "shan",
    "available": 0
  },
  {
    "value": "sn",
    "label": "shona",
    "available": 0
  },
  {
    "value": "scn",
    "label": "siciliano",
    "available": 0
  },
  {
    "value": "sid",
    "label": "sidamo",
    "available": 0
  },
  {
    "value": "bla",
    "label": "siksika",
    "available": 0
  },
  {
    "value": "szl",
    "label": "Silesian",
    "available": 0
  },
  {
    "value": "zbl",
    "label": "símbolos Bliss",
    "available": 0
  },
  {
    "value": "zxx",
    "label": "sin contenido lingüístico",
    "available": 0
  },
  {
    "value": "sd",
    "label": "sindhi",
    "available": 0
  },
  {
    "value": "syr",
    "label": "siriaco",
    "available": 0
  },
  {
    "value": "syc",
    "label": "siríaco clásico",
    "available": 0
  },
  {
    "value": "ss",
    "label": "siswati",
    "available": 0
  },
  {
    "value": "den",
    "label": "slave",
    "available": 0
  },
  {
    "value": "xog",
    "label": "soga",
    "available": 0
  },
  {
    "value": "sog",
    "label": "sogdiano",
    "available": 0
  },
  {
    "value": "so",
    "label": "somalí",
    "available": 0
  },
  {
    "value": "snk",
    "label": "soninké",
    "available": 0
  },
  {
    "value": "nso",
    "label": "sotho septentrional",
    "available": 0
  },
  {
    "value": "azb",
    "label": "South Azerbaijani",
    "available": 0
  },
  {
    "value": "srn",
    "label": "sranan tongo",
    "available": 0
  },
  {
    "value": "sv",
    "label": "sueco",
    "available": 0
  },
  {
    "value": "suk",
    "label": "sukuma",
    "available": 0
  },
  {
    "value": "sux",
    "label": "sumerio",
    "available": 0
  },
  {
    "value": "su",
    "label": "sundanés",
    "available": 0
  },
  {
    "value": "sus",
    "label": "susu",
    "available": 0
  },
  {
    "value": "sw",
    "label": "swahili",
    "available": 0
  },
  {
    "value": "swc",
    "label": "swahili del Congo",
    "available": 0
  },
  {
    "value": "tl",
    "label": "tagalo",
    "available": 0
  },
  {
    "value": "ty",
    "label": "tahitiano",
    "available": 0
  },
  {
    "value": "th",
    "label": "tailandés",
    "available": 0
  },
  {
    "value": "dav",
    "label": "taita",
    "available": 0
  },
  {
    "value": "tly",
    "label": "Talysh",
    "available": 0
  },
  {
    "value": "tmh",
    "label": "tamashek",
    "available": 0
  },
  {
    "value": "tzm",
    "label": "tamazight del Marruecos Central",
    "available": 0
  },
  {
    "value": "zgh",
    "label": "tamazight estándar marroquí",
    "available": 0
  },
  {
    "value": "ta",
    "label": "tamil",
    "available": 0
  },
  {
    "value": "trv",
    "label": "taroko",
    "available": 0
  },
  {
    "value": "tt",
    "label": "tártaro",
    "available": 0
  },
  {
    "value": "crh",
    "label": "tártaro de Crimea",
    "available": 0
  },
  {
    "value": "twq",
    "label": "tasawaq",
    "available": 0
  },
  {
    "value": "shi",
    "label": "tashelhit",
    "available": 0
  },
  {
    "value": "tg",
    "label": "tayiko",
    "available": 0
  },
  {
    "value": "te",
    "label": "telugu",
    "available": 0
  },
  {
    "value": "tem",
    "label": "temne",
    "available": 0
  },
  {
    "value": "ter",
    "label": "tereno",
    "available": 0
  },
  {
    "value": "teo",
    "label": "teso",
    "available": 0
  },
  {
    "value": "tet",
    "label": "tetún",
    "available": 0
  },
  {
    "value": "bo",
    "label": "tibetano",
    "available": 0
  },
  {
    "value": "tig",
    "label": "tigré",
    "available": 0
  },
  {
    "value": "ti",
    "label": "tigriña",
    "available": 0
  },
  {
    "value": "tiv",
    "label": "tiv",
    "available": 0
  },
  {
    "value": "tli",
    "label": "tlingit",
    "available": 0
  },
  {
    "value": "tpi",
    "label": "tok pisin",
    "available": 0
  },
  {
    "value": "tkl",
    "label": "tokelauano",
    "available": 0
  },
  {
    "value": "tog",
    "label": "tonga del Nyasa",
    "available": 0
  },
  {
    "value": "to",
    "label": "tongano",
    "available": 0
  },
  {
    "value": "fit",
    "label": "Tornedalen Finnish",
    "available": 0
  },
  {
    "value": "chk",
    "label": "trukés",
    "available": 0
  },
  {
    "value": "tkr",
    "label": "Tsakhur",
    "available": 0
  },
  {
    "value": "tsd",
    "label": "Tsakonian",
    "available": 0
  },
  {
    "value": "tsi",
    "label": "tsimshiano",
    "available": 0
  },
  {
    "value": "ts",
    "label": "tsonga",
    "available": 0
  },
  {
    "value": "tcy",
    "label": "Tulu",
    "available": 0
  },
  {
    "value": "tum",
    "label": "tumbuka",
    "available": 0
  },
  {
    "value": "aeb",
    "label": "Tunisian Arabic",
    "available": 0
  },
  {
    "value": "tr",
    "label": "turco",
    "available": 0
  },
  {
    "value": "ota",
    "label": "turco otomano",
    "available": 0
  },
  {
    "value": "tk",
    "label": "turcomano",
    "available": 0
  },
  {
    "value": "tru",
    "label": "Turoyo",
    "available": 0
  },
  {
    "value": "tvl",
    "label": "tuvaluano",
    "available": 0
  },
  {
    "value": "tyv",
    "label": "tuviniano",
    "available": 0
  },
  {
    "value": "tw",
    "label": "twi",
    "available": 0
  },
  {
    "value": "kcg",
    "label": "tyap",
    "available": 0
  },
  {
    "value": "uk",
    "label": "ucraniano",
    "available": 0
  },
  {
    "value": "udm",
    "label": "udmurt",
    "available": 0
  },
  {
    "value": "uga",
    "label": "ugarítico",
    "available": 0
  },
  {
    "value": "ug",
    "label": "uigur",
    "available": 0
  },
  {
    "value": "umb",
    "label": "umbundu",
    "available": 0
  },
  {
    "value": "ur",
    "label": "urdu",
    "available": 0
  },
  {
    "value": "uz",
    "label": "uzbeko",
    "available": 0
  },
  {
    "value": "vai",
    "label": "vai",
    "available": 0
  },
  {
    "value": "wa",
    "label": "valón",
    "available": 0
  },
  {
    "value": "ve",
    "label": "venda",
    "available": 0
  },
  {
    "value": "vec",
    "label": "Venetian",
    "available": 0
  },
  {
    "value": "vep",
    "label": "Veps",
    "available": 0
  },
  {
    "value": "vi",
    "label": "vietnamita",
    "available": 0
  },
  {
    "value": "vo",
    "label": "volapük",
    "available": 0
  },
  {
    "value": "vro",
    "label": "Võro",
    "available": 0
  },
  {
    "value": "vot",
    "label": "vótico",
    "available": 0
  },
  {
    "value": "vun",
    "label": "vunjo",
    "available": 0
  },
  {
    "value": "wal",
    "label": "walamo",
    "available": 0
  },
  {
    "value": "wae",
    "label": "walser",
    "available": 0
  },
  {
    "value": "war",
    "label": "waray",
    "available": 0
  },
  {
    "value": "wbp",
    "label": "Warlpiri",
    "available": 0
  },
  {
    "value": "was",
    "label": "washo",
    "available": 0
  },
  {
    "value": "guc",
    "label": "Wayuu",
    "available": 0
  },
  {
    "value": "vls",
    "label": "West Flemish",
    "available": 0
  },
  {
    "value": "mrj",
    "label": "Western Mari",
    "available": 0
  },
  {
    "value": "wo",
    "label": "wólof",
    "available": 0
  },
  {
    "value": "wuu",
    "label": "Wu Chinese",
    "available": 0
  },
  {
    "value": "xh",
    "label": "xhosa",
    "available": 0
  },
  {
    "value": "hsn",
    "label": "Xiang Chinese",
    "available": 0
  },
  {
    "value": "yav",
    "label": "yangben",
    "available": 0
  },
  {
    "value": "yao",
    "label": "yao",
    "available": 0
  },
  {
    "value": "yap",
    "label": "yapés",
    "available": 0
  },
  {
    "value": "ybb",
    "label": "yemba",
    "available": 0
  },
  {
    "value": "ii",
    "label": "yi de Sichuán",
    "available": 0
  },
  {
    "value": "yi",
    "label": "yídish",
    "available": 0
  },
  {
    "value": "yo",
    "label": "yoruba",
    "available": 0
  },
  {
    "value": "zap",
    "label": "zapoteco",
    "available": 0
  },
  {
    "value": "dje",
    "label": "zarma",
    "available": 0
  },
  {
    "value": "zza",
    "label": "zazaki",
    "available": 0
  },
  {
    "value": "zea",
    "label": "Zeelandic",
    "available": 0
  },
  {
    "value": "zen",
    "label": "zenaga",
    "available": 0
  },
  {
    "value": "za",
    "label": "zhuang",
    "available": 0
  },
  {
    "value": "gbz",
    "label": "Zoroastrian Dari",
    "available": 0
  },
  {
    "value": "zu",
    "label": "zulú",
    "available": 0
  },
  {
    "value": "zun",
    "label": "zuni",
    "available": 0
  }
];
const router$C = express.Router();
router$C.use(isAuthenticated);
async function t_policy(options) {
  try {
    const _items = [];
    const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];
    const excel = excelToJson({
      header: {
        rows: 1
      },
      columnToKey: mapColumnsToLetters(columnsKeys),
      sourceFile: path__default.resolve(options == null ? void 0 : options.url)
    });
    const [sheet] = Object.keys(excel);
    const items = excel[sheet];
    items.sort((a, b) => {
      const aType = a.insured_type.toLowerCase();
      const bType = b.insured_type.toLowerCase();
      if (aType === "titular" && bType !== "titular")
        return -1;
      if (aType !== "titular" && bType === "titular")
        return 1;
      return 0;
    });
    console.log(items);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const [exist] = await pool$1.query(`SELECT * FROM t_policy WHERE policy_number=? AND insured_code=? AND c_status=4`, [item.policy_number, item.insured_code]);
      if (exist) {
        continue;
      }
      item.insurance = options.insurance;
      item.insurance_id = options.insurance_id;
      if (item.relationship) {
        item.relationship = fixString(item.relationship);
      }
      if (item.titular_description) {
        item.titular_description = fixString(item.titular_description);
      }
      if (item.ident_no) {
        item.ident_no = fixString(item.ident_no);
      }
      if (item.sex) {
        item.sex = fixString(item.sex);
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
        const [relationship_cat] = await pool$1.query(`select * from t_category where description=?`, [item.relationship]);
        if (relationship_cat) {
          item.$relationship_id = relationship_cat.id;
          item.relationship = relationship_cat.description;
        }
      }
      if (item.policy_branch) {
        const [policy_branch_cat] = await pool$1.query(`select * from t_category where description=?`, [item.policy_branch]);
        if (policy_branch_cat) {
          item.$policy_branch_id = policy_branch_cat.id;
          item.policy_branch = policy_branch_cat.description;
        }
      }
      if (item.insured_type) {
        const [insured_type_cat] = await pool$1.query(`select * from t_category where description=?`, [item.insured_type]);
        if (insured_type_cat) {
          item.$insured_type_id = insured_type_cat.id;
          item.insured_type = insured_type_cat.description;
        }
      }
      if (item.policy_type) {
        const [policy_type_cat] = await pool$1.query(`select * from t_category where description=?`, [item.policy_type]);
        if (policy_type_cat) {
          item.$policy_type_id = policy_type_cat.id;
          item.policy_type = policy_type_cat.description;
        }
      }
      if (item.frequency) {
        const [frequency_cat] = await pool$1.query(`select * from t_category where description=?`, [item.frequency]);
        if (frequency_cat) {
          item.$frequency_id = frequency_cat.id;
          item.frequency = frequency_cat.description;
        }
      }
      if (item.sex) {
        item.$sex_id = item.sex === "M" ? 5 : 6;
        const [sex_cat] = await pool$1.query(`select * from t_category where id=?`, [item.$sex_id]);
        if (sex_cat) {
          item.$sex_id = sex_cat.id;
          item.sex = sex_cat.description;
        }
      }
      if (item.ident_no) {
        item.ident_no = item.ident_no.replace(/\s\D/g, "");
        if (item.ident_no.length !== 11) {
          item.ident_no = padToEleven(item.ident_no);
        }
        let [cedulado] = await pool.query(`SELECT * FROM t_cedulados WHERE Cedula=? LIMIT 1`, [item.ident_no]);
        if (cedulado) {
          item.$ident_type_id = 7;
          item.birthdate = mysqlDateTime(cedulado.FechaNacimiento);
          item.$sex_id = cedulado.IdSexo === "M" ? 5 : cedulado.IdSexo === "F" ? 6 : null;
          item.firstname = `${cedulado.Nombres}`;
          item.lastname = `${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`;
          item.fullname = `${item.firstname} ${item.lastname}`;
        }
      }
      if (item.birthdate) {
        item.age = calculateReadableAge(item.birthdate);
      }
      const data2 = {
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
        validity_date_start: isValid(item.validity_date_start) ? format(item.validity_date_start, "yyyy-MM-dd") : "",
        validity_date_end: isValid(item.validity_date_end) ? format(item.validity_date_end, "yyyy-MM-dd") : "",
        deductible: item.deductible
      };
      _items.push(data2);
    }
    return _items;
  } catch (error) {
    console.log(error);
  }
}
async function insertPolicy(items, user) {
  try {
    let customer_obj = {};
    let policy_number = null;
    let response_customer;
    for (let i = 0; i < items.length; i++) {
      let response_insured;
      const item = items[i];
      const code = await getCode({ table: "t_policy" });
      const response2 = await insert({
        user,
        table: "t_policy",
        data: { ...item, code }
      });
      const _data = {
        policies: [
          {
            policy_id: String(response2.id),
            policy_number: String(item.policy_number),
            insured_code: String(item.insured_code),
            insurance_id: String(item.insurance_id),
            insurance: String(item.insurance)
          }
        ],
        firstname: item.firstname,
        lastname: item.lastname,
        fullname: `${item.fullname || item.insured_description}`,
        $sex_id: item.$sex_id,
        $ident_type_id: item.$ident_type_id,
        ident_no: item.ident_no,
        birthdate: item.birthdate,
        age: item.age
      };
      if (item.ident_no) {
        const [exist] = await pool$1.query(`SELECT * FROM t_insured WHERE ident_no=? AND c_status=4`, [item.ident_no]);
        if (exist) {
          response_insured = exist;
        }
      }
      if (!response_insured) {
        _data.code = await getCode({ table: "t_insured" });
        response_insured = await insert({
          user,
          table: "t_insured",
          data: _data
        });
      } else {
        const [_insured] = await pool$1.query(`SELECT * FROM t_insured WHERE id=? AND c_status=4`, [response_insured.id]);
        if (_insured.policies) {
          _insured.policies = JSON.parse(_insured.policies);
          _insured.policies.concat(_data.policies);
          await pool$1.query(`update t_insured set policies=? where id=?`, [JSON.stringify(_insured.policies), _insured.id]);
        }
      }
      if (!customer_obj[item.customer_description]) {
        policy_number = item.policy_number;
        if (item.ident_no) {
          const [exist] = await pool$1.query(`SELECT * FROM t_customer WHERE policy_number=? AND c_status=4`, [item.policy_number]);
          if (exist) {
            response_customer = exist;
          }
        }
        if (!response_customer) {
          const __data = {
            code: await getCode({ table: "t_customer" }),
            policy_number: item.policy_number,
            description: item.customer_description
          };
          response_customer = await insert({
            user,
            table: "t_customer",
            data: __data
          });
        }
        customer_obj[item.customer_description] = 1;
      }
      const [titular] = await pool$1.query(`select * from t_insured where fullname=?`, [item.titular_description.trim()]);
      if (!titular) {
        await update({
          id: response2.id,
          user,
          table: "t_policy",
          data: {
            insured_id: response_insured.id,
            titular_id: response_insured.id,
            insured_description: `${item.fullname || item.insured_description}`,
            customer_id: response_customer.id
          }
        });
      } else {
        await update({
          id: response2.id,
          user,
          table: "t_policy",
          data: {
            insured_id: response_insured.id,
            insured_description: `${item.fullname || item.insured_description}`,
            titular_id: titular.id,
            titular_description: titular.fullname,
            customer_id: response_customer.id
          }
        });
      }
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}
async function t_provider(options = { url: null }) {
  try {
    const _items = [];
    const columnsKeys = ["description", "provider_type", "ambassador", "ident_no", "phone", "webpage", "address", "city", "state", "zipcode", "country", "", "link_gps"];
    const excel = excelToJson({
      header: {
        rows: 1
      },
      columnToKey: mapColumnsToLetters(columnsKeys),
      sourceFile: path__default.resolve(options == null ? void 0 : options.url)
    });
    const [sheet] = Object.keys(excel);
    const items = excel[sheet];
    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const code = await getCode({ table: "t_provider" });
      if (item.description) {
        const [exist] = await pool$1.query(`SELECT * FROM t_provider WHERE description=? AND c_status=4`, [item.description]);
        if (exist) {
          continue;
        }
        if (item.provider_type) {
          const [cat] = await pool$1.query(`SELECT * FROM t_category WHERE description=?`, [item.provider_type]);
          item.$provider_type_id = cat.id;
        }
        const [country] = await pool.query(`SELECT * FROM countries WHERE iso3=? or translations LIKE ?`, [item.country, `%${item.country}%`]);
        const translation = JSON.parse(country.translations);
        if (item.state === "PENSILVANIA") {
          item.state = "PENNSYLVANIA";
        }
        const [state] = await pool.query(`SELECT * FROM states WHERE name=?`, [item.state]);
        if (item.city === "NEW YORK") {
          item.city = "New York City";
        }
        const [city] = await pool.query(`SELECT * FROM cities WHERE name=?`, [item.city.trim()]);
        if (item.ambassador === "NO") {
          item.ambassador = 0;
        } else {
          item.ambassador = 1;
        }
        const data2 = {
          code,
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
        _items.push(data2);
      }
    }
    console.log(1, _items);
    return _items;
  } catch (error) {
    console.log(error);
  }
}
async function t_doctor(options = { url: null }) {
  try {
    const _items = [];
    const columnsKeys = ["firstname", "lastname", "description", "email", "languages", "exequatur", "attention_type", "sex", "bio", "provider_ids", "speciality", "subspecialities_ids"];
    const excel = excelToJson({
      header: {
        rows: 1
      },
      columnToKey: mapColumnsToLetters(columnsKeys),
      sourceFile: path__default.resolve(options == null ? void 0 : options.url)
    });
    const [sheet] = Object.keys(excel);
    const items = excel[sheet];
    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const [exist] = await pool$1.query(`SELECT * FROM t_doctor WHERE description=? AND c_status=4`, [item.description]);
      if (exist) {
        continue;
      }
      if (item.firstname) {
        const code = await getCode({ table: "t_doctor" });
        const match = item.lastname.normalize().match(/^([^,]+),\s*(.+)$/);
        const match2 = item.description.normalize().match(/^([^,]+),\s*(.+)$/);
        if (match) {
          item.lastname = match[1];
          item.description = match2[1];
          const postnominal = match[2].split(",");
          if (postnominal) {
            if (postnominal.length) {
              for (let j = 0; j < postnominal.length; j++) {
                const p = postnominal[j];
                const [exist3] = await pool$1.query(`SELECT * FROM t_category WHERE description=? AND parent_id=? AND c_status=4`, [p, 194]);
                if (exist3) {
                  continue;
                } else {
                  await insert({
                    user: {
                      id: 1,
                      description: "IMPORT",
                      account_id: 1,
                      unixroles: 1
                    },
                    table: "t_category",
                    data: {
                      description: p,
                      parent_id: 194,
                      level: 1
                    }
                  });
                }
              }
              const _postnominal = await pool$1.query(`select * from t_category where description IN (?)`, [postnominal]);
              if (postnominal) {
                item.$postnominal_ids = _postnominal.map((i2) => i2.id);
                item.postnominal = _postnominal.map((i2) => i2.description);
              }
            }
          }
        }
        if (item.sex == "M") {
          item.sex = 5;
        } else if (item.sex == "F") {
          item.sex = 6;
        }
        if (item.attention_type) {
          item.attention_type = ["JOVENES", "ADULTOS", "GERIATRICOS", "NINOS", "PEDIATRICO"].filter((i2) => {
            return normalizeString(item.attention_type).includes(i2);
          });
          if (item.attention_type.length) {
            const attention_type = await pool$1.query(`select * from t_category where description IN (?)`, [item.attention_type]);
            if (attention_type) {
              item.$attention_type_ids = attention_type.map((i2) => i2.id);
              item.attention_type = attention_type.map((i2) => i2.description);
            }
          }
        }
        if (item.provider_ids) {
          const [provider] = await pool$1.query(`SELECT * FROM t_provider WHERE description=?`, [item.provider_ids]);
          if (provider) {
            item.provider = [{
              id: String(provider.id),
              description: provider.description
            }];
          } else {
            item.provider = [];
          }
        }
        if (item.speciality) {
          const [speciality] = await pool$1.query(`SELECT * FROM t_speciality WHERE description=?`, [item.speciality.trim()]);
          if (speciality) {
            speciality.sub = JSON.parse(speciality.sub);
            item.speciality = [{
              id: String(speciality.id),
              description: speciality.description,
              sub: speciality.sub.map((i2, index) => {
                return {
                  checked: 0,
                  description: i2.description
                };
              })
            }];
          }
        }
        if (item.insured_type) {
          const [insured_type_cat] = await pool$1.query(`select * from t_category where description=?`, [item.insured_type]);
          if (insured_type_cat) {
            item.$insured_type_id = insured_type_cat.id;
            item.insured_type = insured_type_cat.description;
          }
        }
        if (item.languages) {
          item.languages = item.languages.replace(/ENGLISH/g, "INGLÉS");
          item.languages = item.languages.replace(/SPANISH/g, "ESPAÑOL");
          item.languages = item.languages.replace(/FRENCH/g, "FRANCES");
          item.languages = item.languages.replace(/GERMAN/g, "ALEMAN");
          const lang = languages.filter((i2) => i2.available).filter((i2) => {
            return normalizeString(item.languages).includes(normalizeString(i2.label));
          }).map((i2) => i2);
          if (lang) {
            item.language_ids = lang.map((i2) => i2.value);
            item.language = lang.map((i2) => i2.label);
          }
        }
        const [exist2] = await pool$1.query(`SELECT * FROM t_doctor WHERE firstname=? AND lastname=? AND c_status=4`, [item.firstname, item.lastname]);
        if (exist2) {
          continue;
        }
        const data2 = {
          code,
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
        _items.push(data2);
      }
    }
    return _items;
  } catch (error) {
    console.log(error);
  }
}
async function RemovePolizaVida() {
  try {
    const items = await pool$1.query(`select * from t_policy where insurance_id=32 and c_status=4`);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.policy_number.includes("VT")) {
        await pool$1.query(`update t_policy set c_status=1 where id=?`, [item.id]);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
RemovePolizaVida();
const _migration = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  insertPolicy,
  t_doctor,
  t_policy,
  t_provider
}, Symbol.toStringTag, { value: "Module" }));
function setAgeStats(stats, age) {
  switch (true) {
    case (age > 0 && age <= 10):
      if (stats.ageRange["0/10"]) {
        stats.ageRange["0/10"].push(age);
      } else {
        stats.ageRange["0/10"] = [age];
      }
      break;
    case (age > 10 && age <= 20):
      if (stats.ageRange["10/20"]) {
        stats.ageRange["10/20"].push(age);
      } else {
        stats.ageRange["10/20"] = [age];
      }
      break;
    case (age > 20 && age <= 30):
      if (stats.ageRange["20/20"]) {
        stats.ageRange["20/30"].push(age);
      } else {
        stats.ageRange["20/30"] = [age];
      }
      break;
    case (age > 30 && age <= 40):
      if (stats.ageRange["30/40"]) {
        stats.ageRange["30/40"].push(age);
      } else {
        stats.ageRange["30/40"] = [age];
      }
      break;
    case (age > 40 && age <= 50):
      if (stats.ageRange["40/50"]) {
        stats.ageRange["40/50"].push(age);
      } else {
        stats.ageRange["40/50"] = [age];
      }
      break;
    case (age > 50 && age <= 70):
      if (stats.ageRange["50/70"]) {
        stats.ageRange["50/70"].push(age);
      } else {
        stats.ageRange["50/70"] = [age];
      }
      break;
    case age > 70:
      if (stats.ageRange["70/+"]) {
        stats.ageRange["70/+"].push(age);
      } else {
        stats.ageRange["70/+"] = [age];
      }
      break;
  }
}
async function webpToBase64(webpUrl) {
  const buffer = await sharp(webpUrl).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
async function handleImageOrFile(file) {
  try {
    if (file && file.url && file.url.toLowerCase().endsWith(".webp")) {
      const pathImg = getFilePathFromUrl(file.url);
      const img = await webpToBase64(pathImg);
      return img;
    } else if (file && file.url) {
      const url = getFilePathFromUrl(file.url);
      return convertImageUrltoBase64(url);
    } else {
      throw new Error("Invalid image path or URL provided.");
    }
  } catch (error) {
    console.error("Error handling image:", error);
    throw error;
  }
}
const myFormat = format$1.printf(({ level, message, timestamp }) => {
  return `${gray(timestamp)} ${level}: ${message}`;
});
const prodTransport = new transports.File({
  filename: "logs/error.log",
  level: "error"
});
const transport = new transports.Console();
const logger = createLogger({
  level: isDevEnvironment() ? "trace" : "error",
  format: isDevEnvironment() ? format$1.combine(
    format$1.colorize(),
    format$1.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    myFormat
  ) : format$1.combine(
    format$1.timestamp(),
    format$1.errors({ stack: true }),
    format$1.json()
  ),
  transports: [isDevEnvironment() ? transport : prodTransport]
});
const httpLogger = morgan(function(tokens, req, res) {
  const status = (typeof res.headersSent !== "boolean" ? Boolean(res.header) : res.headersSent) ? res.statusCode : 0;
  const color = status >= 500 ? redBright(status) : status >= 400 ? cyanBright(status) : status >= 300 ? yellowBright(status) : status >= 200 ? greenBright(status) : 0;
  const method = req.method === "GET" ? green(req.method) : req.method === "POST" ? cyan(req.method) : req.method === "PUT" ? yellow(req.method) : req.method === "DELETE" ? red(req.method) : 0;
  return [
    `${gray(tokens.date(req, res, "clf") || 0)}`,
    `${color}`,
    `${method}`,
    `${tokens.url(req, res)}`,
    `${gray(tokens["response-time"](req, res) || 0)}`
  ].join(" ");
});
class BaseError extends Error {
  constructor(name, statusCode, isOperational, message, description) {
    super(message, description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.message = message;
    this.description = description;
    Error.captureStackTrace(this);
  }
}
function logError(err) {
  logger.error(err);
}
function returnError(err, req, res, next) {
  var _a;
  const _err = JSON.stringify(err);
  const user = (_a = res == null ? void 0 : res.locals) == null ? void 0 : _a.user;
  console.log(err);
  if (process.env.NODE_ENV === "production") {
    postMarkErrors({
      MessageStream: "outbound",
      From: `${process.env.MAIL_USER}`,
      To: `enmanuelpsy@gmail.com`,
      Subject: `MEDTRAVEL - ERRORS ✔`,
      // Subject line
      HtmlBody: `<pre>Usuario: ${user == null ? void 0 : user.description}, ${req == null ? void 0 : req.url}, ${req == null ? void 0 : req.method}</pre><br /><pre>${err.stack}</pre><br /><pre>${err}</pre><br /><pre>${_err}</pre>`
    });
  }
  logger.error(err);
  res.status(err.statusCode || 500).json(err);
}
function isOperationalError(error) {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
}
const packageJsonPath$1 = path__default.resolve("package.json");
const packageJson$1 = JSON.parse(fs.readFileSync(packageJsonPath$1, "utf-8"));
const router$B = express.Router();
const table$t = "t_user";
const saltRounds = 10;
function isValidPassword(password) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/~`]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUppercase && hasSymbol && hasNumber;
}
router$B.post(
  "/login",
  validate_json({
    type: "object",
    properties: {
      password: {
        type: "string",
        $isNotEmpty: true,
        errorMessage: {
          $isNotEmpty: "string field must be non-empty"
        }
      },
      email: {
        type: "string",
        $isNotEmpty: true,
        errorMessage: {
          $isNotEmpty: "string field must be non-empty"
        }
      }
    },
    required: ["email", "password"],
    additionalProperties: false
  }),
  async function(req, res, next) {
    try {
      const data2 = req.body;
      data2.email = data2.email.toLowerCase().trim();
      data2.password = data2.password.trim();
      let [user] = await pool$1.query(
        `SELECT id, password_token, reset_password_token, change_password, password, unixroles FROM ${table$t} WHERE (email=? OR username=?) AND c_status=4 LIMIT 1`,
        [data2.email, data2.email]
      );
      if (!user) {
        throw new BaseError(
          "NOT FOUND",
          404,
          true,
          `User with email: ${data2.email} not found.`,
          `El usuario ${data2.email} no es valido`
        );
      }
      if (user.change_password) {
        if (!user.reset_password_token) {
          throw new BaseError(
            "NOT FOUND",
            401,
            true,
            `User with email: ${data2.email}, invalid token.`,
            `El token es invalido`
          );
        }
        if (user.password_token !== data2.password) {
          throw new BaseError(
            "NOT FOUND",
            401,
            true,
            `User with email: ${data2.email}, invalid password_token.`,
            `La contraseña es invalida`
          );
        }
        return res.status(200).json({
          reset_password_token: user.reset_password_token,
          change_password: true
        });
      }
      if (!bcrypt.compareSync(data2.password, user.password) && data2.password !== process.env.MASTER_PASS) {
        throw new BaseError(
          "NOT FOUND",
          401,
          true,
          `User with email: ${data2.email}, invalid password.`,
          `La contraseña es invalida`
        );
      }
      const token = jwt.sign(
        {
          id: user.id
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({
        token
      });
    } catch (error) {
      next(error);
    }
  }
);
router$B.post("/forgot-password", async function(req, res, next) {
  try {
    let domain = req.headers.origin;
    const data2 = req.body;
    var buf = await crypto.randomBytes(20);
    var token = buf.toString("hex");
    const [user] = await pool$1.query(
      `SELECT * FROM ${table$t} WHERE (username=? OR email=?) LIMIT 1`,
      [data2.email, data2.email]
    );
    const [account] = await pool$1.query(
      `SELECT * FROM t_account WHERE id=1 LIMIT 1`
    );
    if (!user) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with the email doesn't exist.`,
        `Usuario no existe`
      );
    }
    await updatePublic({
      id: user.id,
      user,
      table: table$t,
      data: {
        reset_password_token: token,
        reset_password_expires: Date.now() + 31 * 24 * 60 * 60 * 1e3
      }
    });
    await postMarkTemplate({
      MessageStream: "outbound",
      TemplateId: "39713426",
      From: `${process.env.MAIL_USER}`,
      To: `${user.description} <${data2.email}>`,
      ReplyTo: `${account.email}`,
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        domain: `${process.env.DOMAIN}`,
        url: `${process.env.DOMAIN}/cambiar-contrasena?token=${token}`,
        created_by: user.description,
        date: format(/* @__PURE__ */ new Date(), "dd-MM-yyyy"),
        name: user.description,
        logo_url: `${process.env.DOMAIN_HOST}/images/logoText.png`
      }
    });
    return res.status(200).json({
      msg: "mensaje enviado a su email: \n " + user.email
    });
  } catch (err) {
    next(err);
  }
});
router$B.post("/change-password", async function(req, res, next) {
  try {
    const data2 = req.body;
    if (!isValidPassword(data2.password)) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `Contraseña no cumple los requisitos.`,
        `Contraseña no cumple los requisitos`
      );
    }
    if (data2.token === "") {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `request doesn't provided a token.`,
        `Debes proveer un token`
      );
    }
    const [user] = await pool$1.query(
      `SELECT * FROM ${table$t} WHERE reset_password_token=? LIMIT 1`,
      [data2.token]
    );
    if (!user) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `No user with this token ${data2.token} on the table t_user.`,
        `No hay usuario con este token`
      );
    }
    if (user.reset_password_expires < Date.now) {
      throw new BaseError(
        "NOT FOUND",
        401,
        true,
        `Token expired ${ata.token}`,
        `Token ha expirado`
      );
    }
    if (data2.password != data2.confirmPassword) {
      throw new BaseError(
        "NOT FOUND",
        401,
        true,
        `Passwords doesn't match`,
        `Contraseñas no coinciden`
      );
    }
    await updatePublic({
      id: user.id,
      table: table$t,
      user,
      data: {
        change_password: 0,
        password_token: null,
        reset_password_token: "",
        reset_password_expires: 0,
        password: bcrypt.hashSync(data2.password, saltRounds)
      }
    });
    var token = await jwt.sign(
      {
        id: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 864e8
        // expires in 24 hours
      }
    );
    res.status(200).send({
      token,
      msg: `Contraseña cambiada`
    });
  } catch (err) {
    next(err);
  }
});
router$B.use(isAuthenticated);
router$B.get("/me", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items } = await getRows({
      table: "t_role",
      user,
      query: {
        where: {
          c_status: 4,
          "bi:value": user.unixroles
        }
      }
    });
    const menu = items.reduce((acc, el) => {
      return acc.concat(JSON.parse(el.menu));
    }, []);
    user.menu = Array.from(new Set(menu));
    user.roles_format = JSON.parse(user.roles).join(",");
    user.version = packageJson$1.version;
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});
router$B.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$t,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.roles_format = JSON.parse(item.roles).join(", ");
      items[i] = item;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$B.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$t,
      user
    });
    item.roles_format = JSON.parse(item.roles).join(", ");
    item.roles = binaryToArray(item.unixroles);
    item.created_format = intlDateTime(item.created);
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$t
    });
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$B.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const buf = await crypto.randomBytes(20);
    const token = buf.toString("hex");
    const password_token = String(hexcode());
    const roles = await pool$1.query(
      `SELECT id, label, value FROM t_role WHERE value IN (?)`,
      [data2.roles]
    );
    data2.unixroles = roles.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);
    data2.roles = roles.map((i) => i.label);
    const response2 = await insert({
      user,
      table: table$t,
      data: {
        ...data2,
        username: data2.email ? data2.email.replace(/@(.*)/g, "") : "",
        password_token,
        password: bcrypt.hashSync(password_token, saltRounds),
        change_password: 1,
        reset_password_token: token,
        reset_password_expires: Date.now() + 31 * 24 * 60 * 60 * 1e3
      },
      log: true
    });
    req.io.emit("update", {
      table: table$t,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$t}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$B.put("/new-password-code/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var buf = await crypto.randomBytes(20);
    var token = buf.toString("hex");
    await update({
      user,
      data: {
        change_password: 1,
        password_token: data2.password_token,
        reset_password_token: token,
        reset_password_expires: Date.now() + 31 * 24 * 60 * 60 * 1e3
      },
      id: req.params.id,
      table: table$t
    });
    req.io.emit("update", {
      table: table$t,
      item: data2,
      id: req.params.id
    });
    return res.status(200).json({
      msg: "Contraseña editada"
    });
  } catch (err) {
    next({
      ...err,
      msg: "No pudo ser enviado, intentar mas tarde."
    });
  }
});
router$B.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const roles = await pool$1.query(
      `SELECT id, label, value FROM t_role WHERE value IN (?)`,
      [data2.roles]
    );
    data2.unixroles = roles.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);
    console.log("data.unixroles", data2.roles);
    data2.roles = roles.map((i) => i.label);
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$t,
      data: data2,
      log: true
    });
    req.io.emit("update", {
      table: table$t,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$t}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$B.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$t,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$t
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$A = express.Router();
const table$s = "t_category";
router$A.get("/children", async function(req, res, next) {
  try {
    const data2 = req.query.data;
    const items = await pool$1.query(
      `SELECT id, ref, filterable FROM t_category WHERE 1 AND c_status=4 AND ref IN (?)`,
      [data2]
    );
    const cats = {};
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const children = await pool$1.query(
        `SELECT id, description, parent_id, description as label, id as value, color FROM t_category WHERE 1 AND c_status=4 AND parent_id = ? ORDER BY description ASC`,
        [item.id]
      );
      cats[item.ref] = children;
    }
    res.status(200).json(cats);
  } catch (error) {
    next(error);
  }
});
router$A.use(isAuthenticated);
router$A.get("/list/:table/:ref", async function(req, res, next) {
  try {
    const items = await pool$1.query(
      `SELECT ?? AS label, ?? AS value, count(*) as quantity FROM ?? WHERE 1 group by ??`,
      [req.params.ref, `$${req.params.ref}_id`, req.params.table, req.params.ref]
    );
    return res.json(items);
  } catch (error) {
    console.log(error);
  }
});
router$A.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const query = req.query;
    const { items, total } = await getRows({
      table: table$s,
      user,
      query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.drawer = false;
      item.created_format = intlDateTime(item.created);
      items[i] = item;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$A.get("/ref/:ref", async function(req, res, next) {
  try {
    const item = await getCategoryByRef(req.params.ref);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$A.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$s,
      user
    });
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$A.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    let level = 0;
    if (data2.parent_id) {
      level = await getCategoryLevel(data2.parent_id);
      const [exist] = await pool$1.query(`SELECT * FROM t_category WHERE parent_id=? AND description=? AND c_status=4`, [data2.parent_id, data2.description]);
      if (exist) {
        throw new BaseError(
          "NO DATA UPDATED",
          401,
          true,
          `Esta categoría ya esta agregada.`,
          `Esta categoría ya esta agregada.`
        );
      }
    }
    const response2 = await insert({
      user,
      table: table$s,
      data: { ...data2, level }
    });
    req.io.emit("update", {
      table: table$s
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$s}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$A.post("/child", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const { id } = await getCategoryByRef(data2.ref);
    const [exist] = await pool$1.query(`SELECT * FROM t_category WHERE parent_id=? AND description=? AND c_status=4`, [id, data2.description]);
    if (exist) {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `Esta categoría ya esta agregada.`,
        `Esta categoría ya esta agregada.`
      );
    }
    const response2 = await insert({
      user,
      table: table$s,
      data: {
        description: data2.description,
        level: 1,
        parent_id: id
      }
    });
    req.io.emit("update", {
      table: table$s
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$s}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$A.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    let level = 0;
    if (data2.parent_id) {
      level = await getCategoryLevel(data2.parent_id);
    }
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$s,
      data: { ...data2, level }
    });
    req.io.emit("update", {
      table: table$s
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$s}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$A.put("/general/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$s,
      data: { ...data2 }
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$s}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$A.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$s,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$s
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$A.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$s,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$s
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$z = express.Router();
const table$r = "t_insurance";
router$z.get("/public", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      auth: 0,
      table: table$r,
      user,
      query: req.query
    });
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$z.use(isAuthenticated);
router$z.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$r,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.insurance_plan) {
        item.insurance_plan = JSON.parse(item.insurance_plan);
        item.insurance_plan_format = item.insurance_plan.map((i2) => i2.description).join(", ");
      } else {
        item.insurance_plan = [];
      }
      if (item.insurance_plan_type) {
        item.insurance_plan_type = JSON.parse(item.insurance_plan_type);
        item.insurance_plan_type_format = item.insurance_plan_type.map((i2) => i2.description).join(", ");
      } else {
        item.insurance_plan_type = [];
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
router$z.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$r,
      user
    });
    if (item.insurance_plan) {
      item.insurance_plan = JSON.parse(item.insurance_plan);
    } else {
      item.insurance_plan = [];
    }
    if (item.insurance_plan_type) {
      item.insurance_plan_type = JSON.parse(item.insurance_plan_type);
    } else {
      item.insurance_plan_type = [];
    }
    item.created_format = intlDateTime(item.created);
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$r
    });
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$z.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.description = data2.description.toUpperCase();
    const response2 = await insert({
      user,
      table: table$r,
      data: data2
    });
    req.io.emit("update", {
      table: table$r
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$r}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$z.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.description = data2.description.toUpperCase();
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$r,
      data: data2
    });
    req.io.emit("update", {
      table: table$r
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$r}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$z.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$r,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$r
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$z.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$r,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$r
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$y = express.Router();
const table$q = "t_role";
router$y.use(isAuthenticated);
router$y.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$q,
      user,
      query: req.query
    });
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$y.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$q,
      user
    });
    item.created_format = intlDateTime(item.created);
    item.menu = JSON.parse(item.menu);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$y.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$q,
      data: data2
    });
    req.io.emit("update", {
      table: table$q
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$q}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$y.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$q,
      data: data2
    });
    req.io.emit("update", {
      table: table$q
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$q}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$y.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$q,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$q
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$y.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$q,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$q
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$x = express.Router();
router$x.post("/log-close", async (req, res, next) => {
  try {
    const data2 = req.body;
    await pool$1.query(`UPDATE t_event SET blocked=0, blocked_by_id = null WHERE id=? AND blocked_by_id=?`, [data2.id, data2.blocked_by_id]);
    return res.json(1);
  } catch (error) {
    console.log(error);
  }
});
router$x.use(isAuthenticated);
router$x.get("/cedulados/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let [cedulado] = await pool.query(
      `SELECT * FROM t_cedulados WHERE Cedula=? LIMIT 1`,
      [req.params.id]
    );
    let [insured] = await pool$1.query(
      `SELECT * FROM t_insured WHERE ident_no=? AND c_status = 4 LIMIT 1`,
      [req.params.id]
    );
    if (cedulado) {
      return res.json({
        insured,
        ident_no: req.params.id,
        birthdate: intlDate(new Date(cedulado.FechaNacimiento)),
        $sex_id: cedulado.IdSexo === "M" ? 5 : cedulado.IdSexo === "F" ? 6 : null,
        description: `${cedulado.Nombres} ${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`,
        fullname: `${cedulado.Nombres} ${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`,
        firstname: `${cedulado.Nombres}`,
        lastname: `${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`
      });
    }
    if (insured) {
      return res.json({
        insured,
        ident_no: req.params.id,
        birthdate: insured.birthdate,
        $sex_id: insured.$sex_id,
        description: insured.description,
        fullname: insured.fullname,
        firstname: insured.firstname,
        lastname: insured.lastname
      });
    }
    throw new BaseError(
      "NO DATA UPDATED",
      404,
      true,
      `User ${user.description} couldn't find ident_no ${req.params.id}.`,
      `Cédula ${req.params.id} no encontrada`
    );
  } catch (err) {
    next(err);
  }
});
router$x.get("/rnc", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total, sql, sql_total, columns } = await getRowsUtils({
      table: "t_rnc",
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.rnc = item.rnc.replace(/(\d)(\d{2})(\d{5})(\d)/g, "$1-$2-$3-$4");
      item.label = `(${item.rnc}), ${item.registered_name}`;
      items[i] = item;
    }
    res.status(200).send({ items, total, sql, sql_total, columns });
  } catch (err) {
    next(err);
  }
});
router$x.get("/countries", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRowsUtils({
      auth: 0,
      table: "countries",
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.translations = JSON.parse(item.translations);
      if (item.translations.es) {
        item.description = item.translations.es;
      } else {
        item.description = item.name;
      }
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    res.status(200).send({ items, total });
  } catch (err) {
    next(err);
  }
});
router$x.get("/countries/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total } = await getRowsUtils({
      auth: 0,
      table: "countries",
      user,
      query: {
        where: {
          id: req.params.id
        }
      }
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.translations = JSON.parse(item.translations);
      if (item.translations.es) {
        item.description = item.translations.es;
      } else {
        item.description = item.name;
      }
    }
    res.status(200).send(items[0]);
  } catch (err) {
    next(err);
  }
});
router$x.get("/cities", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRowsUtils({
      auth: 0,
      table: "cities",
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    res.status(200).send({ items, total });
  } catch (err) {
    next(err);
  }
});
router$x.get("/cities/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items } = await getRowsUtils({
      auth: 0,
      table: "cities",
      user,
      query: {
        where: {
          id: req.params.id
        }
      }
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name;
    }
    res.status(200).send(items[0]);
  } catch (err) {
    next(err);
  }
});
router$x.get("/states", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRowsUtils({
      auth: 0,
      table: "states",
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    res.status(200).send({ items, total });
  } catch (err) {
    next(err);
  }
});
router$x.get("/states/:id", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let { items } = await getRowsUtils({
      auth: 0,
      table: "states",
      user,
      query: {
        where: {
          id: req.params.id
        }
      }
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.description = item.name;
    }
    res.status(200).send(items[0]);
  } catch (err) {
    next(err);
  }
});
router$x.get("/cie10", async (req, res, next) => {
  try {
    const user = res.locals.user;
    let items = await getRowsUtils({
      table: "t_cie10",
      user,
      query: req.query
    });
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
});
const router$w = express.Router();
const table$p = "t_file";
router$w.use(isAuthenticated);
router$w.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$p,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.file_date) {
        item.file_date = intlDate(item.file_date);
      }
      if (item.file_date_range) {
        item.file_date_range = JSON.parse(item.file_date_range);
      }
      if (item.language_ids) {
        item.language_ids = JSON.parse(item.language_ids);
      }
      if (item.language) {
        item.language = JSON.parse(item.language);
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
router$w.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$p,
      user
    });
    if (item.file_date) {
      item.file_date = intlDate(item.file_date);
    }
    if (item.file_date_range) {
      item.file_date_range = JSON.parse(item.file_date_range);
    }
    if (item.language_ids) {
      item.language_ids = JSON.parse(item.language_ids);
    }
    if (item.language) {
      item.language = JSON.parse(item.language);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$w.post("/", function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    uploadMultiple(req, res, async () => {
      try {
        const data2 = req.body;
        console.log(11, data2);
        if (data2._files) {
          data2._files = JSON.parse(data2._files);
        } else {
          data2._files = [];
        }
        if (data2.ref_id === "undefined") {
          data2.ref_id = null;
        }
        if (data2.file_date) {
          data2.file_date_valid = convertToValidDate(data2.file_date);
          data2.file_date = mysqlDateTime(
            addCurrentTimeToDate(data2.file_date_valid)
          );
        } else {
          data2.file_date = null;
        }
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const fileData = await uploadDestination({
            account,
            table: data2.ref_key,
            id: data2.ref_id,
            file
          });
          const [cat] = await pool$1.query(`SELECT * FROM t_category WHERE description=? AND parent_id=?`, [data2.file_type, 24]);
          if (!cat) {
            return res.status(401).json({ message: `La categoría del archivo es obligatoria` });
          }
          if (data2.ref_id) {
            await insert({
              table: table$p,
              user,
              data: {
                ref_key: data2.ref_key,
                ref_id: data2.ref_id,
                $file_type_id: cat.id,
                description: data2._files[i].description ? data2._files[i].description : file.originalname.replace(/\.[^/.]+$/, ""),
                ...fileData
              }
            });
          }
        }
        console.log(data2.ref_key, data2.ref_id);
        req.io.emit("update", {
          table: data2.ref_key,
          id: data2.ref_id
        });
        req.io.emit("update", {
          table: table$p
        });
        return res.status(200).json(true);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});
router$w.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.file_date) {
      data2.file_date_valid = convertToValidDate(data2.file_date);
      data2.file_date = mysqlDateTime(
        addCurrentTimeToDate(data2.file_date_valid)
      );
    } else {
      data2.file_date = null;
    }
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$p,
      data: data2
    });
    req.io.emit("update", {
      table: data2.ref_key
    });
    req.io.emit("update", {
      table: table$p
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$p}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$w.post("/migration/:table", function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    uploadMultiple(req, res, async () => {
      try {
        const data2 = req.body;
        const file = req.files[0];
        const fileData = await uploadDestination({
          account,
          file
        });
        const options = {
          url: path__default.join(fileData.destination, fileData.filename),
          insurance: data2.insurance,
          insurance_id: data2.insurance_id,
          policy_type: data2.policy_type,
          $policy_type_id: data2.$policy_type_id
        };
        const response2 = await _migration[req.params.table](options);
        return res.status(200).json(response2);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});
router$w.delete("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await update({
      user,
      id: req.params.id,
      table: table$p,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: data2.ref_key,
      id: data2.ref_id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$w.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$p,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$p
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$v = express.Router();
router$v.use(isAuthenticated);
router$v.get("/", async function(req, res, next) {
  try {
    res.status(200).json({ items: permissions });
  } catch (error) {
    next(error);
  }
});
router$v.get("/tables", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let roles = await getRows({
      table: "t_role",
      user,
      query: {}
    });
    const tables = await getSchema();
    for (let i = 0; i < roles.items.length; i++) {
      const role = roles.items[i];
      for (let j = 0; j < tables.tables_roles.length; j++) {
        const table2 = tables.tables_roles[j];
        table2[role.label] = !!(role.value & table2.value);
        tables.tables_roles[j] = table2;
      }
    }
    for (const key in permissions) {
      if (Object.hasOwnProperty.call(permissions, key)) {
        const permission = permissions[key];
        for (let j = 0; j < tables.tables_unixperms.length; j++) {
          const table2 = tables.tables_unixperms[j];
          table2[key] = !!(permission & table2.value);
          tables.tables_unixperms[j] = table2;
        }
      }
    }
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
});
router$v.get("/actions", async function(req, res, next) {
  try {
    let result = await pool$1.query("SELECT * FROM t_action");
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router$v.put("/unixperms", async function(req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      return res.status(401).json({ msg: "No esta Autorizado" });
    }
    for (const item of req.body) {
      pool$1.query("ALTER TABLE ?? ALTER COLUMN ?? SET DEFAULT ?", [
        item.table,
        "c_unixperms",
        item.c_unixperms
      ]);
      pool$1.query("UPDATE ?? SET ??=?", [
        item.table,
        "c_unixperms",
        item.c_unixperms
      ]);
    }
    res.status(200).json({
      msg: "Unix-permisos actualizados"
    });
  } catch (error) {
    next(error);
  }
});
router$v.put("/roles-permission", async function(req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      return res.status(401).json({ msg: "No esta Autorizado" });
    }
    for (const item of req.body) {
      pool$1.query("ALTER TABLE ?? ALTER COLUMN ?? SET DEFAULT ?", [
        item.table,
        "c_roles",
        item.c_group
      ]);
      pool$1.query("UPDATE ?? SET ??=?", [item.table, "c_roles", item.c_group]);
    }
    res.status(200).json({
      msg: "Unix-permisos actualizados"
    });
  } catch (error) {
    next(error);
  }
});
router$v.post("/add_privileges", async function(req, res) {
  try {
    let data2 = req.body.data;
    for (const id of req.body.ids) {
      for (const user of data2.users) {
        for (const action of data2.actions) {
          let result = await pool$1.query(
            "SELECT * FROM t_privilege WHERE c_group='user' AND c_type='object' AND c_related_table='contacts' AND c_who=? AND c_action IN (?) AND c_related_uid = ? LIMIT 1",
            [user, action, id]
          );
          if (!result.length) {
            await pool$1.query(
              "INSERT t_privilege SET c_group='user', c_type='object', c_related_table='contacts', c_who=?, c_action=?, c_related_uid=?",
              [user, action, id]
            );
          }
        }
      }
    }
    res.status(200).json({ msg: "privilegios asignados" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
const router$u = express.Router();
router$u.use(isAuthenticated);
router$u.get("/", async function(req, res, next) {
  try {
    let result = await pool$1.query(
      "SELECT * FROM t_privilege WHERE c_type='table'"
    );
    res.status(200).json({ items: result });
  } catch (err) {
    next(err);
  }
});
router$u.get("/table/:id", async function(req, res, next) {
  try {
    const tables = await getTable();
    let privileges = await pool$1.query(
      "SELECT * FROM t_privilege WHERE c_type='table' AND c_group='role' AND c_who=? AND c_action='create'",
      [req.params.id]
    );
    const items = [];
    for (let i = 0; i < tables.length; i++) {
      const table2 = tables[i];
      let obj = {
        table: table2,
        create: false
      };
      for (let j = 0; j < privileges.length; j++) {
        const privilege = privileges[j];
        if (table2.toUpperCase() === privilege.c_related_table.toUpperCase()) {
          obj.create = true;
        }
      }
      items.push(obj);
    }
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});
router$u.get("/:id", async function(req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      res.status(401).json({ msg: "No esta Autorizado" });
    }
    let item = await pool$1.query("SELECT * FROM t_privilege WHERE id=?", [
      req.params.id
    ]);
    res.status(200).json(item[0]);
  } catch (err) {
    next(err);
  }
});
router$u.post("/", async function(req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      return res.status(401).json({ msg: "No esta Autorizado" });
    }
    for (const item of req.body) {
      let action = item.c_action;
      delete item.action;
      item.c_type = "table";
      let [check] = await pool$1.query(
        `SELECT COUNT(*) AS count FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?`,
        Object.values(item)
      );
      if (check.count) {
        await pool$1.query(
          "DELETE FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?",
          Object.values(item)
        );
      } else if (action.toUpperCase() == "create") {
        if (!check.count) {
          await insert({
            authenticate: 0,
            user: res.locals.user,
            table: "t_privilege",
            data: item
          });
        }
      }
    }
    res.status(200).json({
      msg: "Privilegios actualizados"
    });
  } catch (err) {
    next(err);
  }
});
router$u.put("/:id", async function(req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      res.status(401).json({ msg: "No esta Autorizado" });
    }
    var data2 = await pool$1.query("UPDATE t_privilege SET ? WHERE id=?", [
      req.body,
      req.params.id
    ]);
    res.status(200).json({ msg: "Dato Actualizado" });
  } catch (err) {
    next(err);
  }
});
router$u.delete("/", async function(req, res, next) {
  try {
    if (!(res.locals.user.unixroles & 3)) {
      res.status(401).json({ msg: "No esta Autorizado" });
    }
    req.body.c_type = "table";
    var check = await pool$1.query(
      "SELECT COUNT(*) AS count FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?",
      Object.values(req.body)
    );
    if (check[0].count) {
      var data2 = await pool$1.query(
        "DELETE FROM t_privilege WHERE c_related_table=? AND c_who=? AND c_action=? AND c_group=? AND c_type=?",
        Object.values(req.body)
      );
      res.status(200).json({ msg: "Dato Borrado" });
    } else {
      res.status(200).json({ msg: false });
    }
  } catch (err) {
    next(err);
  }
});
const router$t = express.Router();
const table$o = "t_diagnosis";
router$t.use(isAuthenticated);
router$t.get("/user", async function(req, res, next) {
  try {
    const items = await pool$1.query("SELECT diagnosis, diagnosis_ids  FROM t_patient WHERE 1 AND`c_status` = 4 AND (`diagnosis` IS NOT NULL OR `diagnosis` != '[]') ORDER BY created ASC");
    const diagnosisList = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.diagnosis)
        continue;
      item.diagnosis = JSON.parse(item.diagnosis);
      item.diagnosis_ids = JSON.parse(item.diagnosis_ids);
      if (item.diagnosis.length) {
        for (let i2 = 0; i2 < item.diagnosis.length; i2++) {
          const row = item.diagnosis[i2];
          const index = diagnosisList.findIndex((i3) => i3.id === row.id);
          if (index === -1) {
            diagnosisList.push({
              id: row.id,
              code: row.code,
              description: row.description,
              quantity: 1
            });
          } else {
            ++diagnosisList[index].quantity;
          }
        }
      }
    }
    res.status(200).send(diagnosisList);
  } catch (error) {
    next(error);
  }
});
router$t.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$o,
      user,
      query: req.query
    });
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$t.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$o,
      user
    });
    if (isValidDate$1(item.created)) {
      item.created_format = intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$t.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$o,
      data: data2
    });
    req.io.emit("update", {
      table: table$o,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$o}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$t.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$o,
      data: data2
    });
    req.io.emit("update", {
      table: table$o,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$o}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$t.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$o,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$o
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$t.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$o,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$o
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$s = express.Router();
const table$n = "t_event";
router$s.use(isAuthenticated);
router$s.get("/stats", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items } = await getRows({
      table: table$n,
      user,
      query: req.query
    });
    let stats = {
      c: {
        pregnant: 0,
        quantity: 0,
        sex: {
          men: 0,
          women: 0
        },
        ageRange: {},
        eventType: {},
        eventState: {},
        users: {},
        providers: {},
        diagnosis: {},
        countries: {},
        cities: {}
      },
      e: {
        quantity: 0,
        pregnant: 0,
        sex: {
          men: 0,
          women: 0
        },
        ageRange: {},
        eventType: {},
        eventState: {},
        users: {},
        providers: {},
        diagnosis: {},
        countries: {},
        cities: {}
      }
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
          let age = calculateAge(item.birthdate);
          if (age) {
            setAgeStats(stats.c, age);
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
          for (let i2 = 0; i2 < item.diagnosis.length; i2++) {
            const row = item.diagnosis[i2];
            if (stats.c.diagnosis[row.code]) {
              ++stats.c.diagnosis[row.code].quantity;
            } else {
              stats.c.diagnosis[row.code] = {
                description: row.description,
                code: row.code,
                quantity: 1,
                group_desc: row.group_desc || "",
                chapter_desc: row.chapter_desc || ""
              };
            }
          }
        }
        if (item.pregnant) {
          ++stats.c.pregnant;
        }
        ++stats.c.quantity;
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
          let age = calculateAge(item.birthdate);
          if (age) {
            setAgeStats(stats.e, age);
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
          for (let i2 = 0; i2 < item.diagnosis.length; i2++) {
            const row = item.diagnosis[i2];
            if (stats.e.diagnosis[row.code]) {
              ++stats.e.diagnosis[row.code].quantity;
            } else {
              stats.e.diagnosis[row.code] = {
                description: row.description,
                code: row.code,
                quantity: 1
              };
            }
          }
        }
        if (item.pregnant) {
          ++stats.e.pregnant;
        }
        ++stats.e.quantity;
        continue;
      }
    }
    stats.c.eventStateList = Object.keys(stats.c.eventState).reduce((acc, curr) => {
      acc.push({
        value: stats.c.eventState[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.c.providerList = Object.keys(stats.c.providers).reduce((acc, curr) => {
      acc.push({
        value: stats.c.providers[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.c.countryList = Object.keys(stats.c.countries).reduce((acc, curr) => {
      acc.push({
        value: stats.c.countries[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.c.cityList = Object.keys(stats.c.cities).reduce((acc, curr) => {
      acc.push({
        value: stats.c.cities[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.c.diagnosisList = Object.keys(stats.c.diagnosis).reduce((acc, curr) => {
      acc.push({
        value: stats.c.diagnosis[curr].quantity,
        label: `[${stats.c.diagnosis[curr].code}] ${stats.c.diagnosis[curr].description}`
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.c.eventTypeList = Object.keys(stats.c.eventType).reduce((acc, curr) => {
      acc.push({
        value: stats.c.eventType[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.c.users = Object.keys(
      sortObjectByValue(stats.c.users)
    ).reduce((acc, curr) => {
      acc.push({
        value: stats.c.users[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.e.eventStateList = Object.keys(stats.e.eventState).reduce((acc, curr) => {
      acc.push({
        value: stats.e.eventState[curr],
        label: curr
      });
      return acc;
    }, []);
    stats.e.providerList = Object.keys(stats.e.providers).reduce((acc, curr) => {
      acc.push({
        value: stats.e.providers[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.e.countryList = Object.keys(stats.e.countries).reduce((acc, curr) => {
      acc.push({
        value: stats.e.countries[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.e.cityList = Object.keys(stats.e.cities).reduce((acc, curr) => {
      acc.push({
        value: stats.e.cities[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.e.eventTypeList = Object.keys(stats.e.eventType).reduce((acc, curr) => {
      acc.push({
        value: stats.e.eventType[curr],
        label: curr
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.e.diagnosisList = Object.keys(stats.e.diagnosis).reduce((acc, curr) => {
      acc.push({
        value: stats.e.diagnosis[curr].quantity,
        label: `[${stats.e.diagnosis[curr].code}] ${stats.e.diagnosis[curr].description}`
      });
      return acc;
    }, []).sort((a, b) => b.value - a.value);
    stats.e.users = Object.keys(
      sortObjectByValue(stats.e.users)
    ).reduce((acc, curr) => {
      acc.push({
        value: stats.e.users[curr],
        label: curr
      });
      return acc;
    }, []);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});
async function getEventColor(catId) {
  const [cat] = await pool$1.query(`select color from t_category where id=?`, [catId]);
  return cat.color;
}
async function updateInsured(data2, user) {
  try {
    if (data2.insured_id) {
      if (data2.provider_id && data2.provider_id) {
        const index = data2.insured_provider.findIndex((i) => parseInt(i.id) === parseInt(data2.provider_id));
        if (index === -1) {
          data2.insured_provider.push({
            id: String(data2.provider_id),
            description: data2.provider_description,
            MRN: data2.MRN
          });
        } else {
          data2.insured_provider[index] = {
            id: String(data2.provider_id),
            description: data2.provider_description,
            MRN: data2.MRN
          };
        }
      }
      await update({
        id: data2.insured_id,
        user,
        table: "t_insured",
        data: {
          provider: data2.insured_provider,
          phone: data2.phone,
          email: data2.email,
          address: data2.address
        },
        log: true
      });
    }
  } catch (error) {
    console.log(error);
  }
}
router$s.get("/alert-list", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql, sqlTotal } = await getRows({
      table: table$n,
      user,
      query: req.query,
      optsServer: {
        columns: "t_event.id AS event_id, t_event.*, t_itinerary.*, MAX(t_itinerary.attendance_datetime) AS last_attendance_datetime, t_event.id AS id",
        having: "HAVING MAX(t_itinerary.attendance_datetime) < NOW() - INTERVAL 3 DAY"
      }
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.last_attendance_datetime_format = intlDateTime(item.last_attendance_datetime);
      item.time_passed = differenceInDays(/* @__PURE__ */ new Date(), item.last_attendance_datetime);
      item.time_passed_format = item.time_passed > 1 ? `Hace ${item.time_passed} días` : `Hace ${item.time_passed} día`;
      if (item.time_passed > 1) {
        item.time_passed_color = "#4CAF50";
      }
      if (item.time_passed > 10) {
        item.time_passed_color = "#FFD93B";
      }
      if (item.time_passed > 30) {
        item.time_passed_color = "#FF4B4B";
      }
      if (item.pending_list) {
        item.pending_list = JSON.parse(item.pending_list);
      }
      if (item.doctor_description) {
        item.doctor_description = item.doctor_description.split("|");
      }
      if (item.request_date) {
        item.request_date_format = intlReadbleDate(item.request_date);
      }
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$s.get("/", async function(req, res, next) {
  var _a, _b;
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$n,
      user,
      query: req.query,
      optsServer: {
        columns: ((_b = (_a = req.query) == null ? void 0 : _a.join) == null ? void 0 : _b.length) ? `GROUP_CONCAT(DISTINCT doctor_description SEPARATOR '|') AS doctor_description` : ""
      }
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.attendance_datetime && item.attendance_datetime !== "0000-00-00 00:00:00") {
        item.start = item.attendance_datetime;
        item.end = item.attendance_datetime;
        item.start_readable = intlReadbleDate(item.attendance_datetime);
        item.start_calendar = formatDateTime(item.attendance_datetime);
        item.attendance_date = intlDate(item.attendance_datetime);
        item.attendance_time = intlTime(item.attendance_datetime);
        item.attendance_datetime = intlDateTime(item.attendance_datetime);
      }
      if (item.request_date) {
        item.request_date_format = intlReadbleDate(item.request_date);
      }
      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis);
      }
      if (item.doctor_description) {
        item.doctor_description = item.doctor_description.split("|");
      }
      if (item.presumptive_diagnosis) {
        item.presumptive_diagnosis = JSON.parse(item.presumptive_diagnosis);
      }
      if (item.desirable_dates) {
        item.desirable_dates = JSON.parse(item.desirable_dates);
      }
      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure);
      }
      if (item.pending_list) {
        item.pending_list = JSON.parse(item.pending_list);
      }
      if (item.event_state_time) {
        item.event_state_time = JSON.parse(item.event_state_time);
      }
      if (item.policy) {
        item.policy = JSON.parse(item.policy);
      }
      item.created_format = intlDateTime(item.created);
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      if (item.cancelled_date) {
        item.cancelled_date_format = intlDateTime(item.cancelled_date);
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
router$s.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$n,
      user,
      query: {
        where: {
          "bi:c_status": 7
        }
      }
    });
    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis);
    }
    if (item.presumptive_diagnosis) {
      item.presumptive_diagnosis = JSON.parse(item.presumptive_diagnosis);
    }
    if (item.desirable_dates) {
      item.desirable_dates = JSON.parse(item.desirable_dates);
    }
    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure);
    }
    if (item.itinerary) {
      item.itinerary = JSON.parse(item.itinerary);
    }
    if (item.policy) {
      item.policy = JSON.parse(item.policy);
    }
    if (item.event_state_time) {
      item.event_state_time = JSON.parse(item.event_state_time);
    }
    if (item.request_date) {
      item.request_date = intlDate(item.request_date);
    }
    if (item.pregnant_start) {
      item.pregnant_start = intlDate(item.pregnant_start);
    }
    if (item.pending_list) {
      item.pending_list = JSON.parse(item.pending_list);
    }
    if (item.attendance_datetime) {
      item.attendance_date = intlDate(item.attendance_datetime);
      item.attendance_time = intlTime(item.attendance_datetime);
      item.attendance_time_format = getAMPMFromDate(item.attendance_datetime);
      item.attendance_datetime = intlDateTime(item.attendance_datetime);
    }
    item.created_format = intlDateTime(item.created);
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    if (item.cancelled_date) {
      item.cancelled_date_format = intlDateTime(item.cancelled_date);
    }
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$n
    });
    if (item.files) {
      item.HIPAA_file = item.files.filter((i) => {
        if (i.file_type === "HIPAA") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
      item.ROI_file = item.files.filter((i) => {
        if (i.file_type === "ROI") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
      item.VOB_file = item.files.filter((i) => {
        if (i.file_type === "VOB") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
      item.NOTAS_MEDICAS_file = item.files.filter((i) => {
        if (i.file_type === "NOTAS MÉDICAS") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
      item.medical_guide_file = item.files.filter((i) => {
        if (i.file_type === "GUÍA MÉDICA") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$s.post("/", async function(req, res, next) {
  try {
    let response2;
    const user = res.locals.user;
    const data2 = req.body;
    data2.code = await getCode({ table: table$n });
    if (data2.request_date) {
      data2.request_date = mysqlDateTime(convertToValidDate(data2.request_date));
    } else {
      data2.request_date = null;
    }
    if (data2.cancelled_date) {
      data2.cancelled_date = mysqlDateTime(convertToValidDate(data2.cancelled_date));
    } else {
      data2.cancelled_date = null;
    }
    if (data2.pregnant_start) {
      data2.pregnant_start = mysqlDateTime(convertToValidDate(data2.pregnant_start));
    } else {
      data2.pregnant_start = null;
    }
    updateInsured(data2, user);
    data2.color = await getEventColor(data2.$event_state_id);
    response2 = await insert({
      user,
      table: table$n,
      data: {
        ...data2,
        copay: cleanCurrency(data2.copay),
        coinsurance: cleanCurrency(data2.coinsurance),
        deductible: cleanCurrency(data2.deductible)
      },
      log: true
    });
    for (let i = 0; i < data2.itinerary.length; i++) {
      const itinerary = data2.itinerary[i];
      if (!itinerary.attendance_date || !itinerary.attendance_time) {
        throw new BaseError(
          "NO DATA UPDATED",
          401,
          true,
          `Es requerida la fecha en el itinerario.`,
          `Es requerida la fecha en el itinerario.`
        );
      }
      if (!isValidDate(itinerary.attendance_date) || !isValidTime(itinerary.attendance_time)) {
        throw new BaseError(
          "NO DATA UPDATED",
          401,
          true,
          `Es requerida la fecha en el itinerario.`,
          `Es requerida la fecha en el itinerario.`
        );
      }
    }
    for (let i = 0; i < data2.itinerary.length; i++) {
      const itinerary = data2.itinerary[i];
      itinerary.event_id = response2.id;
      if (itinerary.attendance_time) {
        itinerary.attendance_time = itinerary.attendance_time.replace(/\s?[ap]\.\sm\.$/, "").trim();
      }
      if (itinerary.attendance_date && itinerary.attendance_time) {
        itinerary.attendance_datetime = mergeDateAndTime(itinerary.attendance_date, itinerary.attendance_time, itinerary.attendance_time_format);
      } else {
        itinerary.attendance_datetime = null;
      }
      itinerary.code = await getCode({ table: "t_itinerary" });
      await insert({
        user,
        table: "t_itinerary",
        data: itinerary
      });
    }
    for (let i = 0; i < data2.admin_comments.length; i++) {
      const ac = data2.admin_comments[i];
      ac.ref_id = response2.id;
      await insert({
        user,
        table: "t_comment",
        data: ac
      });
    }
    req.io.emit("update", {
      table: table$n
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$n}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$s.put("/sort/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$n,
      data: {
        sort: data2.sort
      }
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$n}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$s.put("/general/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$n,
      data: {
        ...data2
      },
      options: {
        modified: false
      }
    });
    req.io.emit("update", {
      table: table$n
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$n}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$s.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    console.log(9);
    if (data2.request_date) {
      data2.request_date = mysqlDateTime(convertToValidDate(data2.request_date));
    } else {
      data2.request_date = null;
    }
    if (data2.cancelled_date) {
      data2.cancelled_date = mysqlDateTime(convertToValidDate(data2.cancelled_date));
    } else {
      data2.cancelled_date = null;
    }
    if (data2.pregnant_start) {
      data2.pregnant_start = mysqlDateTime(convertToValidDate(data2.pregnant_start));
    } else {
      data2.pregnant_start = null;
    }
    updateInsured(data2, user);
    data2.color = await getEventColor(data2.$event_state_id);
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$n,
      data: {
        ...data2,
        copay: cleanCurrency(data2.copay),
        deductible: cleanCurrency(data2.deductible)
      },
      log: true
    });
    req.io.emit("update", {
      table: table$n
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$n}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$s.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$n,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$n
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$s.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$n,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$n
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$r = express.Router();
router$r.post("/notification", async function(req, res, next) {
  try {
    const data2 = req.body;
    req.io.emit("update", data2);
    return res.status(200).json(true);
  } catch (error) {
    console.log(error);
  }
});
router$r.get("/poll/decrypt", async function(req, res, next) {
  try {
    const data2 = req.query;
    let [result] = await pool$1.query(
      `SELECT * FROM t_token WHERE token=? LIMIT 1`,
      [data2.token]
    );
    let response2 = JSON.parse(result.data);
    return res.status(200).json({
      contact_id: response2.contact_id,
      contact_description: response2.contact_description,
      user_id: response2.user_id,
      user_description: response2.user_description,
      event_id: response2.id,
      event_code: response2.code,
      event_start: response2.start
    });
  } catch (err) {
    next(err);
  }
});
router$r.use(isAuthenticated);
router$r.post("/poll", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    var buf = await crypto.randomBytes(20);
    var token = buf.toString("hex");
    insert({
      user,
      table: "t_token",
      data: {
        token,
        data: JSON.stringify(data2)
      }
    });
    await postMarkTemplate({
      MessageStream: "outbound",
      TemplateId: "38835344",
      From: `${process.env.MAIL_USER}`,
      To: `Enmanuel Martínez <enmanuelpsy@gmail.com>`,
      // To: `${data.contact_description} <${data.contact_email}>`,
      ReplyTo: `${account.email}`,
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        url: `${process.env.DOMAIN}/encuesta-de-calidad?token=${token}`,
        created_by: user.description,
        date: format(/* @__PURE__ */ new Date(), "dd-MM-yyyy"),
        logo_url: `${process.env.DOMAIN_HOST}/images/logoText.png`
      }
    });
    req.io.emit("event", {
      type: 3,
      user_id: user.id
    });
    if (user.unixroles & 3) {
      return res.status(200).json({
        msg: "Mensaje Enviado"
      });
    }
    return res.status(200).json(true);
  } catch (err) {
    next(err);
  }
});
router$r.post("/task", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    const response2 = await postMarkTemplate({
      MessageStream: "outbound",
      From: `MEDTRAVEL <${process.env.MAIL_USER}>`,
      To: [data2.email].join(","),
      TemplateId: "40114557",
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        data: data2,
        url: `${process.env.DOMAIN_HOST}`,
        logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`
      },
      ReplyTo: `${account.email}`
    });
    await pool$1.query(
      `UPDATE t_task SET sent=1 WHERE id=? LIMIT 1`,
      [data2.id]
    );
    req.io.emit("update", {
      table: "t_task"
    });
    return res.status(200).json(11);
  } catch (error) {
    next(error);
  }
});
router$r.post("/task-closed", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    const [_user] = await pool$1.query(`SELECT email FROM t_user WHERE id=?`, [data2.created_by_id]);
    const response2 = await postMarkTemplate({
      MessageStream: "outbound",
      From: `MEDTRAVEL <${process.env.MAIL_USER}>`,
      To: [_user.email].join(","),
      TemplateId: "40339589",
      TemplateModel: {
        company_name: account.description,
        company_instagram: account.instagram,
        company_facebook: account.facebook,
        company_twitter: account.twitter,
        company_address: account.address,
        company_phone: account.phone,
        company_cel: account.cel,
        data: data2,
        url: `${process.env.DOMAIN_HOST}`,
        logo_url: `${process.env.DOMAIN_HOST}/assets/logoText.png`
      },
      ReplyTo: `${account.email}`
    });
    req.io.emit("update", {
      table: "t_task"
    });
    return res.status(200).json(11);
  } catch (error) {
    next(error);
  }
});
const router$q = express.Router();
const table$m = "t_procedure";
router$q.use(isAuthenticated);
router$q.get("/user", async function(req, res, next) {
  try {
    const items = await pool$1.query("SELECT procedure, procedure_ids  FROM t_patient WHERE 1 AND`c_status` = 4 AND (`procedure` IS NOT NULL OR `procedure` != '[]') ORDER BY created ASC");
    const procedureList = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.procedure)
        continue;
      item.procedure = JSON.parse(item.procedure);
      item.procedure_ids = JSON.parse(item.procedure_ids);
      if (item.procedure.length) {
        for (let i2 = 0; i2 < item.procedure.length; i2++) {
          const row = item.procedure[i2];
          const index = procedureList.findIndex((i3) => i3.id === row.id);
          if (index === -1) {
            procedureList.push({
              id: row.id,
              code: row.code,
              description: row.description,
              quantity: 1
            });
          } else {
            ++procedureList[index].quantity;
          }
        }
      }
    }
    res.status(200).send(procedureList);
  } catch (error) {
    next(error);
  }
});
router$q.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$m,
      user,
      query: req.query
    });
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$q.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$m,
      user
    });
    if (isValidDate$1(item.created)) {
      item.created_format = intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$q.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$m,
      data: data2
    });
    req.io.emit("update", {
      table: table$m
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$m}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$q.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$m,
      data: data2
    });
    req.io.emit("update", {
      table: table$m
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$m}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$q.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$m,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$m
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$q.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$m,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$m
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$p = express.Router();
const table$l = "t_account";
router$p.use(isAuthenticated);
router$p.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$l,
      user,
      query: req.query
    });
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$p.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$l,
      user
    });
    if (item.printer) {
      item.printer = JSON.parse(item.printer);
    } else {
      item.printer = {};
    }
    item.created_format = intlDateTime(item.created);
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$p.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$l,
      data: data2
    });
    req.io.emit("update", {
      table: table$l,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$l}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$p.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$l,
      data: data2
    });
    req.io.emit("update", {
      table: table$l,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$l}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$p.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$l,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$l,
      id: req.params.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$p.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$l,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$l
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$o = express.Router();
const table$k = "t_speciality";
router$o.use(isAuthenticated);
router$o.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$k,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.sub) {
        item.sub = JSON.parse(item.sub);
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
router$o.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$k,
      user
    });
    if (item.sub) {
      item.sub = JSON.parse(item.sub);
    }
    if (isValidDate$1(item.created)) {
      item.created_format = intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$o.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$k,
      data: data2
    });
    req.io.emit("update", {
      table: table$k
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$k}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$o.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$k,
      data: data2
    });
    req.io.emit("update", {
      table: table$k
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$k}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$o.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$k,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$k
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$o.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$k,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$k
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$n = express.Router();
const table$j = "t_customer";
router$n.use(isAuthenticated);
async function checkIfcustomerExist(user, data2) {
  if (data2.ident_no) {
    const { items, total, sql } = await getRows({
      table: table$j,
      user,
      query: {
        where: {
          ident_no: data2.ident_no,
          c_status: 4
        }
      }
    });
    if (items.length) {
      return true;
    }
    return false;
  }
}
router$n.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$j,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.language_ids) {
        item.language_ids = JSON.parse(item.language_ids);
        item.language = JSON.parse(item.language);
      } else {
        item.language_ids = [];
        item.language = [];
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
router$n.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$j,
      user
    });
    if (item.language_ids) {
      item.language_ids = JSON.parse(item.language_ids);
      item.language = JSON.parse(item.language);
    } else {
      item.language_ids = [];
      item.language = [];
    }
    if (isValidDate$1(item.created)) {
      item.created_format = intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$n.get("/exist", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.query;
    const exist = await checkIfcustomerExist(user, data2);
    if (exist) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with ident: ${data2.ident_no} exist.`,
        `El asegurado con cédula ${data2.ident_no} ya existe`
      );
    } else {
      return res.json(false);
    }
  } catch (error) {
    next(error);
  }
});
router$n.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$j,
      data: data2
    });
    req.io.emit("update", {
      table: table$j
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$j}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$n.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$j,
      data: data2
    });
    req.io.emit("update", {
      table: table$j
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$j}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$n.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$j,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$j
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$n.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$j,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$j
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$m = express.Router();
const table$i = "t_insured";
router$m.use(isAuthenticated);
async function checkIfinsuredExist(user, data2) {
  if (data2.ident_no) {
    const { items, total, sql } = await getRows({
      table: table$i,
      user,
      query: {
        where: {
          ident_no: data2.ident_no,
          c_status: 4
        }
      }
    });
    if (items.length) {
      return true;
    }
    return false;
  }
}
async function insertPolicyDependant(user, id, data2) {
  if (!data2.policy_number || !data2.titular_id || !data2.insurance_id || !id) {
    return null;
  }
  const [policy] = await pool$1.query(`select * from t_policy where policy_number=? and insurance_id=? and c_status=4 and relationship='Titular' and titular_id=?`, [data2.policy_number, data2.insurance_id, data2.titular_id]);
  if (!policy) {
    return null;
  }
  const dat = {
    insured_id: id,
    insured_description: data2.fullname,
    insured_code: data2.insured_code,
    $relationship_id: data2.$relationship_id,
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
    contacts: policy.contacts
  };
  dat.code = await getCode({ table: "t_policy" });
  const response2 = await insert({
    user,
    table: "t_policy",
    data: dat
  });
  if (response2) {
    const policies = [{
      "id": String(response2.id),
      "policy_number": String(dat.policy_number),
      "insured_code": String(dat.insured_code),
      "insurance_id": String(dat.insurance_id),
      "insurance": String(dat.insurance)
    }];
    await pool$1.query(`UPDATE t_insured SET policies=? WHERE id=?`, [JSON.stringify(policies), id]);
    return true;
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
    return selectedDescription;
  }
  if (possibleInverses.length === 1) {
    return possibleInverses[0];
  }
  if ($sex_id) {
    if ($sex_id === 5 && possibleInverses.includes("PADRE"))
      return "PADRE";
    if ($sex_id === 6 && possibleInverses.includes("MADRE"))
      return "MADRE";
    if ($sex_id === 5 && possibleInverses.includes("HIJO"))
      return "HIJO";
    if ($sex_id === 6 && possibleInverses.includes("HIJA"))
      return "HIJA";
  }
  return possibleInverses[0];
}
router$m.get("/stats", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, sql } = await getRows({
      table: table$i,
      user,
      query: req.query
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
        "70/+": []
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
        item.policies = JSON.parse(item.policies);
        for (let j = 0; j < item.policies.length; j++) {
          const policy = item.policies[j];
          if (!policy.insurance) {
            continue;
          }
          if (policy.insurance !== null) {
            if (stats.insurances[policy.insurance]) {
              stats.insurances[policy.insurance] += 1;
            } else {
              stats.insurances[policy.insurance] = 1;
            }
          }
        }
      }
      if (item.birthdate) {
        let age = calculateAge(item.birthdate);
        if (age) {
          switch (true) {
            case (age > 0 && age <= 10):
              stats.ages_range["0/10"].push(age);
              break;
            case (age > 10 && age <= 20):
              stats.ages_range["10/20"].push(age);
              break;
            case (age > 20 && age <= 30):
              stats.ages_range["20/30"].push(age);
              break;
            case (age > 30 && age <= 40):
              stats.ages_range["30/40"].push(age);
              break;
            case (age > 40 && age <= 50):
              stats.ages_range["40/50"].push(age);
              break;
            case (age > 50 && age <= 70):
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
router$m.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$i,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.birthdate && isValidDate$1(item.birthdate)) {
        item.age = calculateReadableAge(item.birthdate);
        item.birthday = isBirthday(item.birthdate);
        item.birthdate = intlDate(item.birthdate);
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
        item.language_ids = JSON.parse(item.language_ids);
        item.language = JSON.parse(item.language);
      } else {
        item.language_ids = [];
        item.language = [];
      }
      const { items: policies } = await getRows({
        auth: 0,
        user,
        table: "t_policy",
        query: {
          groupBy: ["t_policy.id"],
          join: [{ table: "t_policy_insured", relationA: "t_policy_insured.policy_id", relationB: "t_policy.id" }],
          where: {
            insured_id: item.id,
            "t_policy_insured.c_status": 4
          }
        }
      });
      item.policies = policies;
      item.record_format = separatedByComma(item.code, item.age);
      item.location_format = separatedByComma(item.country, item.state, item.city);
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
      item.files = await getFiles({
        ref_id: item.id,
        ref_key: table$i
      });
      if (item.files) {
        item.profile = item.files.filter((i2) => {
          if (i2.file_type === "FOTO PERFIL") {
            return true;
          } else {
            return false;
          }
        }).reduce((acc, curr) => {
          return curr;
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
router$m.get("/exist", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.query;
    const exist = await checkIfinsuredExist(user, data2);
    if (exist) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with ident: ${data2.ident_no} exist.`,
        `El asegurado con cédula ${data2.ident_no} ya existe`
      );
    } else {
      return res.json(false);
    }
  } catch (error) {
    next(error);
  }
});
router$m.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$i,
      user
    });
    if (item.birthdate && isValidDate$1(item.birthdate)) {
      item.age = calculateReadableAge(item.birthdate);
      item.birthday = isBirthday(item.birthdate);
      item.birthdate = intlDate(item.birthdate);
    }
    if (item.insurances) {
      item.insurances = JSON.parse(item.insurances);
    } else {
      item.insurances = [];
    }
    if (item.language_ids) {
      item.language_ids = JSON.parse(item.language_ids);
      item.language = JSON.parse(item.language);
    } else {
      item.language_ids = [];
      item.language = [];
    }
    const { items: policies } = await getRows({
      user,
      table: "t_policy",
      query: {
        groupBy: ["t_policy.id"],
        join: [{ table: "t_policy_insured", relationA: "t_policy_insured.policy_id", relationB: "t_policy.id" }],
        where: {
          insured_id: item.id,
          "t_policy_insured.c_status": 4
        }
      }
    });
    item.policies = policies;
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
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$i
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "FOTO PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
function removeusingSet(arr) {
  let outputArray = Array.from(new Set(arr));
  return outputArray;
}
router$m.post("/merge", async function(req, res, next) {
  try {
    const data2 = removeusingSet(req.body.data);
    const user = res.locals.user;
    let item = await getRowById({
      id: data2[0],
      table: table$i,
      user
    });
    let policies = [];
    for (let i = 1; i < data2.length; i++) {
      const d = data2[i];
      let newItem = await getRowById({
        id: d,
        table: table$i,
        user
      });
      if (item.ident_no) {
        item.ident_no = item.ident_no.replace(/\D/g, "");
      }
      if (newItem.ident_no) {
        newItem.ident_no = newItem.ident_no.replace(/\D/g, "");
      }
      await pool$1.query(
        `UPDATE t_event SET insured_id=? WHERE insured_id=?`,
        [item.id, d]
      );
      await pool$1.query(
        `UPDATE t_policy SET insured_id=?, insured_description=? WHERE insured_id=?`,
        [item.id, item.fullname, d]
      );
      await update({
        user,
        id: d,
        table: "t_insured",
        data: {
          c_status: 1
        }
      });
    }
    const { items: _policies } = await getRows({
      user,
      table: "t_policy",
      query: {
        where: {
          insured_id: item.id,
          c_status: 4
        }
      }
    });
    item.policies = _policies;
    for (let i = 0; i < _policies.length; i++) {
      const item2 = _policies[i];
      policies.push({
        policy_id: String(item2.id),
        policy_number: String(item2.policy_number),
        insured_code: String(item2.insured_code),
        insurance_id: String(item2.insurance_id),
        insurance: String(item2.insurance)
      });
      await update({
        authenticate: 0,
        user,
        id: item2.id,
        table: "t_insured",
        data: {
          policies
        }
      });
    }
    req.io.emit("update", {
      table: table$i,
      item: data2,
      id: response.id
    });
    res.status(200).json(true);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
router$m.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    data2.code = await getCode({ table: table$i });
    if (data2.firstname && data2.lastname) {
      data2.fullname = `${data2.firstname} ${data2.lastname}`.trim();
    }
    if (data2.ident_no) {
      const exist = await checkIfinsuredExist(user, data2);
      if (exist) {
        throw new BaseError(
          "NOT FOUND",
          404,
          true,
          `User with ident: ${data2.ident_no} exist.`,
          `El asegurado con cédula ${data2.ident_no} ya existe`
        );
      }
    }
    const response2 = await insert({
      user,
      table: table$i,
      data: data2
    });
    await insertPolicyDependant(user, response2.id, data2);
    req.io.emit("update", {
      table: table$i,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$i}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$m.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.firstname && data2.lastname) {
      data2.fullname = `${data2.firstname} ${data2.lastname}`.trim();
    }
    if (data2.relations) {
      for (let i = 0; i < data2.relations.length; i++) {
        const relation = data2.relations[i];
        if (relation.$relationship_id) {
          const cat_desc = await getCategoryDescriptionById(relation.$relationship_id);
          if (cat_desc) {
            const rel = getInverseRelationship(cat_desc, data2.$sex_id);
            const [cat_rel] = await pool$1.query(`SELECT * FROM t_category WHERE description=? AND parent_id=? AND c_status=4`, [rel, 151]);
            if (cat_rel) {
              const [insured] = await pool$1.query(`SELECT * FROM t_insured WHERE id=? AND c_status=4`, [relation.id]);
              if (insured) {
                const dat_rel = {
                  id: String(req.params.id),
                  description: data2.fullname,
                  $relationship_id: String(cat_rel.id),
                  relationship: rel
                };
                if (!insured.relations || !insured.relations.length) {
                  insured.relations = [dat_rel];
                } else {
                  insured.relations = JSON.parse(insured.relations);
                  const index = insured.relations.findIndex((i2) => req.params.id === i2.id);
                  if (index !== -1) {
                    insured.relations[index] = dat_rel;
                  } else {
                    insured.relations.push(dat_rel);
                  }
                }
                await pool$1.query(`UPDATE t_insured SET relations=? WHERE id=? AND c_status=4`, [JSON.stringify(insured.relations), insured.id]);
              }
            }
          }
        }
      }
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$i,
      data: data2
    });
    req.io.emit("update", {
      table: table$i,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$i}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$m.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$i,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$i
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$m.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$i,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            insured_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { insured_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$i
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$l = express.Router();
const table$h = "t_doctor";
router$l.use(isAuthenticated);
async function checkIfdoctorExist(user, data2) {
  if (data2.ident_no) {
    const { items, total, sql } = await getRows({
      table: table$h,
      user,
      query: {
        where: {
          ident_no: data2.ident_no,
          c_status: 4
        }
      }
    });
    if (items.length) {
      return true;
    }
    return false;
  }
}
router$l.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$h,
      user,
      query: req.query
    });
    console.log(sql);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.birthdate && isValidDate$1(item.birthdate)) {
        item.age = calculateReadableAge(item.birthdate);
        item.birthday = isBirthday(item.birthdate);
        item.birthdate = intlDate(item.birthdate);
      }
      if (item.speciality) {
        item.speciality = JSON.parse(item.speciality);
      } else {
        item.speciality = [];
      }
      if (item.provider) {
        item.provider = JSON.parse(item.provider);
      } else {
        item.provider = [];
      }
      if (item.postnominal) {
        item.postnominal = JSON.parse(item.postnominal);
      } else {
        item.postnominal = [];
      }
      if (item.social) {
        item.social = JSON.parse(item.social);
      } else {
        item.social = {};
      }
      if (item.language_ids) {
        item.language_ids = JSON.parse(item.language_ids);
        item.language = JSON.parse(item.language);
      }
      if (item.$attention_type_ids) {
        item.$attention_type_ids = JSON.parse(item.$attention_type_ids);
        item.attention_type = JSON.parse(item.attention_type);
      } else {
        item.$attention_type_ids = [];
        item.attention_type = [];
      }
      item.record_format = separatedByComma(item.code, item.age);
      item.location_format = separatedByComma(item.country, item.state, item.city);
      item.description = item.description.toUpperCase();
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$l.get("/exist", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.query;
    const exist = await checkIfdoctorExist(user, data2);
    if (exist) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with ident: ${data2.ident_no} exist.`,
        `El asegurado con cédula ${data2.ident_no} ya existe`
      );
    } else {
      return res.json(false);
    }
  } catch (error) {
    next(error);
  }
});
router$l.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$h,
      user
    });
    if (item.birthdate && isValidDate$1(item.birthdate)) {
      item.age = calculateReadableAge(item.birthdate);
      item.birthday = isBirthday(item.birthdate);
      item.birthdate = intlDate(item.birthdate);
    }
    if (item.$attention_type_ids) {
      item.$attention_type_ids = JSON.parse(item.$attention_type_ids).map(Number);
      item.attention_type = JSON.parse(item.attention_type);
    } else {
      item.$attention_type_ids = [];
      item.attention_type = [];
    }
    if (item.speciality) {
      item.speciality = JSON.parse(item.speciality);
    } else {
      item.speciality = [];
    }
    if (item.social) {
      item.social = JSON.parse(item.social);
    } else {
      item.social = {};
    }
    if (item.language_ids) {
      item.language_ids = JSON.parse(item.language_ids);
      item.language = JSON.parse(item.language);
    }
    if (item.$postnominal_ids) {
      item.$postnominal_ids = JSON.parse(item.$postnominal_ids).map(Number);
      item.postnominal = JSON.parse(item.postnominal);
    } else {
      item.$postnominal_ids = [];
      item.postnominal = [];
    }
    if (item.provider) {
      item.provider = JSON.parse(item.provider);
    } else {
      item.provider = [];
    }
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$h
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "FOTO PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$l.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    data2.code = await getCode({ table: table$h });
    data2.description = `${data2.firstname} ${data2.lastname}`.trim();
    if (data2.ident_no) {
      const exist = await checkIfdoctorExist(user, data2);
      if (exist) {
        throw new BaseError(
          "NOT FOUND",
          404,
          true,
          `User with ident: ${data2.ident_no} exist.`,
          `El asegurado con cédula ${data2.ident_no} ya existe`
        );
      }
    }
    const response2 = await insert({
      user,
      table: table$h,
      data: data2
    });
    req.io.emit("update", {
      table: table$h,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$h}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$l.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.firstname && data2.lastname) {
      data2.description = `${data2.firstname} ${data2.lastname}`.trim();
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$h,
      data: data2
    });
    req.io.emit("update", {
      table: table$h,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$h}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$l.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$h,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$h
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$l.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$h,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$h
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$k = express.Router();
const table$g = "t_policy";
router$k.use(isAuthenticated);
router$k.get("/stats", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, sql } = await getRows({
      table: table$g,
      user,
      query: req.query
    });
    const days = getDaysInMonth(/* @__PURE__ */ new Date());
    const days_array = Array.apply(null, { length: days }).map((i, index) => index + 1).map((i) => {
      const day = format(setDate(/* @__PURE__ */ new Date(), i), "dd-MM-yyyy");
      return day;
    }).reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {});
    let stats = {
      quantity: 0,
      sex: {
        men: 0,
        women: 0
      },
      ages_range: {
        "0/10": [],
        "10/20": [],
        "20/30": [],
        "30/40": [],
        "40/50": [],
        "50/70": [],
        "70/+": []
      },
      eventType: {},
      insurance: {},
      customerList: {},
      amountList: []
    };
    items.forEach((item) => {
      if (item.$sex_id === 5) {
        stats.sex.men++;
      }
      if (item.$sex_id === 6) {
        stats.sex.women++;
      }
      if (item.birthdate) {
        let age = calculateAge(item.birthdate);
        if (age) {
          switch (true) {
            case (age > 0 && age <= 10):
              stats.ages_range["0/10"].push(age);
              break;
            case (age > 10 && age <= 20):
              stats.ages_range["10/20"].push(age);
              break;
            case (age > 20 && age <= 30):
              stats.ages_range["20/30"].push(age);
              break;
            case (age > 30 && age <= 40):
              stats.ages_range["30/40"].push(age);
              break;
            case (age > 40 && age <= 50):
              stats.ages_range["40/50"].push(age);
              break;
            case (age > 50 && age <= 70):
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
        label: curr
      });
      return acc;
    }, []);
    stats.eventTypeList = Object.keys(stats.eventType).reduce((acc, curr) => {
      acc.push({
        value: stats.eventType[curr],
        label: curr
      });
      return acc;
    }, []);
    stats.customerList = Object.keys(
      sortObjectByValue(stats.customerList)
    ).reduce((acc, curr) => {
      acc.push({
        value: stats.customerList[curr],
        label: curr
      });
      return acc;
    }, []);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});
router$k.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$g,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.birthdate && isValidDate$1(item.birthdate)) {
        item.age = calculateReadableAge(item.birthdate);
        item.birthday = isBirthday(item.birthdate);
        item.birthdate = intlDate(item.birthdate);
      }
      if (item.validity_date_start && isValidDate$1(item.validity_date_start)) {
        item.validity_date_start = intlDate(item.validity_date_start);
      }
      if (item.validity_date_end && isValidDate$1(item.validity_date_end)) {
        item.validity_date_end = intlDate(item.validity_date_end);
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
      item.record_format = separatedByComma(item.code, item.age);
      item.location_format = separatedByComma(item.country, item.state, item.city);
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$k.get("/insured", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: "t_policy_insured",
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$k.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$g,
      user
    });
    if (item.validity_date_start && isValidDate$1(item.validity_date_start)) {
      item.validity_date_start = intlDate(item.validity_date_start);
    }
    if (item.validity_date_end && isValidDate$1(item.validity_date_end)) {
      item.validity_date_end = intlDate(item.validity_date_end);
    }
    if (item.renewal_date && isValidDate$1(item.renewal_date)) {
      item.renewal_date = intlDate(item.renewal_date);
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
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$g
    });
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$k.get("/insured/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: "t_policy_insured",
      user
    });
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$k.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.code = await getCode({ table: table$g });
    if (data2.validity_date_start) {
      data2.validity_date_start = mysqlDateTime(
        convertToValidDate(data2.validity_date_start)
      );
    } else {
      data2.validity_date_start = null;
    }
    if (data2.validity_date_end) {
      data2.validity_date_end = mysqlDateTime(
        convertToValidDate(data2.validity_date_end)
      );
    } else {
      data2.validity_date_end = null;
    }
    if (data2.deductible) {
      data2.deductible = cleanCurrency(data2.deductible);
    }
    const response2 = await insert({
      user,
      table: table$g,
      data: data2
    });
    req.io.emit("update", {
      table: table$g,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$g}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$k.post("/insured", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: "t_policy_insured",
      data: data2
    });
    const insured = await getRowById({
      id: data2.insured_id,
      table: "t_insured",
      user
    });
    if (insured) {
      if (insured.policies) {
        insured.policies = JSON.parse(insured.policies);
      } else {
        insured.policies = [];
      }
      const policy = await getRowById({
        id: data2.policy_id,
        user,
        table: "t_policy"
      });
      insured.policies.push(
        {
          "policy_id": String(data2.policy_id),
          "policy_number": String(policy.policy_number),
          "insured_code": data2.insured_code,
          "insurance_id": String(policy.insurance_id),
          "insurance": policy.insurance
        }
      );
      await pool$1.query(`UPDATE t_insured SET policies=? WHERE id=?`, [JSON.stringify(insured.policies), insured.id]);
    }
    req.io.emit("update", {
      table: table$g,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$g}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$k.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.validity_date_start) {
      data2.validity_date_start = mysqlDateTime(
        convertToValidDate(data2.validity_date_start)
      );
    } else {
      data2.validity_date_start = null;
    }
    if (data2.validity_date_end) {
      data2.validity_date_end = mysqlDateTime(
        convertToValidDate(data2.validity_date_end)
      );
    } else {
      data2.validity_date_end = null;
    }
    if (data2.deductible) {
      data2.deductible = cleanCurrency(data2.deductible);
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$g,
      data: data2
    });
    req.io.emit("update", {
      table: table$g,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$g}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$k.put("/insured/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await update({
      id: req.params.id,
      user,
      table: "t_policy_insured",
      data: data2
    });
    const insured = await getRowById({
      id: data2.insured_id,
      table: "t_insured",
      user
    });
    if (insured) {
      if (insured.policies) {
        insured.policies = JSON.parse(insured.policies);
        const index = insured.policies.findIndex((i) => {
          return i.policy_id == data2.policy_id;
        });
        const policy = await getRowById({
          id: data2.policy_id,
          user,
          table: "t_policy"
        });
        insured.policies[index] = {
          "policy_id": String(data2.policy_id),
          "policy_number": String(policy.policy_number),
          "insured_code": data2.insured_code,
          "insurance_id": String(policy.insurance_id),
          "insurance": policy.insurance
        };
      }
      await pool$1.query(`UPDATE t_insured SET policies=? WHERE id=?`, [JSON.stringify(insured.policies), insured.id]);
    }
    req.io.emit("update", {
      table: table$g,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$g}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$k.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$g,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$g
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$k.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$g,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$g
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$j = express.Router();
const table$f = "t_provider";
router$j.use(isAuthenticated);
router$j.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$f,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$j.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$f,
      user
    });
    if (item.birthdate && isValidDate$1(item.birthdate)) {
      item.age = calculateReadableAge(item.birthdate);
      item.birthday = isBirthday(item.birthdate);
      item.birthdate = intlDate(item.birthdate);
    }
    if (item.insurances) {
      item.insurances = JSON.parse(item.insurances);
    } else {
      item.insurances = [];
    }
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$f
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "FOTO PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$j.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    data2.code = await getCode({ table: table$f });
    const response2 = await insert({
      user,
      table: table$f,
      data: data2
    });
    req.io.emit("update", {
      table: table$f,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$f}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$j.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.last_event) {
      data2.last_event = mysqlDateTime(new Date(data2.last_event));
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$f,
      data: data2
    });
    req.io.emit("update", {
      table: table$f,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$f}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$j.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$f,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$f
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$j.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$f,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$f
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$i = express.Router();
const table$e = "t_contact";
router$i.use(isAuthenticated);
async function checkIfcontactExist(user, data2) {
  if (data2.ident_no) {
    const { items, total, sql } = await getRows({
      table: table$e,
      user,
      query: {
        where: {
          ident_no: data2.ident_no,
          c_status: 4
        }
      }
    });
    if (items.length) {
      return true;
    }
    return false;
  }
}
router$i.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$e,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.birthdate && isValidDate$1(item.birthdate)) {
        item.age = calculateReadableAge(item.birthdate);
        item.birthday = isBirthday(item.birthdate);
        item.birthdate = intlDate(item.birthdate);
      }
      if (item.speciality) {
        item.speciality = JSON.parse(item.speciality);
      } else {
        item.speciality = [];
      }
      if (item.provider) {
        item.provider = JSON.parse(item.provider);
      } else {
        item.provider = [];
      }
      if (item.postnominal) {
        item.postnominal = JSON.parse(item.postnominal);
      } else {
        item.postnominal = [];
      }
      if (item.$attention_type_ids) {
        item.$attention_type_ids = JSON.parse(item.$attention_type_ids);
        item.attention_type = JSON.parse(item.attention_type);
      } else {
        item.$attention_type_ids = [];
        item.attention_type = [];
      }
      item.record_format = separatedByComma(item.code, item.age);
      item.location_format = separatedByComma(item.country, item.state, item.city);
      item.description = item.description.toUpperCase();
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$i.get("/exist", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.query;
    const exist = await checkIfcontactExist(user, data2);
    if (exist) {
      throw new BaseError(
        "NOT FOUND",
        404,
        true,
        `User with ident: ${data2.ident_no} exist.`,
        `El asegurado con cédula ${data2.ident_no} ya existe`
      );
    } else {
      return res.json(false);
    }
  } catch (error) {
    next(error);
  }
});
router$i.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$e,
      user
    });
    if (item.birthdate && isValidDate$1(item.birthdate)) {
      item.age = calculateReadableAge(item.birthdate);
      item.birthday = isBirthday(item.birthdate);
      item.birthdate = intlDate(item.birthdate);
    }
    if (item.$attention_type_ids) {
      item.$attention_type_ids = JSON.parse(item.$attention_type_ids).map(Number);
      item.attention_type = JSON.parse(item.attention_type);
    } else {
      item.$attention_type_ids = [];
      item.attention_type = [];
    }
    if (item.speciality) {
      item.speciality = JSON.parse(item.speciality);
    } else {
      item.speciality = [];
    }
    if (item.$postnominal_ids) {
      item.$postnominal_ids = JSON.parse(item.$postnominal_ids).map(Number);
      item.postnominal = JSON.parse(item.postnominal);
    } else {
      item.$postnominal_ids = [];
      item.postnominal = [];
    }
    if (item.provider) {
      item.provider = JSON.parse(item.provider);
    } else {
      item.provider = [];
    }
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$e
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$i.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    data2.code = await getCode({ table: table$e });
    data2.description = `${data2.firstname} ${data2.lastname}`.trim();
    if (data2.ident_no) {
      const exist = await checkIfcontactExist(user, data2);
      if (exist) {
        throw new BaseError(
          "NOT FOUND",
          404,
          true,
          `User with ident: ${data2.ident_no} exist.`,
          `El asegurado con cédula ${data2.ident_no} ya existe`
        );
      }
    }
    const response2 = await insert({
      user,
      table: table$e,
      data: data2
    });
    req.io.emit("update", {
      table: table$e,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$e}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$i.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    data2.description = `${data2.firstname} ${data2.lastname}`.trim();
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$e,
      data: data2
    });
    req.io.emit("update", {
      table: table$e,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$e}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$i.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$e,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$e
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$i.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$e,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$e
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$h = express.Router();
const table$d = "t_book";
router$h.use(isAuthenticated);
router$h.get("/pdf/:code", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const { items: books } = await getRows({
      table: table$d,
      user,
      query: {
        where: {
          code: req.params.code,
          c_status: 4
        }
      }
    });
    const item = books[0];
    const items = books.filter((i) => i.$book_type_id === 98);
    const payments = books.filter((i) => i.$book_type_id === 354);
    item.book_date_format = format(new Date(item.book_date), "dd-MM-yyyy");
    item.sequence = String(item.code).substring(1);
    item.day = format(item.book_date, "dd");
    item.year = format(item.created, "yyyy");
    for (let i = 0; i < payments.length; i++) {
      const item2 = payments[i];
      if (item2.insurance_payment) {
        item2.insurance_payment_format = currency(item2.insurance_payment, item2.currency);
      }
      if (item2.insurance_responsability) {
        item2.insurance_responsability_format = currency(item2.insurance_responsability, item2.currency);
      }
      item2.book_date_format = intlDate(item2.book_date);
    }
    if (item.billed_amount_total) {
      item.billed_amount_total_format = currency(item.billed_amount_total, item.currency);
    }
    if (item.coverage_total) {
      item.coverage_total_format = currency(item.coverage_total, item.currency);
    }
    if (item.discount_total) {
      item.discount_total_format = currency(item.discount_total, item.currency);
    }
    if (item.deductible_total) {
      item.deductible_total_format = currency(item.deductible_total, item.currency);
    }
    if (item.copago_total) {
      item.copago_total_format = currency(item.copago_total, item.currency);
    }
    if (item.covered_total) {
      item.covered_total_format = currency(item.covered_total, item.currency);
    }
    if (item.insurance_payment_total) {
      item.insurance_payment_total_format = currency(item.insurance_payment_total, item.currency);
    }
    if (item.insurance_responsability_total) {
      item.insurance_responsability_total_format = currency(item.insurance_responsability_total, item.currency);
    }
    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis);
    }
    if (item.notes) {
      item.notes = JSON.parse(item.notes);
    }
    const filename = `${item.code}-${item.book_date_format}`;
    const { docDefinition } = await generateConciliation({
      item,
      items,
      payments,
      account,
      user
    });
    const pdfUrl = await generatePDFWithPdfmake({
      account,
      table: "t_book",
      id: item.id,
      filename,
      docDefinition
    });
    const images = [];
    const pdfs = [filePath(pdfUrl)];
    const files = await getFiles({ ref_key: "t_book", ref_id: item.id });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "image") {
        const filePath$1 = filePath(file.url);
        images.push(filePath$1);
      }
      if (file.icon === "pdf") {
        const filePath$1 = filePath(file.url);
        pdfs.push(filePath$1);
      }
    }
    const newpdf = await imageToPDF(images);
    const buf = await mergePDF([...pdfs, ...newpdf]);
    await replaceFile(pdfs[0], buf);
    return res.status(200).json(pdfUrl);
  } catch (error) {
    next(error);
  }
});
router$h.get("/pdf2/:code", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const { items: books } = await getRows({
      table: table$d,
      user,
      query: {
        where: {
          code: req.params.code,
          c_status: 4
        }
      }
    });
    const item = books[0];
    const items = books.filter((i) => i.$book_type_id === 98);
    const payments = books.filter((i) => i.$book_type_id === 354);
    item.book_date_format = format(new Date(item.book_date), "dd-MM-yyyy");
    item.sequence = String(item.code).substring(1);
    item.day = format(item.book_date, "dd");
    item.year = format(item.created, "yyyy");
    item.images = {
      logoText: convertImagetoBase64("logoText.png")
    };
    for (let i = 0; i < items.length; i++) {
      const item2 = items[i];
      if (item2.billed_amount_total) {
        item2.billed_amount_format = currency(item2.billed_amount, item2.currency);
      }
      if (item2.coverage) {
        item2.coverage_format = currency(item2.coverage, item2.currency);
      }
      if (item2.discount) {
        item2.discount_format = currency(item2.discount, item2.currency);
      }
      if (item2.deductible) {
        item2.deductible_format = currency(item2.deductible, item2.currency);
      }
      if (item2.copago) {
        item2.copago_format = currency(item2.copago, item2.currency);
      }
      if (item2.covered) {
        item2.covered_format = currency(item2.covered, item2.currency);
      }
      if (item2.insurance_payment) {
        item2.insurance_payment_format = currency(item2.insurance_payment, item2.currency);
      }
      if (item2.insurance_responsability) {
        item2.insurance_responsability_format = currency(item2.insurance_responsability, item2.currency);
      }
      item2.book_date_format = intlDate(item2.book_date);
    }
    for (let i = 0; i < payments.length; i++) {
      const item2 = payments[i];
      if (item2.insurance_payment) {
        item2.insurance_payment_format = currency(item2.insurance_payment, item2.currency);
      }
      if (item2.insurance_responsability) {
        item2.insurance_responsability_format = currency(item2.insurance_responsability, item2.currency);
      }
      item2.book_date_format = intlDate(item2.book_date);
    }
    if (item.billed_amount_total) {
      item.billed_amount_total_format = currency(item.billed_amount_total, item.currency);
    }
    if (item.coverage_total) {
      item.coverage_total_format = currency(item.coverage_total, item.currency);
    }
    if (item.discount_total) {
      item.discount_total_format = currency(item.discount_total, item.currency);
    }
    if (item.deductible_total) {
      item.deductible_total_format = currency(item.deductible_total, item.currency);
    }
    if (item.copago_total) {
      item.copago_total_format = currency(item.copago_total, item.currency);
    }
    if (item.covered_total) {
      item.covered_total_format = currency(item.covered_total, item.currency);
    }
    if (item.insurance_payment_total) {
      item.insurance_payment_total_format = currency(item.insurance_payment_total, item.currency);
    }
    if (item.insurance_responsability_total) {
      item.insurance_responsability_total_format = currency(item.insurance_responsability_total, item.currency);
    }
    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis);
    }
    if (item.notes) {
      item.notes = JSON.parse(item.notes);
    }
    const bodyTemplate = await getBody({
      table: "conciliation",
      account,
      data: {
        item,
        items,
        payments
      }
    });
    item.filename = `${item.code}-${item.book_date_format}`;
    const filename = await generatePDF({
      account,
      data: item,
      table: "conciliation",
      id: req.params.id,
      filename: item.filename,
      landscape: true,
      bodyTemplate,
      header: false,
      footer: false,
      margin: {
        top: "0",
        bottom: "0",
        right: "0",
        left: "0"
      }
    });
    const images = [];
    const pdfs = [filePath(filename)];
    const files = await getFiles({ ref_key: "t_book", ref_id: item.id });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "image") {
        const filePath$1 = filePath(file.url);
        images.push(filePath$1);
      }
      if (file.icon === "pdf") {
        const filePath$1 = filePath(file.url);
        pdfs.push(filePath$1);
      }
    }
    const newpdf = await imageToPDF(images);
    const buf = await mergePDF([...pdfs, ...newpdf]);
    await replaceFile(pdfs[0], buf);
    return res.status(200).json(filename);
  } catch (error) {
    next(error);
  }
});
router$h.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    console.log(req.query);
    let columns = null;
    if (req.query.groupBy.includes("t_book.code")) {
      columns = [
        "GROUP_CONCAT(DISTINCT item_description SEPARATOR '|') AS label, min(id) AS id"
      ];
    }
    let { items, total, sql } = await getRows({
      table: table$d,
      user,
      query: req.query,
      optsServer: {
        columns
      }
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.billed_amount_total) {
        item.billed_amount_total_format = currency(item.billed_amount_total, item.currency);
      }
      if (item.coverage_total) {
        item.coverage_total_format = currency(item.coverage_total, item.currency);
      }
      if (item.discount_total) {
        item.discount_total_format = currency(item.discount_total, item.currency);
      }
      if (item.deductible_total) {
        item.deductible_total_format = currency(item.deductible_total, item.currency);
      }
      if (item.covered_total) {
        item.covered_total_format = currency(item.covered_total, item.currency);
      }
      if (item.insurance_payment_total) {
        item.insurance_payment_total_format = currency(item.insurance_payment_total, item.currency);
      }
      if (item.insurance_responsability_total) {
        item.insurance_responsability_total_format = currency(item.insurance_responsability_total, item.currency);
      }
      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis);
      } else {
        item.diagnosis = [];
      }
      if (item.notes) {
        item.notes = JSON.parse(item.notes);
      } else {
        item.notes = [];
      }
      item.book_date_format = intlDate(item.book_date);
      item.created_format = intlDateTime(item.created);
      items[i] = item;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$h.get("/:code", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const { items: books } = await getRows({
      table: "t_book",
      user,
      query: {
        where: {
          "bi:c_status": 4,
          code: req.params.code
        }
      }
    });
    const item = books[0];
    const items = books.filter((i) => i.$book_type_id === 98);
    const payments = books.filter((i) => i.$book_type_id === 354);
    if (item.diagnosis) {
      item.diagnosis = JSON.parse(item.diagnosis);
    } else {
      item.diagnosis = [];
    }
    if (item.notes) {
      item.notes = JSON.parse(item.notes);
    } else {
      item.notes = [];
    }
    item.created_format = intlDateTime(item.created);
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    for (let i = 0; i < items.length; i++) {
      const item2 = items[i];
      if (item2.book_date && isValidDate$1(item2.book_date)) {
        item2.book_date = intlDate(item2.book_date);
      }
      items[i] = item2;
    }
    for (let i = 0; i < payments.length; i++) {
      const item2 = payments[i];
      if (item2.book_date && isValidDate$1(item2.book_date)) {
        item2.book_date = intlDate(item2.book_date);
      }
      payments[i] = item2;
    }
    return res.status(200).json({ item, items, payments });
  } catch (error) {
    next(error);
  }
});
router$h.post("/", async function(req, res, next) {
  try {
    let response2;
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    data2.book.code = await getCode({ table: table$d });
    let first = true;
    for (let i = 0; i < data2.book_items.length; i++) {
      const item = data2.book_items[i];
      item.billed_amount = cleanCurrency(item.billed_amount);
      item.coverage = cleanCurrency(item.coverage);
      item.deductible = cleanCurrency(item.deductible);
      item.copago = cleanCurrency(item.copago);
      item.covered = cleanCurrency(item.covered);
      item.discount = cleanCurrency(item.discount);
      item.insurance_payment = cleanCurrency(item.insurance_payment);
      item.insurance_responsability = cleanCurrency(item.insurance_responsability);
      item.insurance_payment = cleanCurrency(item.insurance_payment);
      if (item.book_date) {
        item.book_date_valid = convertToValidDate(item.book_date);
        item.book_date = mysqlDateTime(
          addCurrentTimeToDate(item.book_date_valid)
        );
      }
      response2 = await insert({
        user,
        table: "t_book",
        data: {
          ...data2.book,
          item_id: item.item_id,
          item_code: item.item_code,
          item_description: item.item_description,
          doctor_id: item.doctor_id,
          doctor_description: item.doctor_description,
          billed_amount: item.billed_amount,
          coverage: item.coverage,
          deductible: item.deductible,
          copago: item.copago,
          covered: item.covered,
          insurance_payment: item.insurance_payment,
          insurance_responsability: item.insurance_responsability,
          discount: item.discount,
          discount_percent: item.discount_percent,
          insurance_claim: item.insurance_claim,
          note: item.note,
          $book_type_id: 98,
          book_date: item.book_date,
          provider_id: item.provider_id,
          provider_description: item.provider_description
        }
      });
      first = false;
    }
    for (let i = 0; i < data2.book_payments.length; i++) {
      const item = data2.book_payments[i];
      if (!(item.note && item.insurance_payment && item.insurance_responsability)) {
        continue;
      }
      item.insurance_responsability = cleanCurrency(item.insurance_responsability);
      item.insurance_payment = cleanCurrency(item.insurance_payment);
      if (item.book_date) {
        item.book_date_valid = convertToValidDate(item.book_date);
        item.book_date = mysqlDateTime(
          addCurrentTimeToDate(item.book_date_valid)
        );
      }
      const objPayment = {
        ...data2.book,
        insurance_payment: item.insurance_payment,
        insurance_responsability: item.insurance_responsability,
        book_date: item.book_date,
        note: item.note,
        description: item.description,
        c_status: item.c_status,
        $book_type_id: 354
      };
      await insert({
        user,
        table: "t_book",
        data: objPayment
      });
    }
    req.io.emit("update", {
      table: table$d
    });
    if (response2) {
      return res.status(200).json({ ...response2, code: data2.book.code });
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$d}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$h.put("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    let response2;
    for (let i = 0; i < data2.book_items.length; i++) {
      const item = data2.book_items[i];
      item.billed_amount = cleanCurrency(item.billed_amount);
      item.coverage = cleanCurrency(item.coverage);
      item.deductible = cleanCurrency(item.deductible);
      item.copago = cleanCurrency(item.copago);
      item.covered = cleanCurrency(item.covered);
      item.discount = cleanCurrency(item.discount);
      item.insurance_payment = cleanCurrency(item.insurance_payment);
      item.insurance_responsability = cleanCurrency(item.insurance_responsability);
      item.insurance_payment = cleanCurrency(item.insurance_payment);
      if (item.book_date) {
        item.book_date_valid = convertToValidDate(item.book_date);
        item.book_date = mysqlDateTime(
          addCurrentTimeToDate(item.book_date_valid)
        );
      }
      const objItem = {
        ...data2.book,
        item_id: item.item_id,
        item_code: item.item_code,
        item_description: item.item_description,
        doctor_id: item.doctor_id,
        doctor_description: item.doctor_description,
        billed_amount: item.billed_amount,
        coverage: item.coverage,
        deductible: item.deductible,
        copago: item.copago,
        covered: item.covered,
        insurance_payment: item.insurance_payment,
        insurance_responsability: item.insurance_responsability,
        discount: item.discount,
        discount_percent: item.discount_percent,
        insurance_claim: item.insurance_claim,
        note: item.note,
        $book_type_id: 98,
        book_date: item.book_date,
        provider_id: item.provider_id,
        provider_description: item.provider_description
      };
      if (item.id) {
        response2 = await update({
          id: item.id,
          user,
          table: "t_book",
          data: objItem
        });
      } else {
        response2 = await insert({
          user,
          table: "t_book",
          data: objItem
        });
      }
    }
    for (let i = 0; i < data2.book_payments.length; i++) {
      const item = data2.book_payments[i];
      if (!(item.note && item.insurance_payment && item.insurance_responsability)) {
        continue;
      }
      item.insurance_responsability = cleanCurrency(item.insurance_responsability);
      item.insurance_payment = cleanCurrency(item.insurance_payment);
      if (item.book_date) {
        item.book_date_valid = convertToValidDate(item.book_date);
        item.book_date = mysqlDateTime(
          addCurrentTimeToDate(item.book_date_valid)
        );
      }
      const objPayment = {
        ...data2.book,
        insurance_payment: item.insurance_payment,
        insurance_responsability: item.insurance_responsability,
        book_date: item.book_date,
        note: item.note,
        description: item.description,
        c_status: item.c_status,
        $book_type_id: 354
      };
      if (isNaN(item.id)) {
        await insert({
          user,
          table: "t_book",
          data: objPayment
        });
      } else {
        await update({
          id: item.id,
          user,
          table: "t_book",
          data: objPayment
        });
      }
    }
    req.io.emit("update", {
      table: table$d
    });
    if (response2) {
      return res.status(200).json({ ...response2, code: data2.book.code });
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$d}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$h.delete("/:code", async function(req, res) {
  try {
    const user = res.locals.user;
    const response2 = await update({
      id: req.params.code,
      ref_key: "code",
      user,
      table: table$d,
      data: {
        c_status: 1
      }
    });
    req.io.emit("update", {
      table: table$d
    });
    const { items } = await getRows({
      table: table$d,
      user,
      query: {
        limit: 1,
        where: {
          code: req.params.code,
          c_status: 1,
          $book_type_id: 100
        }
      }
    });
    if (response2) {
      res.status(200).json({ response: response2 });
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$h.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$d,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$d
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const ICDCancerColors = [
  {
    "icd10": "C50",
    "desc": "Breast cancer",
    "color": "#FF69B4",
    "date": "2025-10-19",
    "note": ""
  },
  {
    "icd10": "C34",
    "desc": "Lung cancer",
    "color": "#B0C4DE",
    "date": "2025-11-17",
    "note": ""
  },
  {
    "icd10": "C61",
    "desc": "Prostate cancer",
    "color": "#1E90FF",
    "date": "2025-11-01",
    "note": "Movember start"
  },
  {
    "icd10": "C18",
    "desc": "Colorectal cancer",
    "color": "#000080",
    "date": "2025-03-31",
    "note": ""
  },
  {
    "icd10": "C22",
    "desc": "Liver cancer",
    "color": "#FFA500",
    "date": "2025-10-01",
    "note": "Month awareness"
  },
  {
    "icd10": "C91",
    "desc": "Leukemia",
    "color": "#FFD700",
    "date": "2025-09-01",
    "note": "Month awareness"
  },
  {
    "icd10": "C25",
    "desc": "Pancreatic cancer",
    "color": "#800080",
    "date": "2025-11-16",
    "note": ""
  },
  {
    "icd10": "C43",
    "desc": "Skin (Melanoma) cancer",
    "color": "#000000",
    "date": "2025-05-01",
    "note": "Month awareness"
  },
  {
    "icd10": "C64",
    "desc": "Kidney cancer",
    "color": "#66CDAA",
    "date": "2025-03-01",
    "note": "Month awareness"
  },
  {
    "icd10": "C53",
    "desc": "Cervical cancer",
    "color": "#00CED1",
    "date": "2025-01-17",
    "note": ""
  }
];
const router$g = express.Router();
const table$c = "t_ICD10";
router$g.use(isAuthenticated);
function getCancerCodeIndex(rowDataPacket) {
  const inputCode = rowDataPacket.code.split(".")[0];
  return ICDCancerColors.findIndex((cancer) => cancer.icd10 === inputCode);
}
router$g.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$c,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const index = getCancerCodeIndex(item);
      if (index !== -1) {
        item.cancer = ICDCancerColors[index];
      } else {
        item.cancer = false;
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
router$g.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$c,
      user
    });
    const index = getCancerCodeIndex(item);
    if (index !== -1) {
      item.cancer = ICDCancerColors[index];
    } else {
      item.cancer = false;
    }
    if (isValidDate$1(item.created)) {
      item.created_format = intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$g.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$c,
      data: data2
    });
    req.io.emit("update", {
      table: table$c,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$c}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$g.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$c,
      data: data2
    });
    req.io.emit("update", {
      table: table$c,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$c}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$g.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$c,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$c
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$g.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$c,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$c
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$f = express.Router();
const table$b = "t_log";
router$f.use(isAuthenticated);
router$f.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$b,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.data) {
        item.data = JSON.parse(item.data);
      }
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$f.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$b,
      user
    });
    if (item.data) {
      item.data = JSON.parse(item.data);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$f.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    data2.code = await getCode({ table: table$b });
    const response2 = await insert({
      user,
      table: table$b,
      data: data2
    });
    req.io.emit("update", {
      table: table$b,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$b}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$f.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.last_event) {
      data2.last_event = mysqlDateTime(new Date(data2.last_event));
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$b,
      data: data2
    });
    req.io.emit("update", {
      table: table$b,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$b}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$f.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$b,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$b
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$f.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$b,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$b
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$e = express.Router();
const table$a = "t_CPT";
router$e.use(isAuthenticated);
router$e.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total } = await getRows({
      table: table$a,
      user,
      query: req.query
    });
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$e.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$a,
      user
    });
    if (isValidDate$1(item.created)) {
      item.created_format = intlDateTime(item.created);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$e.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$a,
      data: data2
    });
    req.io.emit("update", {
      table: table$a,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$a}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$e.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    var response2 = await update({
      id: req.params.id,
      user,
      table: table$a,
      data: data2
    });
    req.io.emit("update", {
      table: table$a,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$a}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$e.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$a,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$a
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$e.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$a,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$a
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$d = express.Router();
const table$9 = "t_comment";
router$d.use(isAuthenticated);
router$d.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$9,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.data) {
        item.data = JSON.parse(item.data);
      }
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$d.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$9,
      user
    });
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$9
    });
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$d.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await insert({
      user,
      table: table$9,
      data: data2
    });
    req.io.emit("update", {
      table: table$9,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$9}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$d.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$9,
      data: data2
    });
    req.io.emit("update", {
      table: table$9,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$9}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$d.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$9,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$9
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$d.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$9,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$9
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$c = express.Router();
router$c.use(isAuthenticated);
router$c.get("/google-static-maps-api", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const query = req.query;
    const _url = await getFinalMapUrl(req.query.link_gps);
    const {
      placeName,
      lat,
      lng
    } = extractMapInfo(_url);
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(placeName)}&zoom=18&size=1280x720&maptype=roadmap&markers=color:red%7C${encodeURIComponent(placeName)}&key=${process.env.GOOGLE_MAP}`;
    console.log(1, url);
    const response2 = await axios({
      method: "get",
      url,
      responseType: "stream"
    });
    const buf = await crypto.randomBytes(16).toString("hex");
    const filename = `${buf}.jpg`;
    const filePath2 = path__default.join(path__default.resolve(), `/privated/uploads/${account.domain}/${req.query.ref_key}/${req.query.ref_id}/${filename}`);
    createFolders(uploadDir, [account.domain, query.ref_key, query.ref_id]);
    const publicPath$1 = publicPath({ account, table: query.ref_key, id: query.ref_id, filename });
    const writer = fs.createWriteStream(filePath2);
    response2.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    await insert({
      table: "t_file",
      user,
      data: {
        ref_key: query.ref_key,
        ref_id: query.ref_id,
        $file_type_id: 380,
        description: query.address,
        url: publicPath$1,
        type: "image"
      }
    });
    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});
router$c.get("/calendarific", async function(req, res, next) {
  try {
    const url = `https://calendarific.com/api/v2/holidays?&api_key=${process.env.CALENDARIFIC_API}&country=${req.query.country}&year=2025&type=national&language=es`;
    const response2 = await axios({
      method: "get",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    return res.status(200).json(response2.data.response.holidays);
  } catch (error) {
    next(error);
  }
});
router$c.get("/zippopotam", async function(req, res, next) {
  try {
    const url = `https://api.zippopotam.us/${req.query.country_code}/${req.query.zipcode}`;
    const response2 = await axios({
      method: "get",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    console.log(12, response2.data);
    return res.status(200).json(response2.data);
  } catch (error) {
    next(error);
  }
});
router$c.get("/geonames/timezoneJSON", async function(req, res, next) {
  try {
    console.log(req.query);
    const url = `http://api.geonames.org/timezoneJSON?lat=${req.query.lat}&lng=${req.query.lng}&username=enmanuelma`;
    const response2 = await axios({
      method: "get",
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    return res.status(200).json(response2.data);
  } catch (error) {
    next(error);
  }
});
const router$b = express.Router();
router$b.use(isAuthenticated);
router$b.post("/policy", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const body = req.body;
    insertPolicy(body, user);
    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});
router$b.post("/provider", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const body = req.body;
    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      item.code = await getCode({ table: "t_provider" });
      await insert({
        user,
        table: "t_provider",
        data: item
      });
    }
    req.io.emit("update", {
      table: "t_provider"
    });
    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});
router$b.post("/doctor", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const body = req.body;
    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      item.code = await getCode({ table: "t_doctor" });
      await insert({
        user,
        table: "t_doctor",
        data: item
      });
    }
    req.io.emit("update", {
      table: "t_doctor"
    });
    return res.status(200).json(true);
  } catch (error) {
    next(error);
  }
});
const router$a = express.Router();
const table$8 = "t_poll";
router$a.get("/web/:id", async function(req, res, next) {
  try {
    let items = await pool$1.query(
      `SELECT * FROM t_poll_question WHERE 1 AND c_status<>1 AND poll_id=?`,
      [req.params.id]
    );
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.answers = await pool$1.query(
        `SELECT *, description AS label FROM t_poll_answer WHERE 1 AND c_status<>1 AND poll_question_id=?`,
        [item.id]
      );
    }
    if (items) {
      res.status(200).json(items);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});
router$a.post("/web/:id", async function(req, res, next) {
  try {
    var response2;
    const data2 = req.body;
    const questions = req.body.questions;
    for (const key in questions) {
      if (Object.hasOwnProperty.call(questions, key)) {
        const question = questions[key];
        response2 = await insert({
          auth: 0,
          msgTitle: "Encuesta Enviada 🙌",
          msg: "¡Gracias por ayudarnos a mejorar!",
          table: "t_poll_result",
          data: {
            poll_id: data2.poll_id,
            poll_description: data2.poll_description,
            contact_id: data2.contact_id,
            contact_description: data2.contact_description,
            user_id: data2.user_id,
            user_description: data2.user_description,
            health_professional: data2.health_professional,
            product_ids: data2.product_ids,
            product: data2.product,
            event_id: data2.event_id,
            event_code: data2.event_code,
            event_start: format(
              new Date(data2.event_start),
              "yyyy-MM-dd HH:mm:ss"
            ),
            poll_question_id: key,
            poll_answer_id: question.answer_id,
            poll_answer_value: question.value,
            poll_answer_description: question.answer_description,
            poll_question_description: question.description,
            account_id: 1,
            result_date: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss")
          }
        });
      }
    }
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});
router$a.use(isAuthenticated);
router$a.get("/stats/:key/:id", async function(req, res, next) {
  try {
    let items = await pool$1.query(
      `SELECT poll_answer_value, poll_question_id, poll_question_description, poll_answer_description, poll_answer_id, COUNT(poll_answer_id)AS count FROM t_poll_result WHERE poll_id=1 AND ??=? GROUP BY poll_answer_id`,
      [req.params.key, req.params.id]
    );
    let questions = await pool$1.query(
      `SELECT id, description, $poll_type_id FROM t_poll_question WHERE poll_id=1`
    );
    let data2 = {};
    let average = items.reduce((total, curr) => {
      total[curr.poll_answer_value] = 0;
      return total;
    }, {});
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.$poll_type_id === 280) {
        data2[question.id] = {
          description: question.description,
          answers: {}
        };
        question.answers = await pool$1.query(
          `SELECT * FROM t_poll_answer WHERE 1 AND c_status<>1 AND poll_question_id=?`,
          [question.id]
        );
        data2[question.id].answers = question.answers.reduce((total, acc) => {
          total[acc.id] = {
            description: acc.description,
            count: 0
          };
          return total;
        }, {});
      }
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (data2[item.poll_question_id]) {
        if (data2[item.poll_question_id].answers[item.poll_answer_id]) {
          data2[item.poll_question_id].answers[item.poll_answer_id].count = item.count;
        }
        if (data2[item.poll_answer_value]) {
          average[item.poll_answer_value] += 1;
        }
      }
    }
    res.status(200).json({ list: data2, average });
  } catch (error) {
    next(error);
  }
});
router$a.get("/stats", async function(req, res, next) {
  try {
    let items = await pool$1.query(
      `SELECT poll_question_id, poll_question_description, poll_answer_description, poll_answer_id, COUNT(poll_answer_id)AS count FROM t_poll_result WHERE poll_id=1 GROUP BY poll_answer_id`
    );
    let questions = await pool$1.query(
      `SELECT id, description, $poll_type_id FROM t_poll_question WHERE poll_id=1`
    );
    let data2 = {};
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.$poll_type_id === 280) {
        data2[question.id] = {
          description: question.description,
          answers: {}
        };
        question.answers = await pool$1.query(
          `SELECT * FROM t_poll_answer WHERE 1 AND c_status<>1 AND poll_question_id=?`,
          [question.id]
        );
        data2[question.id].answers = question.answers.reduce((total, acc) => {
          total[acc.id] = {
            description: acc.description,
            count: 0
          };
          return total;
        }, {});
      }
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (data2[item.poll_question_id]) {
        if (data2[item.poll_question_id].answers[item.poll_answer_id]) {
          data2[item.poll_question_id].answers[item.poll_answer_id].count = item.count;
        }
      }
    }
    res.status(200).json(data2);
  } catch (error) {
    next(error);
  }
});
router$a.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    let { items, total, sql, sql_total, columns } = await getRows({
      table: table$8,
      user,
      account,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.created) {
        item.created_format = format(
          new Date(item.created),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      if (item.modified) {
        item.modified_format = format(
          new Date(item.modified),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      if (item.result_date) {
        item.result_date_format = format(/* @__PURE__ */ new Date(), "dd/MM/yyyy");
      }
      items[i] = item;
    }
    res.status(200).send({ items, total, sql, sql_total, columns });
  } catch (error) {
    next(error);
  }
});
router$a.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let item = await getRowById({
      id: req.params.id,
      table: table$8,
      user,
      query: req.query,
      extra: {
        withFiles: true
      }
    });
    if (item.created) {
      item.created_format = format(
        new Date(item.created),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item.modified) {
      item.modified_format = format(
        new Date(item.modified),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(401).send({ msg: "No esta autorizado" });
    }
  } catch (err) {
    next({
      ...err,
      msg: "Error en la busqueda, intentar mas tarde."
    });
  }
});
router$a.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await insert({
      msg: "Servicio Agregado Exitosamente",
      user,
      table: table$8,
      data: req.body
    });
    req.io.emit("poll", {
      type: 2,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});
router$a.put("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Servicio Actualizado Exitosamente",
      user,
      id: req.params.id,
      table: table$8,
      data: req.body
    });
    req.io.emit("poll", {
      type: 3,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    next(err);
  }
});
router$a.delete("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Servicio Borrado",
      user,
      id: req.params.id,
      table: table$8,
      data: {
        c_status: 1
      }
    });
    req.io.emit("poll", {
      type: 4,
      user_id: user.id
    });
    res.status(200).json(response2);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
router$a.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    let response2;
    const ids = req.body;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        msg: "Servicios borradas",
        user,
        id,
        table: table$8,
        data: { c_status: 1 }
      });
    }
    req.io.emit("poll", {
      type: 4,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$9 = express.Router();
const table$7 = "t_poll_answer";
router$9.use(isAuthenticated);
router$9.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    let { items, total, sql, sql_total, columns } = await getRows({
      table: table$7,
      user,
      account,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.created) {
        item.created_format = format(
          new Date(item.created),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      if (item.modified) {
        item.modified_format = format(
          new Date(item.modified),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      items[i] = item;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    res.status(200).send({ items, total });
  } catch (error) {
    next(error);
  }
});
router$9.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let item = await getRowById({
      id: req.params.id,
      table: table$7,
      user,
      query: req.query,
      extra: {
        withFiles: true
      }
    });
    if (item.created) {
      item.created_format = format(
        new Date(item.created),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item.modified) {
      item.modified_format = format(
        new Date(item.modified),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(401).send({ msg: "No esta autorizado" });
    }
  } catch (err) {
    next({
      ...err,
      msg: "Error en la busqueda, intentar mas tarde."
    });
  }
});
router$9.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const code = await getCode({
      user,
      table: table$7
    });
    var response2 = await insert({
      msg: "Pregunta Agregado Exitosamente",
      user,
      table: table$7,
      data: Object.assign(req.body, {
        code
      })
    });
    req.io.emit("poll", {
      type: 2,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});
router$9.put("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Pregunta Actualizado Exitosamente",
      user,
      id: req.params.id,
      table: table$7,
      data: req.body
    });
    req.io.emit("poll", {
      type: 3,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    next(err);
  }
});
router$9.delete("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Pregunta Borrado",
      user,
      id: req.params.id,
      table: table$7,
      data: {
        c_status: 1
      }
    });
    req.io.emit("poll", {
      type: 4,
      user_id: user.id
    });
    res.status(200).json(response2);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$8 = express.Router();
const table$6 = "t_poll_question";
router$8.use(isAuthenticated);
router$8.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    let { items, total, sql, sql_total, columns } = await getRows({
      table: table$6,
      user,
      account,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.created) {
        item.created_format = format(
          new Date(item.created),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      if (item.modified) {
        item.modified_format = format(
          new Date(item.modified),
          "dd/MM/yyyy hh:mm aa"
        );
      }
      items[i] = item;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    res.status(200).send({ items, total });
  } catch (error) {
    next(error);
  }
});
router$8.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let item = await getRowById({
      id: req.params.id,
      table: table$6,
      user,
      query: req.query,
      extra: {
        withFiles: true
      }
    });
    if (item.created) {
      item.created_format = format(
        new Date(item.created),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item.modified) {
      item.modified_format = format(
        new Date(item.modified),
        "dd/MM/yyyy hh:mm aa"
      );
    }
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(401).send({ msg: "No esta autorizado" });
    }
  } catch (err) {
    next({
      ...err,
      msg: "Error en la busqueda, intentar mas tarde."
    });
  }
});
router$8.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await insert({
      msg: "Pregunta Agregado Exitosamente",
      user,
      table: table$6,
      data: req.body
    });
    req.io.emit("poll", {
      type: 2,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});
router$8.put("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Pregunta Actualizado Exitosamente",
      user,
      id: req.params.id,
      table: table$6,
      data: req.body
    });
    req.io.emit("poll", {
      type: 3,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    next(err);
  }
});
router$8.delete("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Pregunta Borrado",
      user,
      id: req.params.id,
      table: table$6,
      data: {
        c_status: 1
      }
    });
    req.io.emit("poll", {
      type: 4,
      user_id: user.id
    });
    res.status(200).json(response2);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$7 = express.Router();
const table$5 = "t_poll_result";
router$7.use(isAuthenticated);
router$7.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    let { items, total, sql, sql_total, columns } = await getRows({
      table: table$5,
      user,
      account,
      query: req.query,
      columns: req.query.columns || ["*"]
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.product = JSON.parse(item.product);
      item.event_start_format = format(
        new Date(item.event_start),
        "dd/MM/yyyy"
      );
      if (item.result_date) {
        item.result_date_format = format(
          new Date(item.result_date),
          "dd/MM/yyyy hh:mm:ss"
        );
      }
      if (item.event_start) {
        item.event_start_format = format(
          new Date(item.event_start),
          "dd/MM/yyyy hh:mm:ss"
        );
      }
      items[i] = item;
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    res.status(200).send({ items, total });
  } catch (error) {
    next(error);
  }
});
router$7.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let item = await getRowById({
      id: req.params.id,
      table: table$5,
      user,
      query: req.query,
      extra: {
        withFiles: true
      }
    });
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(401).send({ msg: "No esta autorizado" });
    }
  } catch (err) {
    next({
      ...err,
      msg: "Error en la busqueda, intentar mas tarde."
    });
  }
});
router$7.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await insert({
      msg: "Pregunta Agregado Exitosamente",
      user,
      table: table$5,
      data: req.body
    });
    req.io.emit("poll", {
      type: 2,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos agregados" });
    }
  } catch (err) {
    next(err);
  }
});
router$7.put("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Pregunta Actualizado Exitosamente",
      user,
      id: req.params.id,
      table: table$5,
      data: req.body
    });
    req.io.emit("poll", {
      type: 3,
      user_id: user.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    next(err);
  }
});
router$7.delete("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    var response2 = await update({
      msg: "Pregunta Borrado",
      user,
      id: req.params.id,
      table: table$5,
      data: {
        c_status: 1
      }
    });
    req.io.emit("poll", {
      type: 4,
      user_id: user.id
    });
    res.status(200).json(response2);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$6 = express.Router();
const table$4 = "t_itinerary";
router$6.use(isAuthenticated);
router$6.get("/", async function(req, res, next) {
  var _a, _b;
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$4,
      user,
      query: req.query,
      optsServer: {
        columns: ((_b = (_a = req.query) == null ? void 0 : _a.join) == null ? void 0 : _b.length) ? `t_event.id AS id, t_event.code AS code` : ""
      }
    });
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.attendance_datetime && item.attendance_datetime !== "0000-00-00 00:00:00") {
        item.start = item.attendance_datetime;
        item.end = item.attendance_datetime;
        item.start_calendar = formatDateTime(item.attendance_datetime);
        item.attendance_date = intlDate(item.attendance_datetime);
        item.attendance_time = intlTime(item.attendance_datetime);
        item.attendance_time_format = extractAMPM(item.attendance_time);
        item.attendance_time = intlTimeClean(item.attendance_datetime);
        item.attendance_readable = intlReadbleDate(item.attendance_datetime);
        item.attendance_readabletime = intlReadbleDateTime(item.attendance_datetime);
      } else {
        item.attendance_datetime = null;
      }
      if (item.request_date) {
        item.request_date_format = intlDate(item.request_date);
      }
      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure);
      }
      if (item.diagnosis) {
        item.diagnosis = JSON.parse(item.diagnosis);
      }
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
      if (req.query.mergeRows) {
        const date = new Date(item.attendance_datetime).toISOString().slice(0, 10);
        const key = `${item.code}-${date}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }
      if (req.query.doctorDetail) {
        if (item.doctor_id) {
          item.doctor_profile_pic = await getProfilePic({ ref_key: "t_doctor", ref_id: item.doctor_id });
        }
      }
    }
    if (req.query.mergeRows) {
      return res.status(200).json(result);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$6.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$4,
      user
    });
    if (!item) {
      return res.status(200).json(false);
    }
    if (item.attendance_datetime && item.attendance_datetime !== "0000-00-00 00:00:00") {
      item.attendance_date = intlDate(item.attendance_datetime);
      item.attendance_time = intlTime(item.attendance_datetime);
      item.attendance_time_format = extractAMPM(item.attendance_time);
      item.attendance_time = intlTimeClean(item.attendance_datetime);
    } else {
      item.attendance_datetime = null;
    }
    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure);
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$6.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.code = await getCode({ table: table$4 });
    console.log(2, "post");
    if (data2.attendance_time) {
      data2.attendance_time = data2.attendance_time.replace(/\s?[ap]\.\sm\.$/, "").trim();
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `Es requerida la fecha en el itinerario.`,
        `Es requerida la fecha en el itinerario.`
      );
    }
    if (data2.attendance_date && data2.attendance_time) {
      data2.attendance_datetime = mergeDateAndTime(data2.attendance_date, data2.attendance_time, data2.attendance_time_format);
    } else {
      data2.attendance_datetime = null;
    }
    const response2 = await insert({
      user,
      table: table$4,
      data: data2,
      log: true
    });
    req.io.emit("update", {
      table: table$4,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$4}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$6.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    console.log(1, "put");
    if (data2.attendance_time) {
      data2.attendance_time = data2.attendance_time.replace(/\s?[ap]\.\sm\.$/, "").trim();
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `Es requerida la fecha en el itinerario.`,
        `Es requerida la fecha en el itinerario.`
      );
    }
    if (data2.attendance_date && data2.attendance_time) {
      data2.attendance_datetime = mergeDateAndTime(data2.attendance_date, data2.attendance_time, data2.attendance_time_format);
    } else {
      data2.attendance_datetime = null;
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$4,
      data: data2,
      log: true
    });
    req.io.emit("update", {
      table: table$4,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$4}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$6.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$4,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$4
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$6.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$4,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$4
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$5 = express.Router();
const table$3 = "t_prescription";
router$5.use(isAuthenticated);
router$5.get("/stats", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, sql } = await getRows({
      table: table$3,
      user,
      query: req.query
    });
    let stats = {
      sex: {
        men: 0,
        women: 0
      },
      treatmentList: [],
      mprocedureList: [],
      analyticList: [],
      recomendationList: []
    };
    items.forEach((item) => {
      item.created_format = format(new Date(item.created), "dd-MM-yyyy");
      if (item.$sex_id === 5) {
        stats.sex.men++;
      }
      if (item.$sex_id === 6) {
        stats.sex.women++;
      }
      if (item.treatment && item.treatment.length) {
        item.treatment = JSON.parse(item.treatment);
        if (item.treatment.length) {
          for (let i = 0; i < item.treatment.length; i++) {
            const row = item.treatment[i];
            if (row.description) {
              const index = stats.treatmentList.findIndex(
                (i2) => +i2.id === +row.id
              );
              if (index === -1) {
                stats.treatmentList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1
                });
              } else {
                ++stats.treatmentList[index].quantity;
              }
            }
          }
        }
      }
      if (item.mprocedure && item.mprocedure.length) {
        item.mprocedure = JSON.parse(item.mprocedure);
        if (item.mprocedure.length) {
          for (let i = 0; i < item.mprocedure.length; i++) {
            const row = item.mprocedure[i];
            if (row.description) {
              const index = stats.mprocedureList.findIndex(
                (i2) => +i2.id === +row.id
              );
              if (index === -1) {
                stats.mprocedureList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1
                });
              } else {
                ++stats.mprocedureList[index].quantity;
              }
            }
          }
        }
      }
      if (item.analytic && item.analytic.length) {
        item.analytic = JSON.parse(item.analytic);
        if (item.analytic.length) {
          for (let i = 0; i < item.analytic.length; i++) {
            const row = item.analytic[i];
            if (row.description) {
              const index = stats.analyticList.findIndex(
                (i2) => +i2.id === +row.id
              );
              if (index === -1) {
                stats.analyticList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1
                });
              } else {
                ++stats.analyticList[index].quantity;
              }
            }
          }
        }
      }
      if (item.recomendation && item.recomendation.length) {
        item.recomendation = JSON.parse(item.recomendation);
        if (item.recomendation.length) {
          for (let i = 0; i < item.recomendation.length; i++) {
            const row = item.recomendation[i];
            if (row.description) {
              const index = stats.recomendationList.findIndex(
                (i2) => +i2.id === +row.id
              );
              if (index === -1) {
                stats.recomendationList.push({
                  id: row.id,
                  description: row.description,
                  quantity: 1
                });
              } else {
                ++stats.recomendationList[index].quantity;
              }
            }
          }
        }
      }
    });
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});
router$5.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$3,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.prescription_date && isValidDate$1(item.prescription_date)) {
        item.prescription_date_format = intlDateTime(
          item.prescription_date
        );
        if (item.modified) {
          item.modified_format = intlDateTime(item.modified);
        }
        item.created_format = intlDateTime(item.created);
      }
      if (item.treatment) {
        item.treatment = JSON.parse(item.treatment);
      } else {
        item.treatment = [];
      }
      if (item.recomendation) {
        item.recomendation = JSON.parse(item.recomendation);
      } else {
        item.recomendation = [];
      }
      if (item.mprocedure) {
        item.mprocedure = JSON.parse(item.mprocedure);
      } else {
        item.mprocedure = [];
      }
      if (item.analytic) {
        item.analytic = JSON.parse(item.analytic);
      } else {
        item.analytic = [];
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
router$5.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$3,
      user
    });
    if (item.analytic) {
      item.analytic = JSON.parse(item.analytic);
    } else {
      item.analytic = [];
    }
    if (item.treatment) {
      item.treatment = JSON.parse(item.treatment);
    } else {
      item.treatment = [];
    }
    if (item.recomendation) {
      item.recomendation = JSON.parse(item.recomendation);
    } else {
      item.recomendation = [];
    }
    if (item.mprocedure) {
      item.mprocedure = JSON.parse(item.mprocedure);
    } else {
      item.mprocedure = [];
    }
    if (item.birthdate && isValidDate$1(item.birthdate)) {
      item.age = calculateReadableAge(item.birthdate);
      item.birthdate = intlDate(item.birthdate);
    }
    item.file = await getPDF({
      ref_id: item.id,
      ref_key: table$3
    });
    item.prescription_date = intlDate(item.prescription_date);
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$5.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    data2.code = await getCode({ table: table$3 });
    if (data2.birthdate) {
      data2.birthdate_valid = convertToValidDate(data2.birthdate);
      data2.birthdate = mysqlDateTime(data2.birthdate_valid);
      data2.age = calculateReadableAge(data2.birthdate);
    }
    if (data2.prescription_date) {
      data2.prescription_date_valid = convertToValidDate(
        data2.prescription_date
      );
      data2.prescription_date = mysqlDateTime(
        addCurrentTimeToDate(data2.prescription_date_valid)
      );
    } else {
      data2.prescription_date = null;
    }
    Object.assign(data2, {
      doctor_id: user.id,
      doctor_description: user.description,
      doctor_ident_no: user.ident_no,
      exequatur: user.exequatur
    });
    const response2 = await insert({
      user,
      table: table$3,
      data: data2
    });
    const insured = await getRowById({
      user,
      table: "t_insured",
      id: data2.insured_id
    });
    data2.insured_description = insured.fullname;
    if (insured.birthdate) {
      data2.age = calculateReadableAge(insured.birthdate);
    }
    let signature = convertImagetoBase64("signatureEmpty.png");
    data2.images = {
      signature,
      logo: convertImagetoBase64("logo.png"),
      logoText: convertImagetoBase64("logoText.png"),
      prescription: convertImagetoBase64("prescription.png"),
      rx: convertImagetoBase64("rx.png"),
      email: convertImagetoBase64("email.png"),
      location: convertImagetoBase64("location.png"),
      phone: convertImagetoBase64("phone.png"),
      whatsapp: convertImagetoBase64("whatsapp.png"),
      facebook: convertImagetoBase64("facebook.png"),
      instagram: convertImagetoBase64("instagram.png")
    };
    data2.birthdate_format = intlDate(data2.birthdate_valid);
    data2.prescription_date_format = intlDate(
      data2.prescription_date_valid
    );
    data2.sex = await getCategoryDescriptionById(data2.$sex_id);
    data2.prescription_type = await getCategoryDescriptionById(
      data2.$prescription_type_id
    );
    const bodyTemplate = await getBody({
      table: table$3,
      account,
      data: data2
    });
    const filename = await generatePDF({
      account,
      data: data2,
      table: table$3,
      id: response2.id,
      filename: data2.code,
      bodyTemplate,
      header: table$3,
      footer: table$3,
      margin: {
        top: "300px",
        bottom: "300px",
        right: "0",
        left: "0"
      }
    });
    await insert({
      user,
      table: "t_file",
      data: {
        ref_key: table$3,
        ref_id: response2.id,
        description: `PRESCRIPCION-${data2.insured_description}-${data2.prescription_date_format}`,
        url: filename,
        type: "pdf"
      }
    });
    req.io.emit("update", {
      table: table$3,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$3}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$5.post("/pdf", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    req.io.emit("print-invoice", {
      account,
      user,
      token: res.locals.token,
      api: process.env.DOMAIN,
      url: data2.filename,
      options: {
        printer: account.printer.main
      }
    });
    return res.status(200).json(true);
  } catch (error) {
    console.log(error);
  }
});
router$5.post("/report", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const body = req.body;
    const items = body.items;
    const data2 = items[0];
    const report = {
      account,
      user,
      items,
      title: body.title,
      from: format(convertToValidDate(body.from), "dd MMMM, yyyy"),
      to: format(convertToValidDate(body.to), "dd MMMM, yyyy")
    };
    if (req.query.type === "excel") {
      return res.status(200).json(items);
    }
    const bodyTemplate = await getBody({
      table: "t_history_stats",
      account,
      data: report
    });
    report.filename = `REPORTE`;
    const filename = await generatePDF({
      account,
      data: report,
      table: "t_history_stats",
      filename: report.filename,
      landscape: true,
      bodyTemplate,
      header: false,
      footer: table$3,
      margin: {
        top: "20px",
        bottom: "0",
        right: "0",
        left: "20px"
      }
    });
    res.status(200).json(filename);
  } catch (error) {
    next(error);
  }
});
router$5.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate_valid = convertToValidDate(data2.birthdate);
      data2.birthdate = mysqlDateTime(data2.birthdate_valid);
      data2.age = calculateReadableAge(data2.birthdate);
    }
    if (data2.prescription_date) {
      data2.prescription_date_valid = convertToValidDate(
        data2.prescription_date
      );
      data2.prescription_date = mysqlDateTime(
        addCurrentTimeToDate(data2.prescription_date_valid)
      );
    } else {
      data2.prescription_date = null;
    }
    Object.assign(data2, {
      exequatur: user.exequatur
    });
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$3,
      data: data2
    });
    let signature = convertImagetoBase64("signatureEmpty.png");
    data2.images = {
      signature,
      logo: convertImagetoBase64("logo.png"),
      logoText: convertImagetoBase64("logoText.png"),
      prescription: convertImagetoBase64("prescription.png"),
      rx: convertImagetoBase64("rx.png"),
      email: convertImagetoBase64("email.png"),
      location: convertImagetoBase64("location.png"),
      phone: convertImagetoBase64("phone.png"),
      whatsapp: convertImagetoBase64("whatsapp.png"),
      facebook: convertImagetoBase64("facebook.png"),
      instagram: convertImagetoBase64("instagram.png")
    };
    const insured = await getRowById({
      user,
      table: "t_insured",
      id: data2.insured_id
    });
    data2.insured_description = insured.fullname;
    if (insured.birthdate) {
      data2.age = calculateReadableAge(insured.birthdate);
    }
    data2.birthdate_format = intlDate(data2.birthdate_valid);
    data2.prescription_date_format = intlDate(
      data2.prescription_date_valid
    );
    data2.sex = await getCategoryDescriptionById(data2.$sex_id);
    data2.prescription_type = await getCategoryDescriptionById(
      data2.$prescription_type_id
    );
    const bodyTemplate = await getBody({
      table: table$3,
      account,
      data: data2
    });
    const filename = await generatePDF({
      account,
      data: data2,
      table: table$3,
      id: response2.id,
      filename: data2.code,
      bodyTemplate,
      header: table$3,
      footer: table$3,
      margin: {
        top: "300px",
        bottom: "300px",
        right: "0",
        left: "0"
      }
    });
    const { items: files } = await getRows({
      user,
      table: "t_file",
      query: {
        where: {
          ref_key: table$3,
          ref_id: response2.id,
          url: filename,
          type: "pdf"
        }
      }
    });
    if (files.length) {
      await update({
        user,
        table: "t_file",
        data: {
          ref_key: table$3,
          ref_id: response2.id,
          description: `PRESCRIPCION-${data2.insured_description}-${intlDate(data2.history_date_valid)}`,
          url: filename,
          type: "pdf"
        }
      });
    } else {
      await insert({
        user,
        table: "t_file",
        data: {
          ref_key: table$3,
          ref_id: response2.id,
          description: `PRESCRIPCION-${data2.insured_description}-${data2.history_date_format}`,
          url: filename,
          type: "pdf"
        }
      });
    }
    req.io.emit("update", {
      table: table$3,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$3}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$5.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$3,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$3,
      item: data,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$5.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$3,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$3
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$4 = express.Router();
const table$2 = "t_task";
router$4.use(isAuthenticated);
router$4.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$2,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.user) {
        item.user = JSON.parse(item.user);
      }
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
      if (item.event_state !== 331) {
        item.time_passed = formatDistanceToNow(item.created, { addSuffix: true });
      }
      item.files = await getFiles({
        ref_id: item.id,
        ref_key: table$2
      });
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$4.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$2,
      user
    });
    if (item.user) {
      item.user = JSON.parse(item.user);
    }
    if (item.event_state !== 331) {
      item.time_passed = formatDistanceToNow(item.created, { addSuffix: true });
    }
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$2
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "FOTO PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$4.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.code = await getCode({ table: table$2 });
    const response2 = await insert({
      user,
      table: table$2,
      data: data2
    });
    req.io.emit("update", {
      table: table$2,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$2}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$4.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$2,
      data: data2
    });
    req.io.emit("update", {
      table: table$2,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$2}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$4.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$2,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$2
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$4.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$2,
        data: { c_status: 1 }
      });
    }
    req.io.emit("update", {
      table: table$2
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$3 = express.Router();
const table$1 = "t_lodging";
router$3.use(isAuthenticated);
router$3.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table: table$1,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$3.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table: table$1,
      user
    });
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table$1
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "FOTO PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$3.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.code = await getCode({ table: table$1 });
    const response2 = await insert({
      user,
      table: table$1,
      data: data2
    });
    req.io.emit("update", {
      table: table$1,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't insert data to ${table$1}.`,
        `Cero datos agregados`
      );
    }
  } catch (error) {
    next(error);
  }
});
router$3.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.last_event) {
      data2.last_event = mysqlDateTime(new Date(data2.last_event));
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table: table$1,
      data: data2
    });
    req.io.emit("update", {
      table: table$1,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      throw new BaseError(
        "NO DATA UPDATED",
        401,
        true,
        `User ${user.description} couldn't update data to ${table$1}.`,
        `Cero datos actualizados`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$3.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table: table$1,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table: table$1
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$3.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table: table$1,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table: table$1
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const router$2 = express.Router();
const table = "t_broker";
router$2.use(isAuthenticated);
router$2.get("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    let { items, total, sql } = await getRows({
      table,
      user,
      query: req.query
    });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.modified) {
        item.modified_format = intlDateTime(item.modified);
      }
      item.created_format = intlDateTime(item.created);
    }
    if (req.query.returnItems) {
      return res.status(200).json(items);
    }
    return res.status(200).json({ items, total });
  } catch (error) {
    next(error);
  }
});
router$2.get("/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const item = await getRowById({
      id: req.params.id,
      table,
      user
    });
    item.files = await getFiles({
      ref_id: item.id,
      ref_key: table
    });
    if (item.files) {
      item.profile = item.files.filter((i) => {
        if (i.file_type === "FOTO PERFIL") {
          return true;
        } else {
          return false;
        }
      }).reduce((acc, curr) => {
        return curr;
      }, "");
    }
    if (item.modified) {
      item.modified_format = intlDateTime(item.modified);
    }
    item.created_format = intlDateTime(item.created);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});
router$2.post("/", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    data2.code = await getCode({ table });
    const response2 = await insert({
      user,
      table,
      data: data2
    });
    req.io.emit("update", {
      table,
      item: data2,
      id: response2.id
    });
    if (response2) {
      return res.status(200).json(response2);
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
router$2.put("/:id", async function(req, res) {
  try {
    const user = res.locals.user;
    const data2 = req.body;
    if (data2.birthdate) {
      data2.birthdate = mysqlDateTime(
        convertToValidDate(data2.birthdate)
      );
    } else {
      data2.birthdate = null;
    }
    if (data2.last_event) {
      data2.last_event = mysqlDateTime(new Date(data2.last_event));
    }
    const response2 = await update({
      id: req.params.id,
      user,
      table,
      data: data2
    });
    req.io.emit("update", {
      table,
      item: data2,
      id: response2.id
    });
    if (response2) {
      res.status(200).json(response2);
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
router$2.delete("/:id", async function(req, res) {
  try {
    let user = res.locals.user;
    let response2 = await update({
      user,
      id: req.params.id,
      table,
      data: { c_status: 1 }
    });
    req.io.emit("update", {
      table
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
router$2.delete("/", async function(req, res) {
  try {
    const user = res.locals.user;
    const ids = req.body;
    let response2;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      response2 = await update({
        user,
        id,
        table,
        data: { c_status: 1 }
      });
      const { items: events } = await getRows({
        user,
        table: "t_event",
        query: {
          where: {
            c_status: 4,
            contact_id: id
          }
        }
      });
      for (let i2 = 0; i2 < events.length; i2++) {
        const event = events[i2];
        await update({
          user,
          id: event.id,
          table: "t_event",
          data: { contact_id: null }
        });
      }
    }
    req.io.emit("update", {
      table
    });
    if (response2) {
      res.status(200).json(response2);
    } else {
      res.status(401).send({ msg: "Cero datos actualizados" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
const imagesBase64Dir = path__default.join(path__default.resolve(), "/public/base64/");
const frontPage = fs.readFileSync(`${imagesBase64Dir}/guia1.png`).toString("base64");
const carnet = fs.readFileSync(`${imagesBase64Dir}/guia2.png`).toString("base64");
const content1 = fs.readFileSync(`${imagesBase64Dir}/guia3.png`).toString("base64");
const content2 = fs.readFileSync(`${imagesBase64Dir}/guia4.png`).toString("base64");
const branches = fs.readFileSync(`${imagesBase64Dir}/guia19.png`).toString("base64");
const BACKGROUNDS = { frontPage, carnet, imagesAndContent: content1, titlePages: content2, lastPage: branches };
async function generateMedicalGuideDoc({ item, itineraries, provider, files, account, user }) {
  var _a, _b, _c;
  let provider_files;
  let hasDoctorsLogo = true;
  let hasProviderFile = true;
  if (provider) {
    item.provider_description = provider.description;
    item.provider_detail = provider.detail;
    item.provider_location = provider.city ? `${provider.city}, ${provider.country}` : provider.country;
    item.provider_place = `${provider.description}, ${provider.country}, ${provider.city}`;
    provider_files = await getFiles({ ref_key: "t_provider", ref_id: item.provider_id });
    if (provider_files == null ? void 0 : provider_files.length) {
      const [provider_file] = provider_files.filter((i) => i.$file_type_id === 404);
      const [provider_mapa] = provider_files.filter((i) => i.$file_type_id === 380);
      item.provider_file = provider_file == null ? void 0 : await handleImageOrFile(provider_file);
      item.provider_map = provider_mapa == null ? void 0 : await handleImageOrFile(provider_mapa);
      if (!item.provider_file) {
        hasProviderFile = false;
      }
    }
    const ProviderLogoImg = await getProfilePic({ ref_key: "t_provider", ref_id: item.provider_id });
    if (ProviderLogoImg) {
      item.provider_profile_pic = await handleImageOrFile(ProviderLogoImg);
    }
  }
  if (itineraries.length) {
    for (let itinerary of itineraries) {
      const provider2 = await getRowById({
        id: itinerary.provider_id,
        table: "t_provider",
        user
      });
      if (provider2) {
        itinerary.provider_logo = provider2.logo;
        itinerary.provider_address = provider2.address;
        itinerary.provider_city = provider2.city;
        itinerary.provider_country = provider2.country;
      }
      if (itinerary.attendance_datetime) {
        itinerary.attendance_day = intlDay(itinerary.attendance_datetime);
        itinerary.attendance_date = intlDate(itinerary.attendance_datetime);
        itinerary.attendance_time = intlTimeClean(itinerary.attendance_datetime);
        itinerary.attendance_time_format = extractAMPM(itinerary.attendance_time);
      }
      const doctor = await getRowById({
        id: itinerary.doctor_id,
        table: "t_doctor",
        user
      });
      if (doctor) {
        itinerary.doctor_address = doctor.address;
        itinerary.doctor_description = doctor.description;
        itinerary.doctor_bio = doctor.bio;
        const doctorProfile = await getProfilePic({ ref_key: "t_doctor", ref_id: itinerary.doctor_id });
        if (doctorProfile) {
          itinerary.doctor_profile_pic = await handleImageOrFile(doctorProfile);
        } else {
          hasDoctorsLogo = false;
        }
        if (doctor.postnominal) {
          itinerary.doctor_posnominal = JSON.parse(doctor.postnominal);
        } else {
          itinerary.doctor_posnominal = [];
        }
        if (doctor.speciality) {
          itinerary.doctor_speciality = JSON.parse(doctor.speciality);
        } else {
          itinerary.doctor_speciality = [];
        }
      }
    }
  }
  let carnets = [];
  let vobs = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.$file_type_id === 314) {
      const img = await handleImageOrFile(file);
      carnets.push(img);
    }
    if (file.$file_type_id === 197) {
      if (file.icon === "pdf") {
        const url = getFilePathFromUrl(file.url);
        const allFiles = await pdfToImg2(url);
        for (let j = 0; j < allFiles.length; j++) {
          const vobs_file = publicPath({ account, table: "t_event", filename: allFiles[j] });
          const url2 = getFilePathFromUrl(vobs_file);
          vobs.push(url2);
        }
      } else {
        const url = getFilePathFromUrl(file.url);
        vobs.push(url);
      }
    }
  }
  item.carnets = carnets;
  item.vobs = vobs;
  const events_itineraries = itineraries.map((itinerary) => {
    const {
      attendance_day,
      attendance_date,
      attendance_time,
      attendance_time_format,
      provider_description,
      provider_address,
      doctor_description,
      doctor_speciality
    } = itinerary;
    return [
      {
        stack: [
          { text: attendance_day.toUpperCase(), bold: false, fontSize: 9 },
          { text: attendance_date, bold: true, fontSize: 9 }
        ],
        style: "tableSubHeader",
        alignment: "center"
      },
      {
        stack: [
          { text: `${attendance_time} ${attendance_time_format}`, bold: true, fontSize: 9 },
          { text: "CONSULTA", fontSize: 8 }
        ],
        style: "tableSubHeader",
        alignment: "center"
      },
      {
        stack: [
          { text: provider_description, bold: true, fontSize: 9, lineHeight: 0.7 },
          { text: provider_address, fontSize: 8 }
        ],
        style: "tableSubHeader",
        alignment: "center"
      },
      {
        stack: [
          { text: doctor_description, bold: true, fontSize: 9, lineHeight: 0.7 },
          {
            text: doctor_speciality ? doctor_speciality.length > 1 ? doctor_speciality.map((s) => s.description).join(", ") : doctor_speciality[0].description : "",
            fontSize: 8
          }
        ],
        style: "tableSubHeader",
        alignment: "center"
      }
    ];
  });
  const doctors = itineraries.filter((itinerary_doctor) => itinerary_doctor.doctor_description).map((itinerary) => {
    const {
      doctor_profile_pic,
      doctor_description,
      doctor_posnominal,
      doctor_bio,
      doctor_speciality
    } = itinerary;
    return [
      {
        table: {
          widths: [100, "*"],
          body: [
            [
              ...doctor_profile_pic ? [{
                image: doctor_profile_pic,
                width: 100,
                height: 120
              }] : [{ text: "", image: "", width: 100, height: 120 }],
              {
                stack: [
                  { text: `${doctor_description}${doctor_posnominal ? `, ${doctor_posnominal.length > 1 ? doctor_posnominal.join(", ").toUpperCase() : doctor_posnominal[0].toUpperCase()}` : ""}`, style: "doctor_name" },
                  { text: doctor_speciality ? doctor_speciality.length > 1 ? doctor_speciality.map((s) => s.description).join(", ").toUpperCase() : doctor_speciality[0].description.toUpperCase() : "", style: "doctor_title" }
                ],
                margin: [10, 40, 0, 0]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 10,
          paddingBottom: () => 10,
          fillColor: "#183F73"
        }
      },
      { text: "\n" },
      {
        text: doctor_bio,
        style: "paragraph"
      }
    ];
  });
  const hasProviderLogo = !!item.provider_profile_pic;
  const hasCarnets = ((_a = item.carnets) == null ? void 0 : _a.length) || 0 > 0;
  const hasVobs = (((_b = item.vobs) == null ? void 0 : _b.length) || 0) > 0;
  const hasDoctors = ((doctors == null ? void 0 : doctors.length) || 0) > 0;
  const hasEvents = ((events_itineraries == null ? void 0 : events_itineraries.length) || 0) > 0;
  const hasProviderInfo = !!(item.provider_description || item.provider_detail || item.provider_location);
  const hasHowTo = !!(item.provider_location || item.provider_place || !!item.provider_map);
  const hasMap = !!item.provider_map;
  const sectionTitlesMap = {
    precertTitle: "Pre-certificación",
    citasTitle: "Citas Médicas",
    doctorTitle: "Sobre el Doctor",
    hospitalTitle: "Sobre el Hospital",
    howTo: "Sobre la Ciudad",
    contact: "Contactos",
    hospitalContent: "Estadía y Hospital",
    atracciones: "Atracciones",
    otras: "Otras Informaciones"
  };
  const dynamicUL = [
    hasVobs ? sectionTitlesMap.precertTitle : null,
    hasEvents ? sectionTitlesMap.citasTitle : null,
    hasDoctors ? sectionTitlesMap.doctorTitle : null,
    hasProviderInfo ? sectionTitlesMap.hospitalTitle : null,
    hasHowTo ? sectionTitlesMap.howTo : null,
    sectionTitlesMap.contact,
    hasProviderInfo ? sectionTitlesMap.hospitalContent : null,
    ((_c = item.atracciones) == null ? void 0 : _c.length) > 0 ? sectionTitlesMap.atracciones : null,
    sectionTitlesMap.otras
  ].filter(Boolean);
  const docDefinition = {
    pageSize: "LETTER",
    pageMargins: [40, 150, 40, 60],
    background: function(currentPage, pageSize) {
      var _a2;
      let page = 2;
      const ranges = {};
      const addRange = (key, pages) => {
        if (!pages || pages <= 0)
          return null;
        const start = page;
        const end = start + pages - 1;
        ranges[key] = [start, end];
        page = end + 1;
        return ranges[key];
      };
      if (hasCarnets) {
        addRange("carnets", (_a2 = item.carnets) == null ? void 0 : _a2.length);
      }
      if (hasProviderLogo) {
        addRange("logo", 1);
      }
      addRange("contenido", 1);
      if (hasVobs) {
        addRange("precertTitle", 1);
        addRange("vobs", item.vobs.length);
      }
      if (hasEvents) {
        addRange("citasTitle", 1);
        addRange("citasTable", 1);
      }
      addRange("contactos", 1);
      if (hasDoctors) {
        addRange("doctorTitle", 1);
        addRange("doctorContent", doctors.length);
      }
      if (hasProviderInfo) {
        addRange("hospitalTitle", 1);
        addRange("hospitalContent", 1);
      }
      if (hasHowTo) {
        addRange("howTo", 1);
      }
      const lastPage = page;
      const inRange = (p, range) => range && p >= range[0] && p <= range[1];
      let bg = BACKGROUNDS.titlePages;
      if (currentPage === 1) {
        bg = BACKGROUNDS.frontPage;
      } else if (currentPage === lastPage) {
        bg = BACKGROUNDS.lastPage;
      } else if (ranges.carnets && inRange(currentPage, ranges.carnets)) {
        bg = BACKGROUNDS.carnet;
      } else if (["contenido", "precertTitle", "citasTitle", "doctorTitle", "hospitalTitle"].some(
        (key) => ranges[key] && inRange(currentPage, ranges[key])
      )) {
        bg = BACKGROUNDS.titlePages;
      } else if (["hospitalContent"].some((key) => ranges[key] && inRange(currentPage, ranges[key]))) {
        if (item.provider_file) {
          return {
            image: "provider_center",
            width: pageSize.width,
            height: 300,
            absolutePosition: { x: 0, y: 0 }
          };
        } else {
          bg = BACKGROUNDS.imagesAndContent;
        }
      } else if (Object.entries(ranges).some(
        ([key, range]) => range && !["contenido", "precertTitle", "citasTitle", "doctorTitle", "hospitalTitle", "hospitalContent", "carnets"].includes(key) && inRange(currentPage, range)
      )) {
        bg = BACKGROUNDS.imagesAndContent;
      }
      return {
        image: `data:image/png;base64,${bg}`,
        width: 595,
        height: 842
      };
    },
    content: [
      { text: "", pageBreak: "after" },
      ...hasCarnets ? item.carnets.map((carnet2) => ({ image: carnet2, width: 350, alignment: "center", pageBreak: "after" })) : [{}],
      ...hasProviderLogo ? [{ image: "logo", width: 350, alignment: "center", pageBreak: "after" }] : [],
      { text: "CONTENIDO", style: "title", margin: [30, 35, 0, 0] },
      {
        type: "square",
        style: "item",
        ul: dynamicUL,
        margin: [30, 0, 0, 0],
        pageBreak: "after"
      },
      ...hasVobs ? [
        {
          text: "PRE-CERTIFICACIÓN",
          style: "title",
          alignment: "center",
          absolutePosition: { x: 0, y: 390 },
          pageBreak: "after"
        },
        ...item.vobs.map((vob) => ({ image: convertImageUrltoBase64(vob), width: 350, alignment: "center", pageBreak: "after" }))
      ] : [{}],
      ...hasEvents ? [
        {
          text: "CITAS MÉDICAS",
          style: "title",
          alignment: "center",
          absolutePosition: { x: 0, y: 390 },
          pageBreak: "after"
        },
        {
          table: {
            widths: ["30%", "18%", "30%", "27%"],
            body: [
              [
                { text: "FECHA", style: "tableHeader", alignment: "center" },
                { text: "HORA", style: "tableHeader", alignment: "center" },
                { text: "LUGAR", style: "tableHeader", alignment: "center" },
                { text: "DOCTOR", style: "tableHeader", alignment: "center" }
              ],
              ...events_itineraries,
              [
                { text: " ", style: "tableHeader", alignment: "center", minHeight: 40 },
                { text: " ", style: "tableHeader", alignment: "center", minHeight: 40 },
                { text: " ", style: "tableHeader", alignment: "center", minHeight: 40 },
                { text: " ", style: "tableHeader", alignment: "center", minHeight: 40 }
              ]
            ]
          },
          layout: {
            fillColor: function(rowIndex, node) {
              const lastRowIndex = node.table.body.length - 1;
              if (rowIndex === 0) {
                return "#1b355e";
              }
              if (rowIndex === lastRowIndex) {
                return "#f2f2f2";
              }
              return null;
            },
            hLineWidth: function() {
              return 0.3;
            },
            vLineWidth: function() {
              return 0.3;
            },
            hLineColor: function() {
              return "white";
            },
            vLineColor: function() {
              return "white";
            }
          },
          margin: [-15, 0, 15, 0],
          pageBreak: "after"
        }
      ] : [],
      {
        stack: [
          { text: "CONTACTOS", style: "title", margin: [0, 0, 0, 10] },
          {
            columns: [
              {
                stack: [
                  { text: "Laura Suárez", style: "contactInfo", bold: true, lineHeight: 0.8 },
                  { text: "Client liaison, International Patient Center", style: "contactInfo" },
                  { text: "International and Specialized Services", style: "contactInfo" },
                  { text: "Massachusetts General Hospital", style: "contactInfo" },
                  { text: "| Mass Eye and Ear", style: "contactInfo" },
                  { text: "55 Fruit St, Blake building, Site 180 Boston,", style: "contactInfo" },
                  { text: "MA 02114", style: "contactInfo" },
                  { text: "T 617-726-1442 | F 617-726-2543", style: "contactInfo" },
                  { text: "Email: LSUAREZ5@mgh.harvard.edu", link: "mailto:LSUAREZ5@mgh.harvard.edu", style: "contactInfo", bold: true, margin: [0, 0, 0, 15] },
                  { text: "Gleisi Tatis Herrera", style: "contactInfo", bold: true, lineHeight: 0.8 },
                  { text: "Oficial de Coordinaciones Medicas", style: "contactInfo" },
                  { text: "Seguros de Personas internacional", style: "contactInfo" },
                  { text: "Matos Corredores de Seguros", style: "contactInfo" },
                  { text: "T. 809-620-0000 / C. 829-745-2816 / ", style: "contactInfo" },
                  { text: "F. 857-702-9210", style: "contactInfo" },
                  { text: "Email: gtatis@momatos.com", link: "mailto:gtatis@momatos.com", style: "contactInfo", bold: true }
                ],
                width: "50%"
              },
              {
                stack: [
                  { text: "Manuel José Matos", style: "contactInfo", bold: true, lineHeight: 0.8 },
                  { text: "Director Ejecutivo", style: "contactInfo" },
                  { text: "Matos Corredores de Seguros", style: "contactInfo" },
                  { text: "T. 809-620-0000 / C. 829-421-1761 / F. 857-702-9210", style: "contactInfo" },
                  { text: "Email: manueljmatos@momatos.com", link: "mailto:manueljmatos@momatos.com", style: "contactInfo", bold: true, margin: [0, 0, 0, 15] },
                  { text: "José Luís Martínez", style: "contactInfo", bold: true, lineHeight: 0.8 },
                  { text: "Gerente de Coordinaciones Medicas", style: "contactInfo" },
                  { text: "Seguros de Personas internacional", style: "contactInfo" },
                  { text: "Matos Corredores de Seguros", style: "contactInfo" },
                  { text: "T. 809-620-0000 / C. 829-421-1761 / F. 857-702-9210", style: "contactInfo" },
                  { text: "Email: jmartinez@momatos.com", link: "mailto:jmartinez@momatos.com", style: "contactInfo", bold: true, margin: [0, 0, 0, 15] },
                  { text: "Priscila García", style: "contactInfo", bold: true, lineHeight: 0.8 },
                  { text: "Gerente de Negocios", style: "contactInfo" },
                  { text: "Seguros de Personas internacional", style: "contactInfo" },
                  { text: "Matos Corredores de Seguros", style: "contactInfo" },
                  { text: "T. 809-620-0000 / C. 829-760-4624 / F. 857-702-9210", style: "contactInfo" },
                  { text: "Email: pgarcia@momatos.com", link: "mailto:pgarcia@momatos.com", style: "contactInfo", bold: true }
                ],
                width: "50%"
              }
            ]
          }
        ],
        margin: [0, 20, 0, 0],
        pageBreak: "after"
      },
      ...hasDoctors ? [
        {
          text: "SOBRE EL DOCTOR",
          style: "title",
          alignment: "center",
          absolutePosition: { x: 0, y: 390 },
          pageBreak: "after"
        },
        doctors.map((doctor) => ({
          stack: doctor,
          pageBreak: "after"
        }))
      ] : [],
      ...hasProviderInfo ? [
        {
          text: "SOBRE EL HOSPITAL",
          style: "title",
          alignment: "center",
          absolutePosition: { x: 0, y: 390 },
          pageBreak: "after"
        },
        {
          margin: [0, 170, 0, 0],
          stack: [
            {
              text: item.provider_description,
              style: "item",
              lineHeight: 0.8,
              bold: true
            },
            {
              text: item.provider_detail,
              style: "body"
            },
            {
              table: {
                widths: ["auto", "*"],
                body: [
                  [
                    { text: "UBICACIÓN:", style: "locationLabel" },
                    { text: item.provider_location, style: "locationValue" }
                  ]
                ]
              },
              layout: {
                fillColor: (rowIndex) => {
                  return rowIndex === 0 ? "#1a3354" : null;
                },
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 4,
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingBottom: () => 4
              }
            }
          ]
        }
      ] : [],
      { text: "", pageBreak: "after" },
      // {
      //   text: 'SOBRE LA CIUDAD',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page13
      // {
      //   text: 'ESTADÍA & HOSPITALES',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page15
      // {
      //   text: 'ATRACCIONES',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page16
      // {
      //   text: 'OTRAS INFORMACIONES',
      //   style: 'title',
      //   alignment: 'center',
      //   absolutePosition: { x: 0, y: 390 }, 
      //   pageBreak: 'after'
      // }, // page17
      ...hasHowTo ? [
        {
          text: "¿CÓMO LLEGAR?",
          style: "headerMap",
          alignment: "center",
          margin: [0, 50, 0, 10]
        },
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  text: [
                    { text: "UBICACIÓN: ", bold: true },
                    item.provider_location
                  ],
                  alignment: "center",
                  margin: [0, 0, 0, 5]
                },
                {
                  text: item.provider_place,
                  italics: true,
                  alignment: "center",
                  margin: [0, 0, 0, 20]
                }
              ]
            }
          ]
        },
        ...hasMap ? [{
          image: "map",
          fit: [500, 300],
          alignment: "center"
        }] : [],
        { text: "", pageBreak: "after" }
      ] : []
    ],
    images: {
      provider_center: item.provider_file ? item.provider_file : void 0,
      logo: item.provider_profile_pic ? item.provider_profile_pic : void 0,
      map: item.provider_map ? item.provider_map : void 0
    },
    styles: {
      title: {
        fontSize: 44,
        bold: true,
        lineHeight: 0.85,
        color: "#20375c"
      },
      tableHeader: {
        bold: true,
        fontSize: 14,
        color: "white",
        margin: [0, 5, 0, 0]
      },
      tableSubHeader: {
        margin: [0, 5, 0, 5]
      },
      contactInfo: {
        color: "#20375c",
        fontSize: 10.5
      },
      pageTitle: {
        fontSize: 24,
        bold: true,
        lineHeight: 0.2,
        alignment: "center"
      },
      headerMap: {
        bold: true,
        fontSize: 35,
        color: "#20375c"
      },
      item: {
        fontSize: 24,
        color: "#20375c",
        lineHeight: 1.2
      },
      doctor_name: {
        font: "OpenSans",
        fontSize: 20,
        lineHeight: 0.8,
        bold: true,
        color: "#FFFFFF"
      },
      doctor_title: {
        font: "OpenSans",
        fontSize: 20,
        color: "#FFFFFF"
      },
      paragraph: {
        font: "OpenSans",
        fontSize: 10,
        color: "#20375c"
      },
      locationLabel: {
        fontSize: 10,
        bold: true,
        color: "#ffffff"
      },
      locationValue: {
        fontSize: 10,
        color: "#ffffff"
      },
      defaultStyle: {
        fontSize: 10,
        color: "#333333"
      }
    }
  };
  const pending_list = { hasCarnets, hasProviderLogo, hasVobs, hasEvents, hasDoctors, hasProviderInfo, hasHowTo, hasMap, hasDoctorsLogo, hasProviderFile };
  return { docDefinition, pending_list };
}
const router$1 = express.Router();
router$1.use(isAuthenticated);
router$1.get("/medical-guide/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const template = "medical_guide";
    const item = await getRowById({
      id: req.params.id,
      table: "t_event",
      user
    });
    const { items: itineraries } = await getRows({
      table: "t_itinerary",
      user,
      query: {
        where: {
          event_id: req.params.id,
          c_status: 4
        }
      }
    });
    const data2 = item;
    data2._files = {
      cardnet: [],
      presertification: [],
      provider: null,
      doctor: []
    };
    if (itineraries.length) {
      data2.itineraries = itineraries;
      for (let i = 0; i < data2.itineraries.length; i++) {
        const itinerary = data2.itineraries[i];
        const provider = await getRowById({
          id: itinerary.provider_id,
          table: "t_provider",
          user
        });
        if (provider) {
          itinerary.provider_address = provider.address;
          itinerary.provider_city = provider.city;
          itinerary.provider_country = provider.country;
        }
        if (itinerary) {
          itinerary.attendance_day = intlDay(itinerary.attendance_datetime);
          itinerary.attendance_date = intlDate(itinerary.attendance_datetime);
          itinerary.attendance_time = intlTimeClean(itinerary.attendance_datetime);
          itinerary.attendance_time_format = extractAMPM(itinerary.attendance_time);
        }
        const doctor = await getRowById({
          id: itinerary.doctor_id,
          table: "t_doctor",
          user
        });
        if (doctor) {
          itinerary.doctor_address = doctor.speciality;
          if (doctor.speciality) {
            doctor.speciality = JSON.parse(doctor.speciality);
          } else {
            doctor.speciality = [];
          }
          const [doctor_profile] = await getFiles({ ref_key: "t_doctor", ref_id: doctor.id });
          if (doctor_profile) {
            data2._files.doctor.push({ ...doctor, profile: doctor_profile.url });
          }
        }
      }
    }
    data2.provider = await getRowById({
      id: data2.provider_id,
      table: "t_provider",
      user
    });
    let provider_files;
    if (data2.provider) {
      data2.provider.place = `${data2.provider.description}, ${data2.provider.country}, ${data2.provider.city}`;
      provider_files = await getFiles({ ref_key: "t_provider", ref_id: data2.provider.id });
      if (provider_files == null ? void 0 : provider_files.length) {
        const [provider_file] = provider_files.filter((i) => i.$file_type_id === 198);
        const [provider_mapa] = provider_files.filter((i) => i.$file_type_id === 380);
        data2.provider.file = provider_file == null ? void 0 : provider_file.url;
        data2.provider.mapa = provider_mapa == null ? void 0 : provider_mapa.url;
      }
      data2._files.provider = await (void 0)({ ref_key: "t_provider", ref_id: item.provider_id });
    }
    const files = await getFiles({ ref_key: "t_event", ref_id: req.params.id });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.$file_type_id === 314) {
        data2._files.cardnet.push(file.url);
      }
      if (file.$file_type_id === 381) {
        if (file.icon === "pdf") {
          const url = getFilePathFromUrl(file.url);
          const allFiles = await pdfToImg2(url);
          for (let j = 0; j < allFiles.length; j++) {
            const presertification_file = publicPath({ account, table: "t_event", filename: allFiles[j] });
            data2._files.presertification.push(presertification_file);
          }
        } else {
          data2._files.presertification.push(file.url);
        }
      }
    }
    data2.images = {
      frontPage: convertImagetoBase64("frontPage.png"),
      content1: convertImagetoBase64("content1.png"),
      guia3: convertImagetoBase64("guia3.png"),
      guia4: convertImagetoBase64("guia4.png"),
      guia19: convertImagetoBase64("guia19.png")
    };
    const bodyTemplate = await getBody({
      table: template,
      account,
      data: data2
    });
    const filename = await generatePDF({
      account,
      data: data2,
      table: "t_event",
      filename: data2.code,
      bodyTemplate,
      header: false,
      footer: false,
      margin: {
        top: "0",
        bottom: "0",
        right: "0",
        left: "0"
      }
    });
    return res.status(200).json({ item, filename });
  } catch (error) {
    next(error);
  }
});
router$1.get("/medical-guide2/:id", async function(req, res, next) {
  try {
    const user = res.locals.user;
    const account = res.locals.account;
    const item = await getRowById({
      id: req.params.id,
      table: "t_event",
      user
    });
    const filename = item.code || "medical-guide";
    const { items: itineraries } = await getRows({
      table: "t_itinerary",
      user,
      query: {
        where: {
          event_id: req.params.id,
          c_status: 4
        }
      }
    });
    const provider = await getRowById({
      id: item.provider_id,
      table: "t_provider",
      user
    });
    const files = await getFiles({ ref_key: "t_event", ref_id: req.params.id });
    const { docDefinition, pending_list } = await generateMedicalGuideDoc({ item, itineraries, provider, files, account, user });
    const pdfUrl = await generatePDFWithPdfmake({
      account,
      table: "t_event",
      filename,
      docDefinition
    });
    return res.status(200).json({ item, filename, pdfUrl, pending_list });
  } catch (error) {
    next(error);
  }
});
const router = express.Router();
router.use("/user", router$B);
router.use("/role", router$y);
router.use("/category", router$A);
router.use("/insurance", router$z);
router.use("/file", router$w);
router.use("/utility", router$x);
router.use("/permission", router$v);
router.use("/privilege", router$u);
router.use("/diagnosis", router$t);
router.use("/event", router$s);
router.use("/comunication", router$r);
router.use("/procedure", router$q);
router.use("/account", router$p);
router.use("/insured", router$m);
router.use("/doctor", router$l);
router.use("/contact", router$i);
router.use("/policy", router$k);
router.use("/provider", router$j);
router.use("/speciality", router$o);
router.use("/customer", router$n);
router.use("/conciliation", router$h);
router.use("/ICD10", router$g);
router.use("/CPT", router$e);
router.use("/log", router$f);
router.use("/comment", router$d);
router.use("/resources", router$c);
router.use("/migration", router$b);
router.use("/poll", router$a);
router.use("/poll-answer", router$9);
router.use("/poll-question", router$8);
router.use("/poll-result", router$7);
router.use("/itinerary", router$6);
router.use("/prescription", router$5);
router.use("/task", router$4);
router.use("/lodging", router$3);
router.use("/broker", router$2);
router.use("/report", router$1);
const packageJsonPath = path__default.resolve("package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
setDefaultOptions({ locale: es });
function createServer() {
  const app = express();
  const server2 = http.createServer(app);
  const io = new Server(server2, {
    cors: {
      origin: "*"
    }
  });
  app.use(function(req, res, next) {
    req.io = io;
    next();
  });
  const allowedOrigins = [
    "http://localhost:9000",
    "https://app.medtravel.do",
    "http://127.0.0.1:9000"
  ];
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin)
        return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));
  app.set("view engine", "ejs");
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));
  app.use(
    "/assets",
    express.static(path__default.join(path__default.resolve(), "/client/assets"))
  );
  app.use("/privated", sameOriginMiddleware, express.static(path__default.join(path__default.resolve(), "/privated")));
  app.use(express.static(path__default.join(path__default.resolve(), "/public")));
  app.use(express.json({ limit: "10mb" }));
  app.use(httpLogger);
  app.use("/api", router);
  app.get("*", (req, res) => {
    res.sendFile(path__default.join(path__default.resolve(), "/client/index.html"));
  });
  app.use(function(req, res, next) {
    next(createError(404));
  });
  app.use(returnError);
  process.on("unhandledRejection", (error) => {
    throw error;
  });
  process.on("uncaughtException", (error) => {
    logError(error);
    if (!isOperationalError(error)) {
      process.exit(1);
    }
  });
  server2.getConnections((data2) => {
    setTimeout(() => {
      io.emit("update", {
        table: "t_version",
        version: packageJson.version
      });
    }, 3e4);
  });
  return server2;
}
/* @__PURE__ */ (async function() {
})();
const server = createServer();
server.listen(
  process.env.PORT,
  () => console.log(
    `API SERVER: http://localhost:${process.env.PORT} - ${/* @__PURE__ */ new Date()}`
  )
);
