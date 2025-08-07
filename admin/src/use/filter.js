import { inject, onMounted, ref } from "vue";

export const useFilter = (options) => {
  const $cats = inject("$cats");
  const $api = inject("$api");
  const $me = inject("$me");

  const compareStrings = (s1, s2) => {
    const normalizedS1 = String(s1).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedS2 = String(s2).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalizedS1.includes(normalizedS2);
  };

  const filter = (val, options) => {
    if (val === "") return options;
    const needle = val.toLowerCase();
    return options.filter((v) => {
      if (v.label) {
        return compareStrings(v.label, needle);
      } else {
        return false;
      }
    });
  };
  
  const filterFnCategory = (val, update, abort, cat) => {
    update(
      () => {
        options[cat] = filter(val, $cats.value[cat]);
      },
      (ref) => {
        if (val !== "" && ref.options.length > 0) {
          ref.setOptionIndex(-1);
          ref.moveOptionSelection(1, true);
        }
      }
    );
  };

  const filterFnCities = (val, update, abort, key) => {
    update(
      () => {
        options[key] = filter(val, map);
      },
      (ref) => {
        if (val !== "" && ref.options.length > 0) {
          ref.setOptionIndex(-1);
          ref.moveOptionSelection(1, true);
        }
      }
    );
  };

  const filterFn = (val, update, abort, key, stringOptions) => {
    update(
      () => {
        options[key] = filter(val, stringOptions).slice(0, 10);
      },
      (ref) => {
        if (val !== "" && ref.options.length > 0) {
          ref.setOptionIndex(-1);
          ref.moveOptionSelection(1, true);
        }
      }
    );
  };

  async function getInsureds(val) {
    const query = {
      order: {
        description: "ASC",
      },
      where: {
        c_status: 4,
      },
      limit: 10,
      returnItems: true,
    };

    if (val) {
      query.where = {
        ["orlike:description,ident_no,phone"]: val,
        c_status: 4,
        high_profile: $me.high_profile ? null : 0,
      };
    }
    return await $api.get(`insured`, {
      params: query,
    });
  }

  async function filterFnInsured(val, update) {
    if (val === "") {
      update(async () => {
        if (!val) {
          options.insureds = [];
        } else {
          options.insureds = await getInsureds(val);
        }
      });
      return;
    } else {
      options.insureds = await getInsureds(val);
    }

    update(
      async () => {},
      (ref) => {
        if (val !== "" && ref.options.length > 0) {
          ref.setOptionIndex(-1);
          ref.moveOptionSelection(1, true);
        }
      }
    );
  }

  async function getProviders(val) {
    const query = {
      order: {
        description: "ASC",
      },
      limit: 10,
      returnItems: true,
    };

    if (val) {
      query.where = {
        ["orlike:description"]: val,
        c_status: 4,
      };
    }
    return await $api.get(`provider`, {
      params: query,
    });
  }

  async function filterFnProvider(val, update) {
    if (val === "") {
      update(async () => {
        if (!val) {
          options.providers = [];
        } else {
          options.providers = await getProviders(val);
        }
      });
      return;
    } else {
      options.providers = await getProviders(val);
    }

    update(
      async () => {},
      (ref) => {
        if (val !== "" && ref.options.length > 0) {
          ref.setOptionIndex(-1);
          ref.moveOptionSelection(1, true);
        }
      }
    );
  }

  return {
    filterFnCategory,
    filterFnCities,
    filterFnInsured,
    filterFnProvider,
    filterFn,
  };
};



