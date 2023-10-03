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

// src/http/controllers/lol/champion.ts
var champion_exports = {};
__export(champion_exports, {
  champion: () => champion
});
module.exports = __toCommonJS(champion_exports);
var import_zod = require("zod");
async function champion(request, reply) {
  const userQuerySchema = import_zod.z.object({
    output: import_zod.z.enum(["json", "txt"]).default("txt")
  });
  const { output } = userQuerySchema.parse(request.query);
  const lastVersion = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  const [version] = await lastVersion.json();
  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`
  );
  const { data: champions } = await response.json();
  const championKeys = Object.keys(champions);
  const randomIndex = Math.floor(Math.random() * championKeys.length);
  const randomChampionKey = championKeys[randomIndex];
  const randomChampion = champions[randomChampionKey];
  if (output === "txt") {
    const { name, title } = randomChampion;
    reply.send(`${name}, ${title}.`);
  }
  reply.send(randomChampion);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  champion
});
