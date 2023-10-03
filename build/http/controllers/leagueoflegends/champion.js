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

// src/http/controllers/leagueoflegends/champion.ts
var champion_exports = {};
__export(champion_exports, {
  allChampions: () => allChampions,
  findByName: () => findByName,
  lastVersion: () => lastVersion,
  random: () => random
});
module.exports = __toCommonJS(champion_exports);

// src/errors/champion-not-found.ts
var ChampionNotFound = class extends Error {
  constructor() {
    super("Champion chosen not found!");
  }
};

// src/http/controllers/leagueoflegends/champion.ts
var import_zod = require("zod");
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
  const userQuerySchema = import_zod.z.object({
    output: import_zod.z.enum(["json", "txt"]).default("txt")
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
  const userQuerySchema = import_zod.z.object({
    output: import_zod.z.enum(["json", "txt"]).default("txt")
  });
  const userParamSchema = import_zod.z.object({
    name: import_zod.z.string()
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  allChampions,
  findByName,
  lastVersion,
  random
});
