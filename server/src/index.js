import "../config.js";
// import "../src/utils/groupICD10.js"
import "../src/fix/icd10.js"

import createServer from "./utils/server.js";

const server = createServer();
import "./fix/policy.js";

server.listen(process.env.PORT, () =>
  console.log(
    `API SERVER: http://localhost:${process.env.PORT} - ${new Date()}`
  )
);