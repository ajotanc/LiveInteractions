import type {
	FastifyInstance,
	FastifyPluginAsync,
	FastifyServerOptions,
} from "fastify";

import { ranked } from "./controllers/leagueoflegends/ranked";
import { random, findByName } from "./controllers/leagueoflegends/champion";
import { game } from "./controllers/games/jokenpo";
import { mostPlayed } from "./controllers/games/steam";
import { weapons } from "./controllers/warzone/weapons";
import { meta } from "./controllers/magistrike/meta";
import { dictionary, dictionaryById } from "./controllers/esocial/dictionary";
import { imageBase64 } from "./controllers/general";

export const routes: FastifyPluginAsync = async (server) => {
	server.register(
		async (instance: FastifyInstance, _opts: FastifyServerOptions, done) => {
			// LEAGUE OF LEGENDS
			instance.get("/leagueoflegends/ranked/:username", ranked);
			instance.get("/leagueoflegends/champion", random);
			instance.get("/leagueoflegends/champion/:championName", findByName);

			// GAMES
			instance.get("/jokenpo/:userChoice", game);

			// WARZONE
			instance.get("/warzone/weapons", weapons);

			// WARZONE
			instance.get("/magistrike/meta", meta);

			// E-SOCIAL
			instance.get("/esocial", dictionary);
			instance.get("/esocial/:id", dictionaryById);

			// STEAM
			instance.get("/games/most-played", mostPlayed);

			instance.get("/general/image/base64", imageBase64);
			done();
		},
	);
};
