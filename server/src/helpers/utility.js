import { _constant, _query, _date } from "./index.js";
import { BaseError } from "../utils/errors.js";

export function hasNormalizedDuplicates(arr) {
  const normalize = str => str.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const seen = new Set();

  for (const item of arr) {
    const normalized = normalize(item);
    if (seen.has(normalized)) {
      return true;
    }
    seen.add(normalized);
  }

  return false;
}

export function fixString(str) {
  if (!str) return str;
  // Convert the entire string to lowercase first
  let correctedStr = String(str).toLowerCase();

  // Replace the incorrect character with 'ñ'
  correctedStr = correctedStr.replace("?", "ñ");

  // Capitalize the first letter of each word
  correctedStr = correctedStr.replace(/(?:^|\s)\S/g, function (char) {
    return char.toUpperCase();
  });

  return correctedStr;
}

export function padToEleven(num) {
  if (!num) {
    return num;
  }
  return num.toString().padStart(11, "0");
}

export function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function mapColumnsToLetters(columnsKeys) {
  return columnsKeys.reduce((acc, key, index) => {
    const letter = String.fromCharCode(65 + index); // 65 is 'A' in ASCII
    acc[letter] = key;
    return acc;
  }, {});
}

export function extractNumber(input) {
  const match = input.match(/\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
  return match ? match[0].replace(/,/g, "") : null;
}

export function separatedByComma(...params) {
  return params.filter(Boolean).join(', ');
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function pdfUrlToBase64(url) {
  try {
    // Fetch the PDF file from the URL
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    // Convert the array buffer to a base64 string
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    return base64;
  } catch (error) {
    console.error("Error fetching the PDF:", error);
    return null;
  }
}

export function roundToPrecision(value, precision = 2) {
  let factor = Math.pow(10, precision);
  return Math.abs(Math.round(value * factor) / factor);
}

export function removeFirstCharacter(str) {
  return String(str).substring(1);
}

export async function getCategoryByRef(ref) {
  let [item] = await pool.query("SELECT * FROM t_category WHERE ref = ?", [
    ref,
  ]);
  return item;
}

export function convertNCF(ncf) {
  if (!ncf.ncf_sequence) return null;
  let array = 8 - String(ncf.ncf_sequence).length;
  let zeros = "";
  for (let i = 0; i < array; i++) {
    zeros += 0;
  }
  return ncf.prefix + zeros + ncf.ncf_sequence;
}

export function roundNumber(num) {
  if (num < 100) {
    // Round tens place to nearest 5
    return Math.round(num / 5) * 5;
  } else {
    const numLength = num.toString().length;
    if (numLength >= 4 && num > 2000) {
      // Round thousands place to nearest 50
      return Math.ceil(num / 50) * 50;
    } else {
      // Round hundreds place to nearest 10
      return Math.ceil(num / 10) * 10;
    }
  }
}

export function sortObjectByKey(o) {
  return Object.keys(o)
    .sort()
    .reduce((obj, key) => {
      obj[key] = o[key];
      return obj;
    }, {});
}

export function sortObjectByValue(obj) {
  // Convert object entries to array
  const entries = Object.entries(obj);

  // Sort array based on values
  entries.sort((a, b) => b[1] - a[1]);

  // Convert back to object
  const sortedObject = Object.fromEntries(entries);

  return sortedObject;
}

export function isDevEnvironment() {
  return process.env.NODE_ENV === "development" ? true : false;
}

export function formatToDecimalWithTwoPlaces(number) {
  if (typeof number !== "number") {
    throw new Error("Input must be a number");
  }

  return number.toFixed(2);
}

export function formatNumberWithCommasAndDecimals(number) {
  if (typeof number !== "number") {
    throw new Error("Input must be a number");
  }

  return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function numberToTextSpanish(number) {
  const units = [
    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];

  const teens = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];

  const tens = [
    "",
    "diez",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];

  const hundreds = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  if (number >= 0 && number < 10) {
    return units[number];
  } else if (number >= 10 && number < 20) {
    return teens[number - 10];
  } else if (number >= 20 && number < 100) {
    const tensDigit = Math.floor(number / 10);
    const unitsDigit = number % 10;
    return (
      tens[tensDigit] + (unitsDigit !== 0 ? " y " + units[unitsDigit] : "")
    );
  } else if (number >= 100 && number < 1000) {
    const hundredsDigit = Math.floor(number / 100);
    const remainingNumber = number % 100;
    return (
      hundreds[hundredsDigit] +
      (remainingNumber !== 0 ? " " + numberToTextSpanish(remainingNumber) : "")
    );
  } else if (number >= 1000 && number < 100000) {
    if (number === 1000) {
      return "mil";
    } else {
      const thousands = Math.floor(number / 1000);
      const remainingNumber = number % 1000;
      if (thousands === 1) {
        return (
          "mil" +
          (remainingNumber !== 0
            ? " " + numberToTextSpanish(remainingNumber)
            : "")
        );
      } else {
        return (
          numberToTextSpanish(thousands) +
          " mil" +
          (remainingNumber !== 0
            ? " " + numberToTextSpanish(remainingNumber)
            : "")
        );
      }
    }
  } else {
    return "Número fuera de rango";
  }
}

export function replaceTag(htmlString, originalTag, newTag) {
  // Use a regular expression to find the specified original tag with optional attributes and content
  const regex = new RegExp(
    `<${originalTag}\\b[^>]*>(.*?)<\\/${originalTag}>`,
    "gi"
  );

  // Replace the original tag with the specified new tag
  const replacedString = htmlString.replace(regex, `<${newTag}>$1</${newTag}>`);

  return replacedString;
}

export function addNbspToEmptyPTags(htmlString) {
  // Regular expression to match empty <p> tags
  const emptyPTagRegex = /<p(?:\s*|&nbsp;)*><\/p>/g;

  // Replace empty <p> tags with <p>&nbsp;</p>
  const htmlWithNbsp = htmlString.replace(emptyPTagRegex, "<p>&nbsp;</p>");

  return htmlWithNbsp;
}

export function removeNbspFromEmptyPTags(htmlString) {
  // Regular expression to match <p>&nbsp;</p>
  const nbspInPTagRegex = /<p(?:\s*|&nbsp;)*>&nbsp;<\/p>/g;

  // Replace <p>&nbsp;</p> with <p></p>
  const htmlWithoutNbsp = htmlString.replace(nbspInPTagRegex, "<p></p>");

  return htmlWithoutNbsp;
}

export function formatCStatus(c_status) {
  if (c_status & 2) {
    return "Inactivo";
  }
  if (c_status & 4) {
    return "Activo";
  }
}

export function removeLastComma(str) {
  // Regex pattern to match a comma at the end of the string
  const regex = /,(?=$)/;

  // Replace the comma if it's the last character
  const result = str.replace(regex, "");

  return result;
}

export function currency(
  number,
  currency = "USD",
  currencyDisplay = "narrowSymbol"
) {
  if (!number && number !== 0) {
    return 0;
  }
  if (isNaN(number)) {
    return 0;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: currencyDisplay,
  }).format(number);
}

export function cleanCurrency(currencyString) {
  if (!currencyString) {
    return null;
  }
  const cleanedString = String(currencyString).replace(/[^0-9.]/g, "");

  // Handle cases where multiple dots are present
  const sanitizedString = cleanedString.replace(/\.+/g, ".");

  const parsedNumber = parseFloat(sanitizedString);

  // Check if the parsed number is a valid number
  if (isNaN(parsedNumber)) {
    return 0;
  }

  return parsedNumber;
}

export function startPage(page, limit) {
  if (page > 1) {
    return (page - 1) * limit;
  } else {
    return 0;
  }
}

export function hexcode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export function binaryToArray(binaryNumber) {
  const result = [];
  let position = 1;

  while (binaryNumber > 0) {
    if (binaryNumber & 1) {
      result.push(position);
    }
    position <<= 1; // Left shift operation to move to the next bit
    binaryNumber >>= 1; // Right shift operation to move to the next bit
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
  const op = _constant.operation[m];

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
    value = JSON.stringify(value)
    newObj.where += ` AND JSON_OVERLAPS(??, ?)`;
    newObj.args.push(column, value);
    return newObj;
  }
  if (op === "JSON_SEARCH") {
    const [col, col_id] = column.split('|')
    newObj.where += ` AND JSON_SEARCH(??, 'all', ?, NULL, '$[*].${col_id || 'id'}') IS NOT NULL`;
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

export function prepareWhere(where) {
  let opts = {
    args: [],
    where: "",
  };

  for (const key in where) {
    const value = where[key];

    if (value === undefined) {
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
            opts.args.push(key, _date.convertToValidDate(v));
            continue;
          }
          if (k === "to") {
            opts.where += ` AND ?? <= ?`;
            opts.args.push(key, _date.getEndOfDay(_date.convertToValidDate(v)));
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
  // if (
  //   !where.hasOwnProperty("t_book.c_status") &&
  //   !where.hasOwnProperty("c_status") &&
  //   !where.hasOwnProperty("bi:c_status")
  // ) {
  //   opts.where += ` AND c_status = 4`;
  // }

  return opts;
}

export function isValidDate(dateStr) {
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return false;

  const [_, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isValidTime(timeStr) {
  const regex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/;
  return regex.test(timeStr);
}

function normalizeToUpperCase(value) {
  if (typeof value !== 'string') return value;
  return value.toLocaleUpperCase().trim();
}

export async function prepareData({ user, table, data, action = "CREATE", options }) {
  const _data = {};
  delete data.id;
  delete data.color;
  const columns = await _query.getColumns(table);
  const column_names = columns.map((i) => i.COLUMN_NAME);
  const column_type = columns.map((i) => i.COLUMN_TYPE);

  for (const key in data) {
    const value = data[key];
    const index = column_names.indexOf(key)
    if (index !== -1) {

      if (/^\$(.*?)_ids/.test(key)) {
        if (value.length) {
          const cat = key.replace(/^\$(.*?)_ids/, "$1");
          const cats = await _query.getCategoryMultiple(value);
          _data[cat] = JSON.stringify(cats.map((i) => normalizeToUpperCase(i.description)));
          _data[key] = JSON.stringify(value.map(String));
        } else {
          const cat = key.replace(/^\$(.*?)_ids/, "$1");
          _data[cat] = null;
          _data[key] = null;
        }
        continue;
      }

      if ([undefined, null, "null", "", 0].includes(value)) {
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
        const { description, color } = await _query.getCategoryById(value);
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

      // if (column_type[index] === 'datetime') {
      //   if (!isValidDateStrict(value)) {
      //     throw new BaseError(
      //       "NO DATA UPDATED",
      //       401,
      //       true,
      //       `La ${key} fecha es invalida.`,
      //       `La ${key} fecha es invalida.`
      //     );
      //   }
      // }

      if (table === 't_user' || table === 't_file' || ['link_gps', 'webpage', 'token', 'password', 'reset_password_token', 'instagram', 'linkedin', 'social'].includes(key)) {
        _data[key] = value
      } else {
        _data[key] = normalizeToUpperCase(value);
      }
    }
  }

  if (table === "t_privilege") {
    return _data;
  }

  switch (action) {
    case "CREATE":
      console.log(user);
      _data.account_id = user?.account_id || 1;
      _data.created_by = user?.description || 'System';
      _data.created_by_id = user?.id || 1;
      _data.created = _date.mysqlDateTime(new Date());
      break;
    case "UPDATE":
      delete _data.created;
      if (options?.modified) {
        _data.modified_by = user?.description || 'System';
        _data.modified_by_id = user?.id || 1;
        _data.modified = _date.mysqlDateTime(new Date());
      }

      if (_data.hasOwnProperty("modified_arr")) {
        const modified_arr = {
          modified_by: _data.modified_by,
          modified_by_id: _data.modified_by_id,
          modified: _data.modified,
          modified_format: _date.intlDateTime(new Date()),
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
