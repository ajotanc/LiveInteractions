import { FastifyRequest, FastifyReply } from "fastify";

export function useValidation(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: () => void
) {
  const query: any = request.query;

  if (query.queue) {
    query.queue = query.queue.toLowerCase();
  }

  if (query.championName) {
    query.championName = query.championName.toLowerCase();
  }

  done();
}
