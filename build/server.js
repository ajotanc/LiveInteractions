"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_fastify = __toESM(require("fastify"));
var import_cors = __toESM(require("@fastify/cors"));
var import_multipart = __toESM(require("@fastify/multipart"));
var import_zod6 = require("zod");

// src/http/controllers/leagueoflegends/ranked.ts
var import_twisted = require("twisted");
var import_zod2 = require("zod");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "test", "production"]).default("dev"),
  PORT: import_zod.z.coerce.number().default(3333),
  SECRET_KEY_RIOT: import_zod.z.string()
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variable.", _env.error.format());
  throw new Error("Invalid environment variable.");
}
var env = _env.data;

// src/http/controllers/leagueoflegends/ranked.ts
var api = new import_twisted.LolApi({
  key: env.SECRET_KEY_RIOT
});
async function ranked(request, reply) {
  const userParamSchema = import_zod2.z.object({
    username: import_zod2.z.string()
  });
  const userQuerySchema = import_zod2.z.object({
    output: import_zod2.z.enum(["json", "txt"]).default("txt"),
    queue: import_zod2.z.enum(["solo", "flex"], {
      errorMap: (issue) => {
        const { received, path } = issue;
        return {
          message: `Optou por "${received}", uma escolha inv\xE1lida. As op\xE7\xF5es corretas s\xE3o solo ou flex`,
          path
        };
      }
    }).default("solo").transform(
      (value) => value === "solo" ? "RANKED_SOLO_5x5" : "RANKED_FLEX_SR"
    )
  });
  const { username } = userParamSchema.parse(request.params);
  const { queue, output } = userQuerySchema.parse(request.query);
  const {
    response: { id }
  } = await api.Summoner.getByName(username, import_twisted.Constants.Regions.BRAZIL);
  const { response } = await api.League.bySummoner(
    id,
    import_twisted.Constants.Regions.BRAZIL
  );
  const {
    tier,
    rank,
    leaguePoints: points,
    wins,
    losses
  } = response.find(
    ({ queueType }) => queueType === queue
  ) || {};
  if (output === "txt") {
    if (!tier) {
      reply.send(`${username} n\xE3o tem classifica\xE7\xE3o no modo Flex`);
    }
    reply.send(
      `${username} \xE9 ${tier} ${rank}, com ${points} pdl(s), ${wins} vit\xF3ria(s) e ${losses} derrota(s)`
    );
  }
  reply.send({ username, tier, rank, points, wins, losses });
}

