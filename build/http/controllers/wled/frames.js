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

// src/http/controllers/wled/frames.ts
var frames_exports = {};
__export(frames_exports, {
  frames: () => frames
});
module.exports = __toCommonJS(frames_exports);

// src/helpers/index.ts
var import_jimp = __toESM(require("jimp"));
var import_gif_frames = __toESM(require("gif-frames"));
var import_js_yaml = __toESM(require("js-yaml"));
async function imageToBase64(image) {
  try {
    const chunks = [];
    for await (const chunk of image) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const base64Data = buffer.toString("base64");
    return base64Data;
  } catch (error) {
    throw new Error(error);
  }
}
async function pictureFrames(base64, amount = void 0, withoutData = false) {
  const options = {
    url: Buffer.from(base64, "base64"),
    frames: amount ? `0-${amount - 1}` : "all",
    outputType: "png"
  };
  const frames2 = await (0, import_gif_frames.default)(options);
  const base64Frames = await Promise.all(
    frames2.map((frame) => frameToBase64(frame, withoutData))
  );
  return base64Frames;
}
function frameToBase64(frame, withoutData) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    frame.getImage().on("data", (chunk) => chunks.push(chunk)).on("end", () => {
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString("base64");
      resolve(withoutData ? base64 : `data:image/png;base64,${base64}`);
    }).once("error", (error) => reject(error));
  });
}

// src/http/schemas/wled/frames.ts
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

// src/http/schemas/wled/image.ts
var import_zod2 = require("zod");
var imageSchema = import_zod2.z.object({
  type: import_zod2.z.string(),
  filename: import_zod2.z.string(),
  encoding: import_zod2.z.string(),
  mimetype: import_zod2.z.string(),
  file: import_zod2.z.any()
});
var queryImageSchema = import_zod2.z.object({
  id: import_zod2.z.coerce.number().default(0),
  output: import_zod2.z.enum(["json", "ha", "curl"]).default("json"),
  brightness: import_zod2.z.coerce.number().min(0).max(255).default(128),
  pattern: import_zod2.z.enum(["individual", "index", "range"]).default("individual"),
  hostname: import_zod2.z.string().optional(),
  device: import_zod2.z.string().optional(),
  unique_id: import_zod2.z.string().optional(),
  friendly_name: import_zod2.z.string().optional(),
  color: import_zod2.z.string().optional(),
  animation: import_zod2.z.string().default("false").transform((value) => value === "true"),
  amount: import_zod2.z.coerce.number().optional(),
  delay: import_zod2.z.coerce.number().optional(),
  width: import_zod2.z.coerce.number().default(16),
  height: import_zod2.z.coerce.number().default(16),
  name: import_zod2.z.string().optional(),
  psave: import_zod2.z.coerce.number().optional()
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
).refine(({ name, psave }) => !(!name && psave), {
  message: "Parameter required.",
  path: ["name"]
}).refine(({ psave, name }) => !(!psave && name), {
  message: "Parameter required.",
  path: ["psave"]
});

// src/errors/invalid-mimetypes.ts
var InvalidMimeTypes = class extends Error {
  constructor() {
    super("Image format is not valid!");
  }
};

// src/http/controllers/wled/frames.ts
async function frames(request, reply) {
  const fileData = await request.file();
  const { mimetype, file } = imageSchema.parse(fileData);
  const { amount } = queryFramesSchema.parse(request.query);
  if (mimetype !== "image/gif") {
    throw new InvalidMimeTypes();
  }
  const imageBase64 = await imageToBase64(file);
  const base64Frames = await pictureFrames(imageBase64, amount);
  reply.send({
    message: "Recreated image and separate GIF frames!",
    frames: base64Frames
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  frames
});
