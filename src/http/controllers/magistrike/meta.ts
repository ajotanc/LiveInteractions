import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { extractData, financingEndDate } from "../../../helpers";
import { match } from "assert";

export async function meta(request: FastifyRequest, reply: FastifyReply) {
  const metaQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const { output } = metaQuerySchema.parse(request.query);

  const url = "https://www.nuuvem.com/lp/pt/magistrike";
  const days = financingEndDate();

  const response = await fetch(`${url}/counter.json`);
  const data = await response.json();

  const $ = await extractData(url);
  const subtittle = $(".progressbar-content .subtittle").text();

  const [goal] = subtittle.match(/R\$ (\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
  const [match] = subtittle.match(/Meta (\d+)/);

  const {
    formatted_goal_amount_percentage: percentage,
    formatted_collected_amount_in_brl: amount,
    customers_count: supporters,
  } = data;

  if (output === "txt") {
    reply.send(
      `A campanha de financiamento coletivo do Magistrike já alcançou a ${match}, atigindo ${percentage} da meta arrecadando ${amount}. Próxima meta ${goal}. Somos ${supporters} apoiadores e faltam ${days} dias para o fim da campanha. Apoiando agora você pode garantir acesso ao Beta, skins e até uma partida com o YoDa!`,
    );
  }

  reply.send({
    percentage,
    amount,
    goal,
    supporters,
    days_left: days,
  });
}
