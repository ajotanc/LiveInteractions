import { FastifyRequest, FastifyReply } from "fastify";
import { ChampionNotFound } from "@/errors/champion-not-found";
import { z } from "zod";

export async function lastVersion() {
  const lastVersion = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  const [version] = await lastVersion.json();

  return version;
}

export async function allChampions() {
  const version = await lastVersion();

  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`
  );

  const { data: champions } = await response.json();
  return champions;
}

export async function random(request: FastifyRequest, reply: FastifyReply) {
  const userQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const { output } = userQuerySchema.parse(request.query);
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
  const userQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const userParamSchema = z.object({
    name: z.string(),
  });

  const { output } = userQuerySchema.parse(request.query);
  const { name: championName } = userParamSchema.parse(request.params);

  const champions = await allChampions();

  const championKeys = Object.keys(champions);
  const randomIndex = championKeys.find(
    (champion) =>
      champion.toLocaleLowerCase() === championName.toLocaleLowerCase()
  ) as string | undefined;

  if (!randomIndex) {
    throw new ChampionNotFound();
  }

  const championChosen = champions[randomIndex];

  if (output === "txt") {
    const { name, title, blurb: description } = championChosen;

    reply.send(`${name}, ${title}. ${description}`);
  }

  reply.send(championChosen);
}