// src/http/controllers/leagueoflegends/champion.ts
var import_zod3 = require("zod");
async function lastVersion() {
  const lastVersion2 = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  const [version] = await lastVersion2.json();
  return version;
}
async function allChampions() {
  const version = await lastVersion();
  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`
  );
  const { data: champions } = await response.json();
  return champions;
}
async function random(request, reply) {
  const championQuerySchema = import_zod3.z.object({
    output: import_zod3.z.enum(["json", "txt"]).default("txt")
  });
  const { output } = championQuerySchema.parse(request.query);
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
async function findByName(request, reply) {
  const championQuerySchema = import_zod3.z.object({
    output: import_zod3.z.enum(["json", "txt"]).default("txt")
  });
  const championParamSchema = import_zod3.z.object({
    championName: import_zod3.z.string()
  });
  const { output } = championQuerySchema.parse(request.query);
  const { championName } = championParamSchema.parse(request.params);
  const champions = await allChampions();
  const championChosen = champions[championName];
  if (!championChosen) {
    throw new Error("Campe\xE3o escolhido n\xE3o encontrado");
  }
  if (output === "txt") {
    const { name, title, blurb: description } = championChosen;
    reply.send(`${name}, ${title}. ${description}`);
  }
  reply.send(championChosen);
}

// src/http/controllers/games/jokenpo.ts
var import_zod4 = require("zod");
async function game(request, reply) {
  const choices = ["pedra", "papel", "tesoura"];
  const jokenpoQuerySchema = import_zod4.z.object({
    output: import_zod4.z.enum(["json", "txt"]).default("txt")
  });
  const jokenpoParamSchema = import_zod4.z.object({
    userChoice: import_zod4.z.enum(choices, {
      errorMap: (issue) => {
        const { received, path } = issue;
        return {
          message: `Optou por "${received}", uma escolha inv\xE1lida. As op\xE7\xF5es corretas s\xE3o pedra, papel ou tesoura`,
          path
        };
      }
    })
  });
  const { output } = jokenpoQuerySchema.parse(request.query);
  const { userChoice } = jokenpoParamSchema.parse(request.params);
  const userWins = {
    pedra: "terousa",
    papel: "pedra",
    tesoura: "papel"
  };
  const choiceComputer = choices[Math.floor(Math.random() * choices.length)];
  let winner;
  let message;
  userChoice === choiceComputer ? [winner, message] = ["nobody", "Empatou"] : userWins[userChoice] === choiceComputer ? [winner, message] = ["user", "Voc\xEA venceu"] : [winner, message] = ["computer", "Voc\xEA perdeu"];
  const response = `Voc\xEA escolheu ${userChoice}, o computador escolheu ${choiceComputer}. ${message}! Jogar novamente?`;
  if (output === "json") {
    reply.send({
      choices: {
        user: userChoice,
        computer: choiceComputer
      },
      winner,
      message: response
    });
  }
  reply.send(response);
}

// src/http/controllers/warzone/weapons.ts
var import_zod5 = require("zod");

// src/helpers/index.ts
var import_cheerio = __toESM(require("cheerio"));
function capitalizeFirstLetter(word) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return word;
}
async function extractData(url) {
  const response = await fetch(url);
  const data = await response.text();
  const content = import_cheerio.default.load(data);
  return content;
}

// src/http/controllers/warzone/weapons.ts
async function weapons(request, reply) {
  const url = "https://www.gamesatlas.com/cod-warzone-2/weapons/";
  const weaponsQuerySchema = import_zod5.z.object({
    output: import_zod5.z.enum(["json", "txt"]).default("txt")
  });
  const { output } = weaponsQuerySchema.parse(request.query);
  const weapons2 = [];
  const $ = await extractData(url);
  const items = $(".items-row .item-info");
  items.each((_, elemet) => {
    const name = $(elemet).find(".contentheading").text().trim();
    const type = $(elemet).find(".field-value").first().text().trim();
    weapons2.push({ name, type });
  });
  const weaponIndex = Math.floor(Math.random() * weapons2.length);
  const weaponChosen = weapons2[weaponIndex];
  if (output === "txt") {
    const { name, type } = weaponChosen;
    reply.send(`A sua arma no Warzone II \xE9 uma "${type}" ${name}`);
  }
  reply.send(weaponChosen);
}

// src/http/routes.ts
async function appRoutes(app2) {
  app2.get("/leagueoflegends/ranked/:username", ranked);
  app2.get("/leagueoflegends/champion", random);
  app2.get("/leagueoflegends/champion/:championName", findByName);
  app2.get("/jokenpo/:userChoice", game);
  app2.get("/warzone/weapons", weapons);
}

// src/http/hooks/useValidation.ts
function useValidation(request, _reply, done) {
  const query = request.query;
  const params = request.params;
  if (query.queue) {
    query.queue = query.queue.toLowerCase();
  }
  if (params.championName) {
    params.championName = capitalizeFirstLetter(params.championName);
  }
  if (params.userChoice) {
    params.userChoice = params.userChoice.toLowerCase();
  }
  done();
}

// src/app.ts
var app = (0, import_fastify.default)();
var corsOptions = {
  origin: "*"
};
app.register(import_cors.default, corsOptions);
app.register(import_multipart.default);
app.register(appRoutes, { prefix: "api" });
app.addHook("preValidation", useValidation);
app.setErrorHandler((error, request, reply) => {
  const { output } = request.query;
  if (error instanceof import_zod6.ZodError) {
    if (output === "txt") {
      const { errors } = error;
      const message = errors.map((error2) => error2.message).join(" | ");
      return reply.send(message);
    }
    return reply.status(404).send({ message: "Validation error.", issues: error.format() });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
  }
  if (output === "txt") {
    reply.send(error.message);
  }
  return reply.status(500).send({ message: "Internal server error." });
});

// src/server.ts
app.listen({
  host: "0.0.0.0",
  port: env.PORT
}).then(() => {
  console.log("HTTP Server Running!");
});
