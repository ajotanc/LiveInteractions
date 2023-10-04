import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";

import { useValidation } from "./http/hooks/useValidation";

import { env } from "./env";
import { QueryObject } from "./interfaces";

export const app = fastify();

const corsOptions = {
  origin: "*",
};

app.register(cors, corsOptions);
app.register(multipart);

app.addHook("preValidation", useValidation);

app.setErrorHandler((error, request, reply) => {
  const { output } = request.query as QueryObject;

  if (error instanceof ZodError) {
    if (output === "txt") {
      const { errors } = error;
      const message = errors.map((error) => error.message).join(" | ");

      return reply.send(message);
    }

    return reply
      .status(404)
      .send({ message: "Validation error.", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: Here we should log to on external tool like DataDog/NewReplic/Sentry
  }

  if (output === "txt") {
    reply.send(error.message);
  }

  return reply.status(500).send({ message: "Internal server error." });
});
