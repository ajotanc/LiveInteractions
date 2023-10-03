import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { ZodError } from "zod";
import { appRoutes } from "./http/routes";
import { env } from "./env";
import { InvalidMimeTypes } from "./errors/invalid-mimetypes";
import { ChampionNotFound } from "./errors/champion-not-found";
import { useValidation } from "./http/hooks/useValidation";

export const app = fastify();

const corsOptions = {
  origin: "*",
};

app.register(cors, corsOptions);
app.register(multipart);
app.register(appRoutes, { prefix: "api" });

app.addHook("preValidation", useValidation);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(404)
      .send({ message: "Validation error.", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: Here we should log to on external tool like DataDog/NewReplic/Sentry
  }

  if (error instanceof InvalidMimeTypes) {
    reply.status(409).send({ message: error.message });
  }

  if (error instanceof ChampionNotFound) {
    reply.status(404).send({ message: error.message });
  }

  return reply.status(500).send({ message: "Internal server error." });
});
