import type { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import sharp from "sharp";
import { z } from "zod";

export async function imageBase64(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const search = z.object({
		url: z.string(),
		portrait: z.coerce.number().optional().default(0),
	});

	const { url, portrait } = search.parse(request.query);

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

		let imageBuffer = response.data;

		if (portrait) {
			const metadata = await sharp(imageBuffer).metadata();
			const originalWidth = metadata.width || 1;
			const originalHeight = metadata.height || 1;

			const targetWidth = originalWidth;
			const targetHeight = (originalWidth * 4) / 3;

			let sy = originalHeight - targetHeight;
			if (sy < 0) sy = 0;

			imageBuffer = await sharp(imageBuffer)
				.extract({ left: 0, top: sy, width: targetWidth, height: targetHeight })
				.toBuffer();
		}

		const base64Image = imageBuffer.toString("base64");

		reply.send({
			status: true,
			message: null,
			image: `data:${mimeType};base64,${base64Image}`,
		});
	} catch (error) {
		reply.status(500).send({
			status: false,
			error: "Error downloading image!",
			image: null,
		});
	}
}
