import { FastifyInstance } from "fastify";
import { ranked } from "./controllers/leagueoflegends/ranked";
import { random, findByName } from "./controllers/leagueoflegends/champion";

export async function appRoutes(app: FastifyInstance) {
  // LEAGUE OF LEGENDS
  app.get("/leagueoflegends/ranked/:username", ranked);
  app.get("/leagueoflegends/champion", random);
  app.get("/leagueoflegends/champion/:name", findByName);
}
