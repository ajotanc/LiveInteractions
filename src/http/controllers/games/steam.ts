import { createClient } from "@supabase/supabase-js";
import { string, z } from "zod";

import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../../env";
import { getContent, convertDateToISO } from "../../../helpers";

process.setMaxListeners(0);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

interface Summary {
  name: string;
  description: string;
  url: string;
  tags: string[];
  developers: string[];
  distributors: string[];
  releaseDate: string;
  image: string;
}

interface Games {
  name: string;
  value: number;
  summary: Summary;
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

  const $ = await getContent(
    "https://store.steampowered.com/charts/mostplayed/",
  );

  const rows = $('[data-featuretarget="react-root"]')
    .find("table tbody")
    .find("tr")
    .slice(0, Number.parseInt(top));

  const gamesPromises = rows.toArray().map(async (element) => {
    const label = $(element).find("td:eq(2) a > div").text().trim();
    const url = $(element).find("td:eq(2) a").attr("href");
    const value = Number.parseInt(
      $(element).find("td:eq(5)").text().trim().replace(/\D/g, ""),
    );

    return {
      label,
      value,
      summary: await getInfo(label, url),
    };
  });

  const games = await Promise.all(gamesPromises);
  return games as unknown as Games[];
}
// export async function mostPlayed(request: FastifyRequest): Promise<Games[]> {
//   const choices = ["1", "2", "3", "4", "5", "10", "25", "50", "75", "100"] as [
//     string,
//     ...string[],
//   ];

//   const mostPlayedQuerySchema = z.object({
//     top: z.enum(choices).default("10"),
//   });

//   const { top } = mostPlayedQuerySchema.parse(request.query);

//   const today = new Date();
//   const dateStr = today.toISOString().split("T")[0];
//   const filename = `${dateStr}-${top}.json`;

//   const { data: fileExists } = await supabase.storage
//     .from("most-played")
//     .download(filename);

//   if (fileExists) {
//     const fileContent = await fileExists.text();
//     return JSON.parse(fileContent);
//   }

//   const $ = await getContent(
//     "https://store.steampowered.com/charts/mostplayed/",
//   );

//   const games = [];

//   const rows = $('[data-featuretarget="react-root"]')
//     .find("table tbody")
//     .find("tr")
//     .filter((index) => index < Number.parseInt(top));

//   for (const element of rows.toArray()) {
//     const label = $(element).find("td:eq(2) a > div").text().trim();
//     const url = $(element).find("td:eq(2) a").attr("href");
//     const value = Number.parseInt(
//       $(element).find("td:eq(5)").text().trim().replace(/\D/g, ""),
//     );

//     const summary = await getInfo(label, url);

//     games.push({
//       label,
//       value,
//       url,
//       summary,
//     });
//   }

//   const jsonData = JSON.stringify(games, null, 2);
//   const buffer = Buffer.from(jsonData);

//   const { error: uploadError } = await supabase.storage
//     .from("most-played")
//     .upload(filename, buffer, {
//       contentType: "application/json",
//     });

//   if (uploadError) {
//     throw uploadError;
//   }

//   return games;
// }

async function getSummary(name: string): Promise<Summary> {
  const { data } = await supabase
    .from("games")
    .select("*")
    .eq("name", name)
    .single();

  return data as Summary;
}

export async function getInfo(name: string, url: string): Promise<Summary> {
  const summary = await getSummary(name);

  if (summary) {
    return summary;
  }

  const $ = await getContent(url, true);

  const infos = $("#game_highlights").find(".glance_ctn");
  const description = infos.find(".game_description_snippet").text().trim();

  const date = infos.find(".release_date").find(".date").text().trim();
  const releaseDate = convertDateToISO(date);

  const image = infos.find("#gameHeaderImageCtn").find("img").attr("src");

  const developers = [...infos
    .find("#developers_list")
    .find("a")
    .map((_, element) => $(element).text().trim())];

  const distributors = [...infos
    .find(".dev_row")
    .last()
    .find("a")
    .map((_, element) => $(element).text().trim())];

  const tags = [...infos
    .find("#glanceCtnResponsiveRight")
    .find(".app_tag")
    .map((_, element) => {
      const value = $(element).text().trim();
      return value !== "+" ? value : null;
    })].filter(Boolean);

  const gameInfo = {
    name,
    description,
    url,
    tags,
    developers,
    distributors,
    releaseDate,
    image,
  } as Summary;

  const { error: insertError } = await supabase
    .from("games")
    .insert([gameInfo]);

  if (insertError) {
    throw insertError;
  }

  return gameInfo;
}

export async function updateGame(
  name: string,
  url: string,
  column: string,
): Promise<Summary | null> {
  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("name", name)
    .not("releaseDate", "is", null)
    .single();

  if (game) {
    return game as Summary;
  }

  const $ = await getContent(url, true);

  const updateGame = {} as Games;

  const infos = $("#game_highlights").find(".glance_ctn");

  switch (column) {
    case "description":
      Object.assign(updateGame, {
        [column]: infos.find(".game_description_snippet").text().trim(),
      });
      break;
    case "image":
      Object.assign(updateGame, {
        [column]: infos.find("#gameHeaderImageCtn").find("img").attr("src"),
      });
      break;
    case "date":
      {
        const date = infos.find(".release_date").find(".date").text().trim();
        const releaseDate = convertDateToISO(date);

        Object.assign(updateGame, { releaseDate });
      }
      break;
  }

  const { error } = await supabase
    .from("games")
    .update(updateGame)
    .eq("name", name);

  if (error) {
    throw error;
  }

  console.log(`Game updated: ${name}`);
}

// export async function updateGame(
//   request: FastifyRequest<{
//     Params: { name: string; url: string; column: string };
//   }>,
//   reply: FastifyReply,
// ): Promise<Games> {
//   const { name, url, column } = request.params;

//   const $ = await getContent(url, true);

//   const updateGame = {} as Games;

//   const infos = $("#game_highlights").find(".glance_ctn");

//   switch (column) {
//     case "description":
//       Object.assign(updateGame, {
//         [column]: infos.find(".game_description_snippet").text().trim(),
//       });
//       break;
//          case "image":
//       Object.assign(updateGame, {
//         [column]:  infos.find("#gameHeaderImageCtn").find("img").attr("src")
//       });
//       break;
//     case "date":
//       {
//         const date = infos.find(".release_date").find(".date").text().trim();
//         const releaseDate = convertDateToISO(date);

//         Object.assign(updateGame, { releaseDate });
//       }
//       break;
//   }

//   const { data, error } = await supabase
//     .from("games")
//     .update(updateGame)
//     .eq("name", name)
//     .single();

//   if (error) {
//     throw error;
//   }

//   return data as Games;
// }
