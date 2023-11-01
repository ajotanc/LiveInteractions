import moment from "moment-timezone";
import cheerio from "cheerio";
import { env } from "../env";

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

export function financingEndDate() {
  const currentDate = moment();
  const dateFormatted = moment(env.FINANCING_END_DATE_MAGISTRIKE, "YYYY-MM-DD");
  const days = dateFormatted.diff(currentDate, "days") + 1;
  return days;
}
