import type { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { z } from "zod";

export async function downloadImage(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const search = z.object({
		url: z.string(),
	});

	const { url } = search.parse(request.query);

	try {
		const response = await axios.get(url, { responseType: "arraybuffer" });

		const base64Image = Buffer.from(response.data).toString("base64");
		const contentType = response.headers["content-type"] || "image/png";

		reply.send({
			image: `data:${contentType};base64,${base64Image}`,
		});
	} catch (error) {
		console.error(error);
		reply.status(500).send({ error: "Erro ao baixar imagem." });
	}
}
