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

// src/errors/champion-not-found.ts
var champion_not_found_exports = {};
__export(champion_not_found_exports, {
  ChampionNotFound: () => ChampionNotFound
});
module.exports = __toCommonJS(champion_not_found_exports);
var ChampionNotFound = class extends Error {
  constructor() {
    super("Campe\xE3o escolhido n\xE3o encontrado");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChampionNotFound
});
