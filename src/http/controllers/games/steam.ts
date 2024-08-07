import cheerio from "cheerio";
import puppeteer  from "puppeteer";
import puppeteerCore from "puppeteer-core";
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from "chrome-aws-lambda";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { FastifyRequest } from "fastify";

import { env } from "../../../env";

// puppeteer.use(StealthPlugin());
process.setMaxListeners(0);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

interface Summary {
  description: string;
  review: string;
  top: number;
  tags: string[];
}

interface Games {
  name: string;
  value: number;
  url: string;
  summary: Summary;
}

export default async function getContent(url: string) {
  let options = {};
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let puppeteerBrowser: any;

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    puppeteerBrowser = puppeteerCore;
    options = {
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  } else {
    puppeteerBrowser = puppeteer;
    options = {
      headless: true,
      ignoreHTTPSErrors: true,
    }
  }

  try {
    const browser = await puppeteerBrowser.launch(options);
    const page = await browser.newPage();
  
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
  
    const content = await page.content();
    await browser.close();
  
    return content;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export async function mostPlayed(request: FastifyRequest): Promise<Games[]> {
  const choices = ["1", "2", "3", "4", "5", "10", "25", "50", "75", "100"] as [
    string,
    ...string[],
  ];

  const mostPlayedQuerySchema = z.object({
    top: z.enum(choices).default("10"),
  });

  const { top } = mostPlayedQuerySchema.parse(request.query);

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const filename = `${dateStr}-${top}.json`;

  const { data: fileExists } = await supabase.storage
    .from("most-played")
    .download(filename);

  if (fileExists) {
    const fileContent = await fileExists.text();
    return JSON.parse(fileContent);
  }

  const content = await getContent(
    "https://store.steampowered.com/charts/mostplayed/",
  );
  const $ = cheerio.load(content);

  const games = [];

  const rows = $('[data-featuretarget="react-root"]')
    .find("table tbody")
    .find("tr")
    .filter((index) => index < Number.parseInt(top));

  for (const element of rows.toArray()) {
    const label = $(element).find("td:eq(2) a > div").text().trim();
    const url = $(element).find("td:eq(2) a").attr("href");
    const value = Number.parseInt(
      $(element).find("td:eq(5)").text().trim().replace(/\D/g, ""),
    );

    const summary = await getInfo(url);
    games.push({
      label,
      value,
      url,
      summary,
    });
  }

  const jsonData = JSON.stringify(games, null, 2);
  const buffer = Buffer.from(jsonData);

  const { error: uploadError } = await supabase.storage
    .from("most-played")
    .upload(filename, buffer, {
      contentType: "application/json",
    });

  if (uploadError) {
    throw uploadError;
  }

  return games;
}

export async function getInfo(url: string): Promise<Summary> {
  const content = await getContent(url);
  const $ = cheerio.load(content);

  const infos = $("#game_highlights").find(".glance_ctn");
  const description = infos.find(".game_description_snippet").text().trim();

  const summary = $("#userReviews").find(".user_reviews_summary_row").last();

  const review = summary.find(".game_review_summary").text().trim();
  const top = Number.parseInt(
    summary.find(".responsive_hidden").text().replace(/\D/g, ""),
  );

  const allTags = infos.find("#glanceCtnResponsiveRight").find(".app_tag");

  const tags = [];

  allTags.each((_, element) => {
    const value = $(element).text().trim();

    if ($(element).css("display") !== "none" && value !== "+") {
      tags.push(value);
    }
  });

  return {
    description,
    review,
    top,
    tags,
  };
}
