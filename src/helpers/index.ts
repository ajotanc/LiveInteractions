import cheerio from "cheerio";
import puppeteer from "puppeteer";

export function capitalizeFirstLetter(word: string): string {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return word;
}

export function extractData(html: string | Buffer) {
  const $ = cheerio.load(html);
  return $;
}

export async function getPageContent(url: string) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url);

  const content = await page.content();
  await browser.close();

  return content;
}
