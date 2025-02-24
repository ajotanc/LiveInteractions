import type { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { z } from "zod";

export async function imageBase64(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const search = z.object({
		url: z.string(),
	});

	const { url } = search.parse(request.query);

	try {
		const response = await axios.get(decodeURIComponent(url), {
			responseType: "arraybuffer",
		});

		let mimeType = response.headers["content-type"];

		if (!mimeType || mimeType === "application/octet-stream") {
			const fileExtension = url.split(".").pop()?.toLowerCase();
			switch (fileExtension) {
				case "png":
					mimeType = "image/png";
					break;
				case "jpg":
				case "jpeg":
					mimeType = "image/jpeg";
					break;
				case "gif":
					mimeType = "image/gif";
					break;
				case "webp":
					mimeType = "image/webp";
					break;
				default:
					mimeType = "image/png";
			}
		}

		const base64Image = Buffer.from(response.data, "binary").toString("base64");

		reply.send({
			status: true,
			message: null,
			image: `data:${mimeType};base64,${base64Image}`,
		});
	} catch (error) {
		reply.status(500).send({
			status: false,
			error: "Error downloading image.",
			image: null,
		});
	}
}
