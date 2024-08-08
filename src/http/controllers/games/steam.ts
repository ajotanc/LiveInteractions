import { createClient } from "@supabase/supabase-js";
import { string, z } from "zod";

import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../../env";
import { getContent, convertDateToISO } from "../../../helpers";

process.setMaxListeners(0);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

const regexSteamId = /\/app\/(\d+)\//;

interface Game {
  value?: number;
  id?: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  developers: string[];
  distributors: string[];
  releaseDate: string;
  image: string;
  steamId?: string;
}

export async function mostPlayed(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
    const name = $(element).find("td:eq(2) a > div").text().trim();
    const [_, steamId] = $(element).find("td:eq(2) a").attr("href").match(regexSteamId);

    const value = Number.parseInt(
      $(element).find("td:eq(5)").text().trim().replace(/\D/g, ""),
    );

    return {
      value,
      ...(await getInfo(steamId, name)),
    };
  });

  const games = await Promise.all(gamesPromises);
  
  reply.send(games);
}

async function getGame(steamId: string): Promise<Game> {
  const { data } = await supabase
    .from("games")
    .select("name, description, url, tags, developers, distributors, releaseDate, image")
    .eq("steamId", Number.parseInt(steamId))
    .single();

  return data;
}

async function getAllGame(): Promise<Game[]> {
  const { data } = await supabase.from("games").select("*");

  return data;
}

export async function getInfo(steamId: string, name: string): Promise<Game> {
  const game = await getGame(steamId);

  if (game) {
    return game;
  }

  const url = `https://store.steampowered.com/app/${steamId}`;
  const image = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/header.jpg`
  
  const $ = await getContent(url, true);

  const infos = $("#game_highlights").find(".glance_ctn");
  const description = infos.find(".game_description_snippet").text().trim();

  const date = infos.find(".release_date").find(".date").text().trim();
  const releaseDate = convertDateToISO(date);

  const developers = [
    ...infos
      .find("#developers_list")
      .find("a")
      .map((_, element) => $(element).text().trim()),
  ];

  const distributors = [
    ...infos
      .find(".dev_row")
      .last()
      .find("a")
      .map((_, element) => $(element).text().trim()),
  ];

  const tags = [
    ...infos
      .find("#glanceCtnResponsiveRight")
      .find(".app_tag")
      .map((_, element) => {
        const value = $(element).text().trim();
        return value !== "+" ? value : null;
      }),
  ].filter(Boolean);

  const gameInfo = {
    name,
    description,
    url,
    tags,
    developers,
    distributors,
    releaseDate,
    image,
  } as Game;

  const { error: insertError } = await supabase
    .from("games")
    .insert([gameInfo]);

  if (insertError) {
    throw insertError;
  }

  return gameInfo;
}