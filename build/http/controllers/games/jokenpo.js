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

// src/http/controllers/games/jokenpo.ts
var jokenpo_exports = {};
__export(jokenpo_exports, {
  game: () => game
});
module.exports = __toCommonJS(jokenpo_exports);
var import_zod = require("zod");
async function game(request, reply) {
  const choices = ["pedra", "papel", "tesoura"];
  const jokenpoQuerySchema = import_zod.z.object({
    output: import_zod.z.enum(["json", "txt"]).default("txt")
  });
  const jokenpoParamSchema = import_zod.z.object({
    userChoice: import_zod.z.enum(choices, {
      errorMap: (issue) => {
        const { received, path } = issue;
        return {
          message: `Optou por "${received}", uma escolha inv\xE1lida. As op\xE7\xF5es corretas s\xE3o pedra, papel ou tesoura`,
          path
        };
      }
    })
  });
  const { output } = jokenpoQuerySchema.parse(request.query);
  const { userChoice } = jokenpoParamSchema.parse(request.params);
  const userWins = {
    pedra: "terousa",
    papel: "pedra",
    tesoura: "papel"
  };
  const choiceComputer = choices[Math.floor(Math.random() * choices.length)];
  let winner;
  let message;
  userChoice === choiceComputer ? [winner, message] = ["nobody", "Empatou"] : userWins[userChoice] === choiceComputer ? [winner, message] = ["user", "Voc\xEA venceu"] : [winner, message] = ["computer", "Voc\xEA perdeu"];
  const response = `Voc\xEA escolheu ${userChoice}, o computador escolheu ${choiceComputer}. ${message}! Jogar novamente?`;
  if (output === "json") {
    reply.send({
      choices: {
        user: userChoice,
        computer: choiceComputer
      },
      winner,
      message: response
    });
  }
  reply.send(response);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  game
});
