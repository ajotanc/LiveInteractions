import { FastifyRequest, FastifyReply } from "fastify";
import { QueryObject } from "@/interfaces";
import { capitalizeFirstLetter } from "@/helpers";

export function useValidation(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: () => void,
) {
  const query = request.query as QueryObject;
  const params = request.params as QueryObject;

  if (query.queue) {
    query.queue = query.queue.toLowerCase();
  }

  if (params.championName) {
    params.championName = capitalizeFirstLetter(params.championName);
  }

  if (params.userChoice) {
    params.userChoice = params.userChoice.toLowerCase();
  }

  done();
}
