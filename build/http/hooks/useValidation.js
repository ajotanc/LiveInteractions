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

// src/http/hooks/useValidation.ts
var useValidation_exports = {};
__export(useValidation_exports, {
  useValidation: () => useValidation
});
module.exports = __toCommonJS(useValidation_exports);
function useValidation(request, _reply, done) {
  const query = request.query;
  if (query.o && !query.output) {
    query.output = query.o;
  } else if (!query.o && !query.output) {
    query.output = "json";
  }
  if (query.bri && !query.brightness) {
    query.brightness = query.bri;
  } else if (!query.bri && !query.brightness) {
    query.brightness = 128;
  }
  if (query.pat && !query.pattern) {
    query.pattern = query.pat;
  } else if (!query.pat && !query.pattern) {
    query.pattern = "individual";
  }
  if (query.d && !query.device) {
    query.device = query.d;
  }
  if (query.uid && !query.unique_id) {
    query.unique_id = query.uid;
  }
  if (query.fn && !query.friendly_name) {
    query.friendly_name = query.fn;
  }
  if (query.hn && !query.hostname) {
    query.hostname = query.hn;
  }
  if (query.c && !query.color) {
    query.color = query.c;
  }
  if (query.anim && !query.animation) {
    query.animation = query.anim;
  }
  if (query.amt && !query.amount) {
    query.amount = query.amt;
  }
  if (query.dl && !query.delay) {
    query.delay = query.dl;
  }
  if (query.n && !query.name) {
    query.name = query.n;
  }
  if (query.ps && !query.psave) {
    query.psave = query.ps;
  }
  if (query.w && !query.width) {
    query.width = query.w;
  } else if (!query.w && !query.width) {
    query.width = 16;
  }
  if (query.h && !query.height) {
    query.height = query.h;
  } else if (!query.h && !query.height) {
    query.height = 16;
  }
  done();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useValidation
});
