import { parse, set } from "date-fns";

export function getAMPMFromDate(dateString) {
  const date = new Date(dateString);

  // Get the hours in 24-hour format
  const hours = date.getUTCHours();

  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return `${ampm}`;
}

export function cleanTimeFormat(timeString) {
  return timeString.replace(/\s?[ap]\.\s?m\./gi, '').trim();
}

export function extractAMPM(timeString) {
  return /\ba\.\s?m\./i.test(timeString) ? 'AM' : 'PM';
}

export function mergeDateAndTime(date, time, amPm) {
  const [day, month, year] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // Adjust the hour based on AM/PM
  const formattedHour = amPm === "PM" && hour < 12 ? hour + 12 : amPm === "AM" && hour === 12 ? 0 : hour;

  // Create and return the Date object
  return new Date(year, month - 1, day, formattedHour, minute);
}

export function getCurrentTime() {
  const currentTime = new Date();
  const hours = String(currentTime.getHours()).padStart(2, "0");
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
export function addCurrentTime(date) {
  const currentTime = new Date();
  const newDate = set(new Date(date), {
    hours: String(currentTime.getHours()).padStart(2, "0"),
    minutes: String(currentTime.getMinutes()).padStart(2, "0"),
  });
  return new Date(newDate);
}

export function isBirthday(date) {
  const today = new Date();
  const birthDate = new Date(date);

  // Get today's month and day
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  // Get birthdate's month and day
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  // Compare month and day to check if it's the birthday
  return birthMonth === todayMonth && birthDay === todayDay;
}

export function convertToValidDateWithTime(dateString) {
  let delimiter = "/";
  if (dateString.includes("-")) {
    delimiter = "-";
  }
  // Split the date string by comma and space
  let parts = dateString.split(", ");

  // Extract the date part
  let datePart = parts[0];

  // Split the date part by slashes and space
  let dateParts = datePart.split(/[\/ ]/);

  // Parse the date components
  let day = parseInt(dateParts[0], 10);
  let month = parseInt(dateParts[1], 10) - 1; // Months are zero-indexed
  let year = parseInt(dateParts[2], 10);

  // Create a new Date object with the date components
  let dateWithoutTime = new Date(year, month, day);

  return dateWithoutTime;
}

convertToValidDateWithTime("12-09-2024");

export function convertReadableToValidDate(dateString) {
  const parsedDate = parse(dateString, "EEE, dd MMMM yyyy", new Date());


  return parsedDate;
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

export function getEndOfDay(date) {
  // Create a copy of the input date
  let endOfDay = new Date(date);

  // Set the time to the end of the day
  endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999

  return endOfDay; // Return the end of the day's date
}

export function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date);
}

export function calculateAge(birthdate) {
  // Parse the birthdate string into a Date object
  const dob = new Date(birthdate);

  // Get today's date
  const today = new Date();

  // Calculate the difference in milliseconds between the two dates
  const diffTime = Math.abs(today - dob);

  // Calculate the age in milliseconds
  const ageMilliseconds = new Date(diffTime).getFullYear() - 1970;

  // Get the age in years
  const age = Math.floor(ageMilliseconds);

  return age;
}

export function calculateReadableAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (days < 0) {
    months--;
    const tempDate = new Date(today.getFullYear(), today.getMonth(), 0);
    days = tempDate.getDate() - birth.getDate() + today.getDate();
  }

  let ageString = "";

  if (years > 0) {
    ageString += years + (years === 1 ? " año" : " años");
    return ageString;
  }

  if (months > 0) {
    ageString += months + (months === 1 ? " mes, " : " meses, ");
  }

  if (days > 0) {
    ageString += days + (days === 1 ? " día" : " días");
  }

  return ageString;
}

export function intlDateTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format(date).replace(/\//g, "-");
}

export function intlDate(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date).replace(/\//g, "-");
}

export function intlTime(date) {
  return new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function intlDay(date) {
  return cleanTimeFormat(new Intl.DateTimeFormat("es-DO", {
    weekday: "long",
  }).format(date));
}

export function intlTimeClean(date) {
  return cleanTimeFormat(new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "numeric",
  }).format(date));
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
    month: "short",
    day: "numeric",
  }).format(date).replace(/DE/gi, "");
}

export function intlReadbleDateLong(date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function addCurrentTimeToDate(date) {
  // Get the current time
  let currentTime = new Date().getTime(); // Get the current time in milliseconds

  // Set the time of the given date to the current time
  date.setHours(new Date(currentTime).getHours()); // Set hours to current time's hours
  date.setMinutes(new Date(currentTime).getMinutes()); // Set minutes to current time's minutes
  date.setSeconds(new Date(currentTime).getSeconds()); // Set seconds to current time's seconds

  return date; // Return the updated date
}

export function mysqlDateTime(date) {
  // Function to add leading zero if the number is single-digit
  const addZero = (number) => (number < 10 ? "0" + number : number);
  // Format date components to yyyy-MM-dd HH:mm:ss format
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(
    date.getSeconds()
  )}`;
}

export function mergeDateTime(startDate, startTime) {
  const dateSeparator = startDate.includes("/") ? "/" : "-";
  const dateParts = startDate.split(dateSeparator);
  const timeParts = String(startTime)
    .replace(/([ap])\.?\s*m\.?/i, "$1m")
    .match(/(\d+):(\d+) (\w{2})/);

  if (dateParts.length !== 3 || !timeParts) {
    throw new Error("Invalid date or time format");
  }

  const [day, month, year] = dateParts.map((part) => parseInt(part, 10));
  const [, hours, minutes, meridiem] = timeParts;

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid time format");
  }

  let adjustedHours = parseInt(hours, 10);

  if (meridiem.toLowerCase() === "pm" && adjustedHours < 12) {
    adjustedHours += 12;
  } else if (meridiem.toLowerCase() === "am" && adjustedHours === 12) {
    adjustedHours = 0; // 12 AM (midnight) is 0 in 24-hour format
  }

  const mergedDateTime = new Date(
    year,
    month - 1,
    day,
    adjustedHours,
    parseInt(minutes, 10)
  );

  if (isNaN(mergedDateTime.getTime())) {
    throw new Error("Invalid date or time values");
  }

  return mergedDateTime;
}

// export function formatDateTime(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');
//   const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

//   const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
//   return formattedDateTime;
// }

export function formatDateTime(inputDate) {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
  return formattedDateTime;
}
