import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { extractData } from "../../../helpers";
import { Weapons } from "../../../interfaces";

export async function weapons(request: FastifyRequest, reply: FastifyReply) {
  const weaponsQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const { output } = weaponsQuerySchema.parse(request.query);

  const firebase = request.server.firebase.firestore();
  const { size } = await getWeapons(firebase);

  if (size === 0) {
    const url = "https://www.gamesatlas.com/cod-warzone-2/weapons/";

    const $ = await extractData(url);
    const items = $(".items-row .item-info");

    items.map(async (_, elemet) => {
      const name = $(elemet).find(".contentheading").text().trim();
      const type = $(elemet).find(".field-value").first().text().trim();

      try {
        await firebase.collection("Weapons").add({ name, type } as Weapons);
      } catch (error) {
        throw new Error(error);
      }
    });
  }

  const { docs } = await getWeapons(firebase);

  const weapons = docs.map((doc) => doc.data() as Weapons);
  const weaponIndex = Math.floor(Math.random() * weapons.length);
  const weaponChosen = weapons[weaponIndex];

  if (output === "txt") {
    const { name, type } = weaponChosen;

    reply.send(`A sua arma no Warzone II é uma "${type}" ${name}`);
  }

  reply.send(weaponChosen);
}

async function getWeapons(firebase: FirebaseFirestore.Firestore) {
  const weapons = await firebase.collection("Weapons").get();
  return weapons;
}
