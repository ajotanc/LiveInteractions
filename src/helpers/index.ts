import axios from "axios";
import cheerio from "cheerio";

export function capitalizeFirstLetter(word: string): string {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return word;
}

export async function extractData() {
  const url = "https://www.gamesatlas.com/cod-warzone-2/weapons/";
  const { data } = await axios.get(url);

  const content = cheerio.load(data);
  return content;
}
