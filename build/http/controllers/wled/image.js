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

// src/http/controllers/wled/image.ts
var image_exports = {};
__export(image_exports, {
  image: () => image
});
module.exports = __toCommonJS(image_exports);

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
function patternType(pattern, colors) {
  switch (pattern) {
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
  let startIndex = 0;
  let endIndex = 0;
  let currentColor = colors[0];
  const pattern = [];
  colors.forEach((color2, index) => {
    if (color2 !== currentColor) {
      endIndex = index;
      const repetitions = endIndex - startIndex;
      if (repetitions === 1) {
        pattern.push(currentColor);
      } else {
        pattern.push(startIndex, endIndex, currentColor);
      }
      startIndex = index;
    }
    currentColor = color2;
  });
  const lastRepetition = colors.length - startIndex;
  if (lastRepetition === 1) {
    pattern.push(currentColor);
  } else {
    pattern.push(startIndex, colors.length, currentColor);
  }
  return pattern;
}
async function imageToBase64(image2) {
  try {
    const chunks = [];
    for await (const chunk of image2) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const base64Data = buffer.toString("base64");
    return base64Data;
  } catch (error) {
    throw new Error(error);
  }
}
async function imageFromBase64(base64, width, height) {
  try {
    const buffer = Buffer.from(base64, "base64");
    const image2 = await import_jimp.default.read(buffer);
    image2.resize(width, height);
    return image2;
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
  const frames = await (0, import_gif_frames.default)(options);
  const base64Frames = await Promise.all(
    frames.map((frame) => frameToBase64(frame, withoutData))
  );
  return base64Frames;
}
function readPixelColors(image2, hex) {
  try {
    const colors = [];
    image2.scan(
      0,
      0,
      image2.bitmap.width,
      image2.bitmap.height,
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
async function processAnimation(id, imageBase64, amount, brightness, pattern, width, height, output, hostname, device, friendly_name, unique_id, color2, delay) {
  const frames = await pictureFrames(imageBase64, amount, true);
  const dataResponse = [];
  await Promise.all(
    frames.map(async (frameBase64, index) => {
      const image2 = await imageFromBase64(frameBase64, width, height);
      const colors = readPixelColors(image2, color2);
      const jsonData = {
        on: true,
        bri: brightness,
        seg: {
          id,
          i: patternType(pattern, colors)
        }
      };
      const outputData = outputType(output, jsonData, {
        device,
        friendly_name,
        unique_id,
        hostname
      });
      if (["ha", "curl"].includes(output)) {
        dataResponse.push(`## FRAME ${index}`, outputData);
        if (delay && output === "curl") {
          dataResponse.push(`sleep ${delay}`);
        }
      } else {
        dataResponse.push(outputData);
      }
    })
  );
  return output === "json" ? dataResponse : dataResponse.join("\n");
}

// src/http/schemas/wled/image.ts
var import_zod = require("zod");
var imageSchema = import_zod.z.object({
  type: import_zod.z.string(),
  filename: import_zod.z.string(),
  encoding: import_zod.z.string(),
  mimetype: import_zod.z.string(),
  file: import_zod.z.any()
});
var queryImageSchema = import_zod.z.object({
  id: import_zod.z.coerce.number().default(0),
  output: import_zod.z.enum(["json", "ha", "curl"]).default("json"),
  brightness: import_zod.z.coerce.number().min(0).max(255).default(128),
  pattern: import_zod.z.enum(["individual", "index", "range"]).default("individual"),
  hostname: import_zod.z.string().optional(),
  device: import_zod.z.string().optional(),
  unique_id: import_zod.z.string().optional(),
  friendly_name: import_zod.z.string().optional(),
  color: import_zod.z.string().optional(),
  animation: import_zod.z.string().default("false").transform((value) => value === "true"),
  amount: import_zod.z.coerce.number().optional(),
  delay: import_zod.z.coerce.number().optional(),
  width: import_zod.z.coerce.number().default(16),
  height: import_zod.z.coerce.number().default(16),
  name: import_zod.z.string().optional(),
  psave: import_zod.z.coerce.number().optional()
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

// src/http/controllers/wled/image.ts
async function image(request, reply) {
  const { mimetype, file } = imageSchema.parse(await request.file());
  const {
    id,
    brightness,
    output,
    pattern,
    width,
    height,
    hostname,
    device,
    friendly_name,
    unique_id,
    color: color2,
    animation,
    amount,
    delay,
    name,
    psave
  } = queryImageSchema.parse(request.query);
  if (!["image/jpeg", "image/png", "image/gif"].includes(mimetype)) {
    throw new InvalidMimeTypes();
  }
  const imageBase64 = await imageToBase64(file);
  if (animation) {
    if (mimetype !== "image/gif") {
      throw new InvalidMimeTypes();
    }
    const response = await processAnimation(
      id,
      imageBase64,
      amount,
      brightness,
      pattern,
      width,
      height,
      output,
      hostname,
      device,
      friendly_name,
      unique_id,
      color2,
      delay
    );
    reply.send(response);
  } else {
    const jsonData = {};
    const image2 = await imageFromBase64(imageBase64, width, height);
    const colors = readPixelColors(image2, color2);
    if (name && psave) {
      Object.assign(jsonData, { n: name, psave, o: false });
    }
    Object.assign(jsonData, {
      on: true,
      bri: brightness,
      seg: {
        id,
        i: patternType(pattern, colors)
      }
    });
    const response = outputType(output, jsonData, {
      device,
      friendly_name,
      unique_id,
      hostname
    });
    reply.send(response);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  image
});
