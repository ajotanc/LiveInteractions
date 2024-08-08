import moment from "moment-timezone";
import cheerio from "cheerio";
import puppeteer, { type Browser } from "puppeteer-core";
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

export async function getContent(url: string, steam = false) {
  try {
    let browser: Browser;

    if (env.NODE_ENV === "production") {
      browser = await puppeteer.launch({
        args: [...chrome.args, "--accept-lang=pt-BR", "--lang=pt-BR"],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath(),
        headless: "new",
        ignoreHTTPSErrors: true,
      });
    } else {
      const executablePath = (await new Promise((resolve) =>
        locateChrome((arg) => resolve(arg)),
      )) as string;

      browser = await puppeteer.launch({
        headless: "new",
        executablePath,
      });
    }

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      "Accept-Language": "pt-BR",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    if (steam) {
      const hasAgeCheck = await page.evaluate(() => {
        return (
          !!document.querySelector("#ageDay") &&
          !!document.querySelector("#ageMonth") &&
          !!document.querySelector("#ageYear") &&
          !!document.querySelector("#view_product_page_btn")
        );
      });

      if (hasAgeCheck) {
        await page.type("#ageDay", "01");
        await page.type("#ageMonth", "08");
        await page.type("#ageYear", "1991");

        await page.click("#view_product_page_btn");
        await page.waitForNavigation();
      }
    }

    const content = await page.content();
    await browser.close();

    return cheerio.load(content);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Função para converter a data
export function convertDateToISO(dateStr: string): string | null {
  const dateRegex = /(\d{1,2})[\/\s*]([a-z]+)\.[\/?\s*](\d{4})/i;

  if (!dateStr || !dateRegex.test(dateStr)) {
    return null;
  }

  const monthMap = {
    "jan.": "01",
    "fev.": "02",
    "mar.": "03",
    "abr.": "04",
    "mai.": "05",
    "jun.": "06",
    "jul.": "07",
    "ago.": "08",
    "set.": "09",
    "out.": "10",
    "nov.": "11",
    "dez.": "12",
  };

  const [day, month, year] = dateStr.replace(/\s/, '/').split('/');
  const monthNumber = monthMap[month.toLowerCase()];

  const dateString = `${year}-${monthNumber}-${day.padStart(2, "0")}`;
  const date = moment(dateString, "YYYY-MM-DD");

  return date.format("YYYY-MM-DD");
}
