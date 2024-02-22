import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { extractData } from "../../../helpers";

export async function getResponse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const othersParamsSchema = z.object({
    url: z.string(),
  });

  const { url } = othersParamsSchema.parse(request.params);
  const $ = await extractData(decodeURIComponent(url));

  reply.send({
    body: $("html").html(),
  });
}
