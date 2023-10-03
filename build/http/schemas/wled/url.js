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

// src/http/schemas/wled/url.ts
var url_exports = {};
__export(url_exports, {
  imageSchema: () => imageSchema,
  queryImageUrlSchema: () => queryImageUrlSchema
});
module.exports = __toCommonJS(url_exports);
var import_zod = require("zod");
var imageSchema = import_zod.z.object({
  type: import_zod.z.string(),
  filename: import_zod.z.string(),
  encoding: import_zod.z.string(),
  mimetype: import_zod.z.string(),
  file: import_zod.z.any()
});
var queryImageUrlSchema = import_zod.z.object({
  id: import_zod.z.coerce.number().default(0),
  output: import_zod.z.enum(["json", "ha", "curl"]).default("json"),
  brightness: import_zod.z.coerce.number().min(0).max(256).default(128),
  pre_segment: import_zod.z.enum(["individual", "index", "range"]).default("individual"),
  device: import_zod.z.string().optional(),
  unique_id: import_zod.z.string().optional(),
  friendly_name: import_zod.z.string().optional(),
  hostname: import_zod.z.string(),
  color: import_zod.z.string().optional()
}).refine(({ output, device }) => !(!device && output === "ha"), {
  message: "Parameter required.",
  path: ["device"]
}).refine(({ output, unique_id }) => !(!unique_id && output === "ha"), {
  message: "Parameter required.",
  path: ["unique_id"]
}).refine(({ output, friendly_name }) => !(!friendly_name && output === "ha"), {
  message: "Parameter required.",
  path: ["friendly_name"]
}).refine(
  ({ output, hostname }) => !(!hostname && ["ha", "curl"].includes(output)),
  {
    message: "Parameter required.",
    path: ["hostname"]
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  imageSchema,
  queryImageUrlSchema
});
