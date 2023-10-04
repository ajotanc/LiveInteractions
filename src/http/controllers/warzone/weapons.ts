import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { extractData } from "#/helpers";
import { Weapons } from "#/interfaces";

export async function weapons(request: FastifyRequest, reply: FastifyReply) {
  const url = "https://www.gamesatlas.com/cod-warzone-2/weapons/";

  const weaponsQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const { output } = weaponsQuerySchema.parse(request.query);

  const weapons: Weapons[] = [];

  const $ = await extractData(url);
  const items = $(".items-row .item-info");

  items.each((_, elemet) => {
    const name = $(elemet).find(".contentheading").text().trim();
    const type = $(elemet).find(".field-value").first().text().trim();

    weapons.push({ name, type });
  });

  const weaponIndex = Math.floor(Math.random() * weapons.length);
  const weaponChosen = weapons[weaponIndex];

  if (output === "txt") {
    const { name, type } = weaponChosen;

    reply.send(`A sua arma no Warzone II é uma "${type}" ${name}`);
  }

  reply.send(weaponChosen);
}
