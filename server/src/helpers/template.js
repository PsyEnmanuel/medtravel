import ejs from "ejs";
import path from "path";
import { _utility } from "./index.js";

export const getBody = async ({ table, data, account, file = "body" }) => {
  try {
    return await ejs.renderFile(
      path.join(path.resolve(), `views/template/pdf/${table}/${file}.ejs`),
      {
        data,
        account,
      }
    );
  } catch (err) {
    console.log(err);
  }
};