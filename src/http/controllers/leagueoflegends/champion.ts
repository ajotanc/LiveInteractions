import { FastifyRequest, FastifyReply } from "fastify";
import { ChampionNotFound } from "@/errors/champion-not-found";
import { z } from "zod";

export async function lastVersion() {
  const lastVersion = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
  );

  const [version] = await lastVersion.json();
  return version;
}

export async function allChampions() {
  const version = await lastVersion();

  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`,
  );

  const { data: champions } = await response.json();
  return champions;
}

export async function random(request: FastifyRequest, reply: FastifyReply) {
  const championQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const { output } = championQuerySchema.parse(request.query);
  const champions = await allChampions();

  const championKeys = Object.keys(champions);
  const randomIndex = Math.floor(Math.random() * championKeys.length);
  const randomChampionKey = championKeys[randomIndex];
  const randomChampion = champions[randomChampionKey];

  if (output === "txt") {
    const { name, title } = randomChampion;

    reply.send(`${name}, ${title}`);
  }

  reply.send(randomChampion);
}

export async function findByName(request: FastifyRequest, reply: FastifyReply) {
  const championQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const championParamSchema = z.object({
    championName: z.string(),
  });

  const { output } = championQuerySchema.parse(request.query);
  const { championName } = championParamSchema.parse(request.params);

  const champions = await allChampions();
  const championChosen = champions[championName];

  if (!championChosen) {
    throw new ChampionNotFound();
  }

  if (output === "txt") {
    const { name, title, blurb: description } = championChosen;

    reply.send(`${name}, ${title}. ${description}`);
  }

  reply.send(championChosen);
}
