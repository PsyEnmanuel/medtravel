import { boot } from "quasar/wrappers";
import { Platform } from "quasar";
import { currency } from "src/helpers";
import local from "src/helpers/local";

import ManSvg from "assets/placeholder-man.svg";
import WomanSvg from "assets/placeholder-woman.svg";
import HumanSvg from "assets/placeholder-human.svg";
import ManDoctorSvg from "assets/placeholder-man-doctor.svg";
import WomanDoctorSvg from "assets/placeholder-woman-doctor.svg";
import NotFound from "assets/placeholder-notfound.svg";

import { setDefaultOptions } from 'date-fns';
import { es } from 'date-fns/locale';

export default boot(({ app }) => {
  app.config.globalProperties.$isDesktop = Platform.is.desktop;
  app.provide("$isDesktop", Platform.is.desktop);
  app.provide("$currency", currency);
  app.provide("$local", local);

  setDefaultOptions({ locale: es });

  app.config.globalProperties.$imageInsuredPlaceholder = (sex) => {
    if (sex === "Masculino") {
      return ManSvg;
    } else if (sex === "Femenino") {
      return WomanSvg;
    } else return HumanSvg;
  };
  app.config.globalProperties.$imageDoctorPlaceholder = (sex) => {
    if (sex === "Masculino") {
      return ManDoctorSvg;
    } else if (sex === "Femenino") {
      return WomanDoctorSvg;
    } else return NotFound;
  };
  app.config.globalProperties.$currency = currency
});
