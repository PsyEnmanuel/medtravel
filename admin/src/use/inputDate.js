import { addDays, format } from "date-fns";
import { convertToValidDate } from "src/helpers/date";

export const useInputDate = () => {

  function nextDate(item, key) {
    const from = convertToValidDate(item[key])
    item[key] = format(addDays(from, 1), 'dd-MM-yyyy')
  }

  function prevDate(item, key) {
    const from = convertToValidDate(item[key])
    item[key] = format(addDays(from, -1), 'dd-MM-yyyy')
  }

  function subtractMinutes(item, key, intervals = 15) {
    if (!item[key]) {
      item[key] = '00:00'
    }
    // Extract hours and minutes from item[key] (in "hh:mm" format)
    const periodKey = `${key}_format`

    let [hours, minutes] = item[key].split(":").map(Number);
    let period = item[periodKey].toUpperCase(); // "AM" or "PM"

    // Convert hours to 24-hour format if it's PM
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Subtract the interval from the total minutes
    let totalMinutes = hours * 60 + minutes - intervals;

    // Handle negative time (e.g., going back before midnight)
    if (totalMinutes < 0) {
      totalMinutes = (24 * 60) + totalMinutes; // Wrap around to the previous day
    }

    // Calculate new hours and minutes
    const newHours = Math.floor((totalMinutes / 60) % 24); // Keep it in 24-hour format
    const newMinutes = totalMinutes % 60;

    // Determine the new period (AM/PM)
    const newPeriod = newHours >= 12 ? "PM" : "AM";

    // Convert back to 12-hour format
    const displayHours = newHours % 12 || 12; // Convert 0 and 12 to 12 for 12-hour format

    // Format the new time as HH:MM
    const formattedTime = `${displayHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;

    // Update the object's properties
    item[periodKey] = newPeriod; // Update the period
    item[key] = formattedTime; // Update time without AM/PM suffix
  }

  function addMinutes(item, key, intervals = 15) {
    if (!item[key]) {
      item[key] = '00:00'
    }
    // Extract hours and minutes from item[key] (in "hh:mm" format)
    const periodKey = `${key}_format`
    let [hours, minutes] = item[key].split(":").map(Number);
    let period = item[periodKey].toUpperCase(); // "AM" or "PM"

    // Convert hours to 24-hour format if it's PM
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Add the interval to the total minutes
    let totalMinutes = hours * 60 + minutes + intervals;

    // Calculate new hours and minutes
    const newHours = Math.floor((totalMinutes / 60) % 24); // Keep it in 24-hour format
    const newMinutes = totalMinutes % 60;

    // Determine the new period (AM/PM)
    const newPeriod = newHours >= 12 ? "PM" : "AM";

    // Convert back to 12-hour format
    const displayHours = newHours % 12 || 12; // Convert 0 and 12 to 12 for 12-hour format

    // Format the new time as HH:MM
    const formattedTime = `${displayHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;

    // Update the object's properties
    item[periodKey] = newPeriod; // Update the period
    item[key] = formattedTime; // Update time without AM/PM suffix
  }

  return {
    subtractMinutes,
    addMinutes,
    nextDate,
    prevDate
  };
};
