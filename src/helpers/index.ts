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
