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

// src/http/controllers/wled/url.ts
var url_exports = {};
__export(url_exports, {
  url: () => url
});
module.exports = __toCommonJS(url_exports);

// src/helpers/index.ts
var import_jimp = __toESM(require("jimp"));
var import_gif_frames = __toESM(require("gif-frames"));
var import_js_yaml = __toESM(require("js-yaml"));
function outputType(output, jsonData, parameters) {
  switch (output) {
    case "json":
      return jsonData;
    case "ha":
      return homeAssistant(jsonData, parameters);
    case "curl":
      return curl(jsonData, parameters);
  }
}
function homeAssistant(jsonData, parameters) {
  const { device, friendly_name, unique_id, hostname } = parameters;
  const json = JSON.stringify(jsonData);
  if (device) {
    const yamlData = {
      switches: {
        [device]: {
          friendly_name,
          unique_id,
          command_on: `curl -X POST "http://${hostname}/json/state" -d '${json}' -H "Content-Type: application/json"`,
          command_off: `curl -X POST "http://${hostname}/json/state" -d '{"on":false}' -H "Content-Type: application/json"`
        }
      }
    };
    return import_js_yaml.default.dump(yamlData, { indent: 2 });
  }
}
function curl(jsonData, parameters) {
  const { hostname } = parameters;
  const json = JSON.stringify(jsonData);
  return `curl -X POST "http://${hostname}/json/state" -d '${json}' -H "Content-Type: application/json"`;
}
function preSegment(preSegment2, colors) {
  switch (preSegment2) {
    case "individual":
      return colors;
    case "index":
      return individualLedIndex(colors);
    case "range":
      return rangeLeds(colors);
  }
}
function rgbToHex(r, g, b) {
  const hex = (r << 16 | g << 8 | b).toString(16);
  return ("000000" + hex).slice(-6);
}
function individualLedIndex(colors) {
  const leds = [];
  colors.forEach((led, index) => {
    leds.push(index, led);
  });
  return leds;
}
function rangeLeds(colors) {
  const leds = [];
  const isDifferent = (a, b) => a !== b;
  colors.forEach(
    (led, index, arr) => {
      const start = leds.length === 0 ? 0 : leds[leds.length - 2];
      if (index === 0 || isDifferent(led, arr[index - 1])) {
        leds.push(start, index, led);
      } else {
        leds[leds.length - 2] = index + 1;
      }
    }
  );
  return leds;
}
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
async function imageFromBase64(base64, width = 16, height = 16) {
  try {
    const buffer = Buffer.from(base64, "base64");
    const image = await import_jimp.default.read(buffer);
    image.resize(width, height, import_jimp.RESIZE_NEAREST_NEIGHBOR);
    return image;
  } catch (error) {
    throw new Error(error);
  }
}
function readPixelColors(image, hex) {
  try {
    const colors = [];
    image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];
        const pixelColor = color(r, g, b, a, hex);
        colors.push(pixelColor);
      }
    );
    return colors;
  } catch (error) {
    throw new Error(error);
  }
}
function color(r, g, b, a, hex) {
  if (a === 0) {
    if (hex) {
      return hex.replace("#", "").toLowerCase();
    }
    return rgbToHex(255, 255, 255);
  }
  return rgbToHex(r, g, b);
}

// src/http/schemas/wled/url.ts
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

// src/errors/invalid-mimetypes.ts
var InvalidMimeTypes = class extends Error {
  constructor() {
    super("Image format is not valid!");
  }
};

// src/http/controllers/wled/url.ts
async function url(request, reply) {
  const fileData = await request.file();
  const { mimetype, file } = imageSchema.parse(fileData);
  const {
    id,
    brightness,
    output,
    pre_segment,
    device,
    friendly_name,
    unique_id,
    hostname,
    color: color2
  } = queryImageUrlSchema.parse(request.query);
  const mimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  try {
    if (!mimeTypes.includes(mimetype)) {
      throw new InvalidMimeTypes();
    }
    const jsonData = {};
    const imageBase64 = await imageToBase64(file);
    const image = await imageFromBase64(imageBase64);
    const colors = readPixelColors(image, color2);
    Object.assign(jsonData, {
      on: true,
      bri: brightness,
      seg: {
        id,
        i: preSegment(pre_segment, colors)
      }
    });
    const outputData = outputType(output, jsonData, {
      device,
      friendly_name,
      unique_id,
      hostname
    });
    reply.send(outputData);
  } catch (err) {
    reply.send(err);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  url
});
