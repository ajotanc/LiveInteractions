"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));
var import_cors = __toESM(require("@fastify/cors"));
var import_multipart = __toESM(require("@fastify/multipart"));
var import_zod4 = require("zod");

// src/http/controllers/leagueoflegends/ranked.ts
var import_twisted = require("twisted");
var import_zod2 = require("zod");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "test", "production"]).default("dev"),
  PORT: import_zod.z.coerce.number().default(3333),
  SECRET_KEY_RIOT: import_zod.z.string().default("RGAPI-603cb1b7-671a-4521-a5af-602a7a5e55eb")
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
      (value) => !value || value === "solo" ? "RANKED_SOLO_5x5" : "RANKED_FLEX_SR"
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
  const userQuerySchema = import_zod3.z.object({
    output: import_zod3.z.enum(["json", "txt"]).default("txt")
  });
  const { output } = userQuerySchema.parse(request.query);
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
  const userQuerySchema = import_zod3.z.object({
    output: import_zod3.z.enum(["json", "txt"]).default("txt")
  });
  const userParamSchema = import_zod3.z.object({
    name: import_zod3.z.string()
  });
  const { output } = userQuerySchema.parse(request.query);
  const { name: championName } = userParamSchema.parse(request.params);
  const champions = await allChampions();
  const championKeys = Object.keys(champions);
  const randomIndex = championKeys.find(
    (champion) => champion.toLocaleLowerCase() === championName.toLocaleLowerCase()
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
async function appRoutes(app2) {
  app2.get("/leagueoflegends/ranked/:username", ranked);
  app2.get("/leagueoflegends/champion", random);
  app2.get("/leagueoflegends/champion/:name", findByName);
}

// src/errors/invalid-mimetypes.ts
var InvalidMimeTypes = class extends Error {
  constructor() {
    super("Image format is not valid!");
  }
};

// src/app.ts
var app = (0, import_fastify.default)();
var corsOptions = {
  origin: "*"
};
app.register(import_cors.default, corsOptions);
app.register(import_multipart.default);
app.register(appRoutes, { prefix: "api" });
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof import_zod4.ZodError) {
    return reply.status(404).send({ message: "Validation error.", issues: error.format() });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
  }
  if (error instanceof InvalidMimeTypes) {
    reply.status(409).send({ message: error.message });
  }
  if (error instanceof ChampionNotFound) {
    reply.status(404).send({ message: error.message });
  }
  return reply.status(500).send({ message: "Internal server error." });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
