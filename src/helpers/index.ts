import cheerio from "cheerio";
import moment from "moment-timezone";

moment.locale("pt-br");

export function capitalizeFirstLetter(word: string) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return word;
}

export async function extractData(url: string) {
  const response = await fetch(url);
  const data = await response.text();
  const content = cheerio.load(data);

  return content;
}

export function convertStringDate(string: string) {
  const [day, month, year] = string.split(" de ");
  const indexMonth = moment().month(month).month() + 1;
  const date = moment(`${year}-${indexMonth}-${day}`, "YYYY-MM-DD");

  return date;
}

export function stringRepleace(string: string) {
  return string
    .replace(/[áàãâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòõôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/[ç]/g, "c");
}

export function diffDays(date) {
  const currentDate = moment();
  const dateFormatted = moment(date, "YYYY-MM-DD");
  const days = dateFormatted.diff(currentDate, "days") + 1;
  return days;
}
