import { Notify } from "quasar";

Notify.registerType("error", {
  icon: "sym_o_report",
  color: "red-2",
});

Notify.registerType("warning", {
  icon: "sym_o_warning",
  color: "orange-2",
});

Notify.registerType("info", {
  icon: "sym_o_error",
  color: "cyan-2",
});

Notify.registerType("success", {
  icon: "sym_o_thumb_up",
  color: "green-2",
});

Notify.registerType("priority", {
  icon: "sym_o_priority_high",
  color: "dark-2",
  textColor: "white",
});

Notify.registerType("ongoing", {
  spinner: true,
  color: "cyan-2",
});
