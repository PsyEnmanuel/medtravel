import Ajv from "ajv";
import AjvErrors from "ajv-errors";
const ajv = new Ajv({ allErrors: true });
AjvErrors(ajv)

ajv.addKeyword("$isNotEmpty", {
  type: "string",
  validate: function (schema, data) {
    return typeof data === "string" && data.trim() !== "";
  },
  errors: false,
});

export default (schema) => {
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
