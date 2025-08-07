import { boot } from "quasar/wrappers";
import io from "socket.io-client";
import { useUpdateStore } from "src/stores/update";

const socket =
  process.env.NODE_ENV === "production"
    ? io("https://app.medtravel.do/")
    : io(":5033");

export default boot(() => {
  const updateStore = useUpdateStore();
  socket.on("update", function (data) {
    updateStore.setUpdate(data);
  });
});
