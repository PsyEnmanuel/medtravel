import { defineStore } from "pinia";
import { useUserStore } from "./user";

export const useUpdateStore = defineStore("update", {
  state: () => ({
    table: {
      t_user: {
        version: 0,
        id: null,
        item: {},
      },
      t_event: {
        version: 0,
        id: null,
        item: {},
      },
      t_book: {
        version: 0,
        id: null,
        item: {},
      },
      t_provider: {
        version: 0,
        id: null,
        item: {},
      },
      t_doctor: {
        version: 0,
        id: null,
        item: {},
      },
      t_catalogue: {
        version: 0,
        id: null,
        item: {},
      },
      t_category: {
        version: 0,
        id: null,
        item: {},
      },
      t_speciality: {
        version: 0,
        id: null,
        item: {},
      },
      t_insurance: {
        version: 0,
        id: null,
        item: {},
      },
      t_account: {
        version: 0,
        id: null,
        item: {},
      },
      t_insured: {
        version: 0,
        id: null,
        item: {},
      },
      t_policy: {
        version: 0,
        id: null,
        item: {},
      },
      t_file: {
        version: 0,
        id: null,
        item: {},
      },
      t_customer: {
        version: 0,
        id: null,
        item: {},
      },
      t_contact: {
        version: 0,
        id: null,
        item: {},
      },
      t_log: {
        version: 0,
        id: null,
        item: {},
      },
      t_comment: {
        version: 0,
        id: null,
        item: {},
      },
      t_itinerary: {
        version: 0,
        id: null,
        item: {},
      },
      t_task: {
        version: 0,
        id: null,
        item: {},
      },
      t_prescription: {
        version: 0,
        id: null,
        item: {},
      },
      t_role: {
        version: 0,
        id: null,
        item: {},
      },
      t_lodging: {
        version: 0,
        id: null,
        item: {},
      },
      t_broker: {
        version: 0,
        id: null,
        item: {},
      },
      t_version: {
        version: 0,
        id: null,
        item: {},
      },
    },
  }),
  actions: {
    setUpdate(data) {
      if (data.table === 't_version') {
        this.table[data.table].version = data.version;
        return;
      }
      if (data.id) {
        this.table[data.table].id = +data.id;
      }
      ++this.table[data.table].version;
    },
  },
});
