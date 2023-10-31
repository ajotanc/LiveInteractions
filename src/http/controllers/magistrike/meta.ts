import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { convertStringDate, diffDays, extractData } from "../../../helpers";

export async function meta(request: FastifyRequest, reply: FastifyReply) {
  const metaQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const { output } = metaQuerySchema.parse(request.query);

  const json = "https://www.nuuvem.com/lp/pt/magistrike/counter.json";
  const url = "https://www.nuuvem.com/lp/pt/magistrike";

  const $ = await extractData(url);
  const dateFormatted = $("#tiers .header")
    .find("strong")
    .last()
    .text()
    .split("!")[0];
  const date = convertStringDate(dateFormatted);
  const days = diffDays(date);

  const response = await fetch(json);
  const data = await response.json();

  const optionsCurrency = {
    style: "currency",
    currency: "BRL",
  };

  const {
    formatted_goal_amount_percentage: percentage,
    formatted_collected_amount_in_brl: amount,
    goal_amount,
    customers_count: supporters,
  } = data;

  const goal = goal_amount.toLocaleString("pt-BR", optionsCurrency);

  if (output === "txt") {
    reply.send(
      `A campanha de financiamento coletivo do Magistrike já atingiu ${percentage} da meta, arrecadando ${amount} de um total de ${goal}. Somos ${supporters} apoiadores e faltam ${days} dias para o fim da campanha. Apoiando agora você pode garantir acesso ao Beta, skins e até uma partida com o YoDa!`,
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
