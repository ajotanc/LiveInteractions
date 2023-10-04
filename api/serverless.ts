import * as dotenv from "dotenv";

import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { instance } from "../src/app";

dotenv.config();

const app = Fastify({
  logger: false,
});

app.register(instance);

export default async (request: FastifyRequest, reply: FastifyReply) => {
  await app.ready();
  app.server.emit("request", request, reply);
};
