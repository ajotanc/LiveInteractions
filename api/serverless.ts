import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { routes } from "../src/http/routes";

const app = Fastify({
  logger: false,
});

app.register(routes, {
  prefix: "/",
});

export default async (request: FastifyRequest, reply: FastifyReply) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
