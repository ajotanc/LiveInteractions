import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../../env";
import { getContent, convertDateToISO } from "../../../helpers";

process.setMaxListeners(0);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

interface Summary {
  description: string;
  tags: string[];
  developers: string[];
  distributors: string[];
  releaseDate: string;
  image: string;
}

interface Games {
  name: string;
  value: number;
  url: string;
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

  const $ = await getContent(
    "https://store.steampowered.com/charts/mostplayed/",
  );

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

    const summary = await getInfo(label, url);

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

export async function getInfo(name: string, url: string): Promise<Summary> {
  const { data } = await supabase
    .from("games")
    .select("description, tags, developers, distributors, releaseDate, image")
    .eq("name", name)
    .single();

  if (data) {
    return data;
  }

  const $ = await getContent(url, true);

  const infos = $("#game_highlights").find(".glance_ctn");
  const description = infos.find(".game_description_snippet").text().trim();

  const date = infos.find(".release_date").find(".date").text().trim();
  const releaseDate = convertDateToISO(date);

  const image = infos.find("#gameHeaderImageCtn").find("img").attr("src");

  const allDevelopers = infos.find("#developers_list").find("a");
  const developers = [];

  allDevelopers.each((_, element) => {
    const value = $(element).text().trim();
    developers.push(value);
  });

  const distributors = [];
  const allDistributors = infos.find(".dev_row").last().find("a");

  allDistributors.each((_, element) => {
    const value = $(element).text().trim();
    distributors.push(value);
  });

  const allTags = infos.find("#glanceCtnResponsiveRight").find(".app_tag");

  const tags = [];

  allTags.each((_, element) => {
    const value = $(element).text().trim();

    if (value !== "+") {
      tags.push(value);
    }
  });

  const gameInfo = {
    name,
    description,
    tags,
    developers,
    distributors,
    image,
    releaseDate,
  };

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
): Promise<Summary> {
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

  const { data, error } = await supabase
    .from("games")
    .update(updateGame)
    .eq("name", name);

  if (error) {
    throw error;
  }

  console.log(`Game updated: ${name}`);
  return data as Summary;
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
