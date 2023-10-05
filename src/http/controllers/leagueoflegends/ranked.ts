import { FastifyRequest, FastifyReply } from "fastify";
import { LolApi, Constants } from "twisted";
import { ZodIssueOptionalMessage, z } from "zod";

import { CustomZodIssue, SummonerLeagueInterface } from "../../../interfaces";
import { env } from "../../../env";

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
      .enum(["solo", "flex"], {
        errorMap: (issue: ZodIssueOptionalMessage) => {
          const { received, path } = issue as CustomZodIssue;
          return {
            message: `Optou por "${received}", uma escolha inválida. As opções corretas são solo ou flex`,
            path,
          };
        },
      })
      .default("solo")
      .transform((value) =>
        value === "solo" ? "RANKED_SOLO_5x5" : "RANKED_FLEX_SR",
      ),
  });

  const { username } = userParamSchema.parse(request.params);
  const { queue, output } = userQuerySchema.parse(request.query);

  const region = Constants.Regions.BRAZIL;

  const {
    response: { id },
  } = await api.Summoner.getByName(username, region);

  const { response } = await api.League.bySummoner(id, region);

  const {
    tier,
    rank,
    leaguePoints: points,
    wins,
    losses,
  }: SummonerLeagueInterface = response.find(
    ({ queueType }) => queueType === queue,
  ) || {};

  if (output === "txt") {
    if (!tier) {
      const queueChosen = queue.split("_")[1].toLowerCase();

      reply.send(`${username} não tem classificação no modo ${queueChosen}`);
    }

    reply.send(
      `${username} é ${tier} ${rank}, com ${points} pdl(s), ${wins} vitória(s) e ${losses} derrota(s)`,
    );
  }

  reply.send({ username, tier, rank, points, wins, losses });
}
