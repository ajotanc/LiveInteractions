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

// src/http/schemas/wled/frames.ts
var frames_exports = {};
__export(frames_exports, {
  imageFramesSchema: () => imageFramesSchema,
  queryFramesSchema: () => queryFramesSchema
});
module.exports = __toCommonJS(frames_exports);
var import_zod = require("zod");
var imageFramesSchema = import_zod.z.object({
  type: import_zod.z.string(),
  filename: import_zod.z.string(),
  encoding: import_zod.z.string(),
  mimetype: import_zod.z.string(),
  file: import_zod.z.any()
});
var queryFramesSchema = import_zod.z.object({
  amount: import_zod.z.coerce.number().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  imageFramesSchema,
  queryFramesSchema
});
