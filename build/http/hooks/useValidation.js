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

// src/http/hooks/useValidation.ts
var useValidation_exports = {};
__export(useValidation_exports, {
  useValidation: () => useValidation
});
module.exports = __toCommonJS(useValidation_exports);

// src/helpers/index.ts
var import_cheerio = __toESM(require("cheerio"));
var import_puppeteer = __toESM(require("puppeteer"));
function capitalizeFirstLetter(word) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return word;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useValidation
});
