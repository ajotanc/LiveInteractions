import * as dotenv from "dotenv";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { appRoutes } from "../src/http/routes";

dotenv.config();

const app = Fastify({
  logger: false,
});

app.register(appRoutes, {
  prefix: "/api",
});

export default async (request: FastifyRequest, reply: FastifyReply) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
