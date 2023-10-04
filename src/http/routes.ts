import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ranked } from "./controllers/leagueoflegends/ranked";
import { random, findByName } from "./controllers/leagueoflegends/champion";
import { game } from "./controllers/games/jokenpo";
import { weapons } from "./controllers/warzone/weapons";

export const routes: FastifyPluginAsync = async (server) => {
  server.register(
    async (instance: FastifyInstance, _, done) => {
      instance.get("/leagueoflegends/ranked/:username", ranked);
      instance.get("/leagueoflegends/champion", random);
      instance.get("/leagueoflegends/champion/:championName", findByName);

      // GAMES
      instance.get("/jokenpo/:userChoice", game);

      // WARZONE
      instance.get("/warzone/weapons", weapons);

      done();
    },
    {
      prefix: "/api/v1",
    },
  );
};
