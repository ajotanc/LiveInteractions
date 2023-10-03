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

// src/http/controllers/leagueoflegends/ranked.ts
var ranked_exports = {};
__export(ranked_exports, {
  ranked: () => ranked
});
module.exports = __toCommonJS(ranked_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ranked
});
