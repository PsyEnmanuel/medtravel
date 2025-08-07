import { format, parse } from "date-fns";

export function isValidDate(dateStr) {
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return false;

  const [_, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isValidTime(timeStr) {
  const regex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/;
  return regex.test(timeStr);
}

export function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('-');
  return `${year}/${month}/${day}`;
}

export function getCurrentDateFormatted(currentDate) {
  let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  let dateFormatter = new Intl.DateTimeFormat('en-US', options);
  return dateFormatter.format(currentDate);
}

export function addDaysToDate(startDate, daysToAdd) {
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

export function removeDaysToDate(startDate, daysToAdd) {
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

export function convertToValidDate(dateString) {
  let delimiter = "/";
  if (dateString.includes("-")) {
    delimiter = "-";
  }

  const [day, month, year] = dateString.split(delimiter).map(Number);

  // The month is 0-indexed in JavaScript Date, so subtract 1 from the month
  const convertedDate = new Date(year, month - 1, day);

  return convertedDate;
}

export function readableDate(dateString) {
  if (dateString) {
    return format(parse(dateString, 'dd-MM-yyyy', new Date()), 'EEE, dd MMMM yyyy');
  } else {
    return null;
  }
}

export function setYearForDate(dateString, desiredYear) {
  const currentDate = new Date(dateString);
  const newDate = new Date(
    desiredYear,
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );

  return newDate;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function formatDate2(inputDate) {
  // Extract year, month, and day parts using slice()
  const year = inputDate.slice(0, 4);
  const month = inputDate.slice(5, 7);
  const day = inputDate.slice(8, 10);

  // Concatenate parts with '/' separator in the MM/dd/yyyy format
  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate;
}

export function intlTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function intlDateTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function intlDate(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function intlReadbleDateTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function intlReadbleDate(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function getMonthAbbreviation(date) {
  try {
    const options = { month: "short", locale: "es-DO" };

    const monthAbbreviation = new Intl.DateTimeFormat("es-DO", options)
      .formatToParts(date)
      .find((part) => part.type === "month").value;

    return monthAbbreviation.substring(0, 3);
  } catch (error) {
    console.error("Error:", error);
    return null; // Return null or handle the error accordingly in your application
  }
}

export function eachDayOfInterval(startDate, endDate) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error("Both startDate and endDate should be Date objects");
  }

  if (isNaN(startDate) || isNaN(endDate)) {
    throw new Error("Invalid date");
  }

  if (startDate > endDate) {
    throw new Error("startDate must be before endDate");
  }

  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function checkSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function checkIsWeekend(date) {
  const day = date.getDay();
  return day === 6 || day === 0;
}

export function checkIsInRange(date, startDate, endDate) {
  if (!startDate || !endDate) {
    return false;
  }

  return date > startDate && date < endDate;
}

export function getEndOfDateTime(dateTime) {
  const date = new Date(dateTime); // Create a Date object from the provided date and time

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  const endOfDateTime = new Date(date); // Create a copy of the provided date and time

  endOfDateTime.setDate(endOfDateTime.getDate() + 1); // Move to the beginning of the next day
  endOfDateTime.setMilliseconds(endOfDateTime.getMilliseconds() - 1); // Subtract 1 millisecond to get the end of the current day

  return endOfDateTime;
}