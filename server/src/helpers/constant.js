export const operation = {
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
  regexp: "REGEXP",
};

export const permissions = {
  owner_read: 256,
  owner_write: 128,
  owner_delete: 64,
  role_read: 32,
  role_write: 16,
  role_delete: 8,
  other_read: 4,
  other_write: 2,
  other_delete: 1,
};

export const codes = {
  t_file: 90000000,
  t_insured: 1000000,
  t_policy: 5000000,
  t_lodging: 4000000,
  t_customer: 1000000,
  t_history: 200000000,
  t_prescription: 300000000,
  t_cosmiatry: 300000000,
  t_template: 2000,
  t_provider: 2000,
  t_catalogue: 4000000,
  t_book: 90000000,
  t_inventory: 80000000,
  t_event: 70000000,
  t_broker: 400000,
  t_doctor: 300000,
  t_contact: 300000,
  t_task: 300000,
  t_itinerary: 200000000,
};

export const sizes = [
  { type: "thumb", resize: 300 },
  { type: "small", resize: 750 },
];

export const tableWithNoAccountId = ["t_role", "t_privilege", "t_account"];
