import * as dotenv from "dotenv";
import { appRoutes } from "../src/http/routes";

// Require the framework
import Fastify, { FastifyReply, FastifyRequest } from "fastify";

dotenv.config();

// Instantiate Fastify with some config
const app = Fastify({
  logger: false,
});

// Register your application as a normal plugin.
app.register(appRoutes, {
  prefix: "/",
});

export default async (request: FastifyRequest, reply: FastifyReply) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
