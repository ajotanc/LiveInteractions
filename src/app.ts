import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyFirebase from "fastify-firebase";
import fastifyCron from "fastify-cron";
import { ZodError } from "zod";

import { useValidation } from "./http/hooks/useValidation";

import { env } from "./env";
import { QueryObject } from "./interfaces";
import { routes } from "./http/routes";

export const app = fastify();
app.register(instance);

export async function instance(
  instance: FastifyInstance,
  _opts: FastifyServerOptions,
  done,
) {
  const corsOptions = {
    origin: "*",
  };

  instance.register(fastifyFirebase, env.FIREBASE_PRIVATY_KEY);
  instance.register(routes, { prefix: "/api/v1" });
  instance.register(cors, corsOptions);
  instance.register(multipart);

  instance.addHook("preValidation", useValidation);

  instance.register(fastifyCron, {
    jobs: [
      {
        cronTime: "12 21 * * 3",
        onTick: () => {
          console.log("teste");
        },
        start: true,
      },
    ],
  });

  instance.setErrorHandler((error, request, reply) => {
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

  done();
}
