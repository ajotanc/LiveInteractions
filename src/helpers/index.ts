import moment from "moment-timezone";
import cheerio from "cheerio";
import puppeteer, { type Browser }  from "puppeteer-core";
import locateChrome from "locate-chrome";
import chrome from "@sparticuz/chromium";

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
  console.log(data);
  const content = cheerio.load(data);

  return content;
}

export function financingEndDate() {
  const currentDate = moment();
  const dateFormatted = moment(env.FINANCING_END_DATE_MAGISTRIKE);

  const days = dateFormatted.diff(currentDate, "days") + 1;
  return days;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function getContent(url: string) {
  try {
    let browser: Browser

    if (env.NODE_ENV === "production") {
      browser = await puppeteer.launch({
        args: [...chrome.args, "no-sandbox", "disable-setuid-sandbox"],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath(),
        headless: "new",
        ignoreHTTPSErrors: true
      })
    } else {
      const executablePath = await new Promise(resolve => locateChrome(arg => resolve(arg))) as string;
      
      browser = await puppeteer.launch({
        headless: "new",
        executablePath,
        args: ["no-sandbox", "disable-setuid-sandbox"],
      })
    }
    
    const page = await browser.newPage();
  
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
  
    const content = await page.content();
    await browser.close();
  
    return cheerio.load(content);
  } catch (error) {
    console.log(error)
    throw error;
  }
}