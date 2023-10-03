import { FastifyRequest, FastifyReply } from "fastify";

export function useValidation(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: () => void
) {
  const query: any = request.query;

  if (!query.queue) {
    query.queue = "solo";
  } else {
    query.queue = query.queue.toLowerCase();
  }

  done();
}
