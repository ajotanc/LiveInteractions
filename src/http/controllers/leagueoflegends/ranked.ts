import { FastifyRequest, FastifyReply } from "fastify";
import { LolApi, Constants } from "twisted";
import { z } from "zod";
import { SummonerLeagueInterface } from "@/interfaces";
import { env } from "@/env";

const api = new LolApi({
  key: env.SECRET_KEY_RIOT,
});

export async function ranked(request: FastifyRequest, reply: FastifyReply) {
  const userParamSchema = z.object({
    username: z.string(),
  });

  const userQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
    queue: z
      .enum(["solo", "flex"])
      .default("solo")
      .transform((value) =>
        !value || value === "solo" ? "RANKED_SOLO_5x5" : "RANKED_FLEX_SR"
      ),
  });

  const { username } = userParamSchema.parse(request.params);
  const { queue, output } = userQuerySchema.parse(request.query);

  const {
    response: { id },
  } = await api.Summoner.getByName(username, Constants.Regions.BRAZIL);

  const { response } = await api.League.bySummoner(
    id,
    Constants.Regions.BRAZIL
  );

  const {
    tier,
    rank,
    leaguePoints: points,
    wins,
    losses,
  }: SummonerLeagueInterface = response.find(
    ({ queueType }) => queueType === queue
  ) || {};

  if (output === "txt") {
    if (!tier) {
      reply.send(`${username} is not ranked in Flex mode`);
    }

    reply.send(
      `${username} is ${tier} ${rank}, with ${points} pdl(s), ${wins} wins and ${losses} losses`
    );
  }

  reply.send({ username, tier, rank, points, wins, losses });
}
