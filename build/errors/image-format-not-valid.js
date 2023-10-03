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

// src/errors/image-format-not-valid.ts
var image_format_not_valid_exports = {};
__export(image_format_not_valid_exports, {
  ImageFormatNotValid: () => ImageFormatNotValid
});
module.exports = __toCommonJS(image_format_not_valid_exports);
var ImageFormatNotValid = class extends Error {
  constructor() {
    super("Image format is not valid!");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ImageFormatNotValid
});
