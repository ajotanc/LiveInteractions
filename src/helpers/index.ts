import cheerio from "cheerio";

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
  const months = {
    janeiro: 0,
    fevereiro: 1,
    marco: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  };

  const [day, month, year] = string.split(" de ");

  const monthInLength = stringRepleace(month.toLowerCase());
  const indexMonth = months[monthInLength];

  const date = new Date(parseInt(year), indexMonth, parseInt(day));

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
  const firstDate = new Date().setUTCHours(12, 0, 0, 0);
  const secondDate = date.setUTCHours(12, 0, 0, 0);

  const diffInMs = Math.abs(secondDate - firstDate);
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return days;
}
