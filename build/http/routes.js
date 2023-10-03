"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/http/routes.ts
var routes_exports = {};
__export(routes_exports, {
  appRoutes: () => appRoutes
});
module.exports = __toCommonJS(routes_exports);

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
    queue: import_zod2.z.enum(["solo", "flex"]).default("solo").transform(
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
      reply.send(`${username} is not ranked in Flex mode`);
    }
    reply.send(
      `${username} is ${tier} ${rank}, with ${points} pdl(s), ${wins} wins and ${losses} losses`
    );
  }
  reply.send({ username, tier, rank, points, wins, losses });
}

// src/errors/champion-not-found.ts
var ChampionNotFound = class extends Error {
  constructor() {
    super("Champion chosen not found!");
  }
};

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
  const championKeys = Object.keys(champions);
  const randomIndex = championKeys.find(
    (champion) => champion.toLocaleLowerCase() === championName
  );
  if (!randomIndex) {
    throw new ChampionNotFound();
  }
  const championChosen = champions[randomIndex];
  if (output === "txt") {
    const { name, title, blurb: description } = championChosen;
    reply.send(`${name}, ${title}. ${description}`);
  }
  reply.send(championChosen);
}

// src/http/routes.ts
async function appRoutes(app) {
  app.get("/leagueoflegends/ranked/:username", ranked);
  app.get("/leagueoflegends/champion", random);
  app.get("/leagueoflegends/champion/:championName", findByName);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  appRoutes
});
