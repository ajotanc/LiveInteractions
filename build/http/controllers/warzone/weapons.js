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

// src/http/controllers/warzone/weapons.ts
var weapons_exports = {};
__export(weapons_exports, {
  weapons: () => weapons
});
module.exports = __toCommonJS(weapons_exports);
var import_zod = require("zod");

// src/helpers/index.ts
var import_cheerio = __toESM(require("cheerio"));
var import_puppeteer = __toESM(require("puppeteer"));
function extractData(html) {
  const $ = import_cheerio.default.load(html);
  return $;
}
async function getPageContent(url) {
  const browser = await import_puppeteer.default.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);
  const content = await page.content();
  await browser.close();
  return content;
}

// src/http/controllers/warzone/weapons.ts
async function weapons(request, reply) {
  const url = "https://www.gamesatlas.com/cod-warzone-2/weapons/";
  const weaponsQuerySchema = import_zod.z.object({
    output: import_zod.z.enum(["json", "txt"]).default("txt")
  });
  const { output } = weaponsQuerySchema.parse(request.query);
  const content = await getPageContent(url);
  const $ = extractData(content);
  const weapons2 = [];
  $(".items-row .item-info").each((_, elemet) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  weapons
});
