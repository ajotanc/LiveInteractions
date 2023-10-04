import { FastifyRequest, FastifyReply } from "fastify";
import { ZodIssueOptionalMessage, z } from "zod";
import { UserWins, CustomZodIssue } from "@/interfaces";

export async function game(request: FastifyRequest, reply: FastifyReply) {
  const choices = ["pedra", "papel", "tesoura"] as [string, ...string[]];

  const jokenpoQuerySchema = z.object({
    output: z.enum(["json", "txt"]).default("txt"),
  });

  const jokenpoParamSchema = z.object({
    userChoice: z.enum(choices, {
      errorMap: (issue: ZodIssueOptionalMessage) => {
        const { received, path } = issue as CustomZodIssue;
        return {
          message: `Optou por "${received}", uma escolha inválida. As opções corretas são pedra, papel ou tesoura`,
          path,
        };
      },
    }),
  });

  const { output } = jokenpoQuerySchema.parse(request.query);
  const { userChoice } = jokenpoParamSchema.parse(request.params);

  const userWins = {
    pedra: "terousa",
    papel: "pedra",
    tesoura: "papel",
  } as UserWins;

  const choiceComputer = choices[Math.floor(Math.random() * choices.length)];

  let winner;
  let message;

  userChoice === choiceComputer
    ? ([winner, message] = ["nobody", "Empatou"])
    : userWins[userChoice] === choiceComputer
    ? ([winner, message] = ["user", "Você venceu"])
    : ([winner, message] = ["computer", "Você perdeu"]);

  const response = `Você escolheu ${userChoice}, o computador escolheu ${choiceComputer}. ${message}! Jogar novamente?`;

  if (output === "json") {
    reply.send({
      choices: {
        user: userChoice,
        computer: choiceComputer,
      },
      winner,
      message: response,
    });
  }

  reply.send(response);
}
