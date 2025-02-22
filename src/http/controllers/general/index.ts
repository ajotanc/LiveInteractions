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
		const base64Image = Buffer.from(response.data, "binary").toString("base64");

		reply.send({
			status: true,
			message: null,
			image: `data:image/png;base64,${base64Image}`,
		});
	} catch (error) {
		reply.status(500).send({
			status: false,
			error: "Erro ao baixar imagem.",
		});
	}
}
