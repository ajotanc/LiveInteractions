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
		// console.log(imageBuffer);

		if (portrait) {
			const metadata = await sharp(imageBuffer).metadata();
			const originalWidth = metadata.width;
			const originalHeight = metadata.height;

			const targetHeight = originalHeight;
			const targetWidth = (originalHeight * 3) / 4;

			const sx = (originalWidth - targetWidth) / 2;
			const sy = originalHeight - targetHeight;

			try {
				imageBuffer = await sharp(imageBuffer)
					.extract({
						left: sx,
						top: sy,
						width: targetWidth,
						height: targetHeight,
					})
					.toBuffer();
			} catch (error) {
				console.log(error);
			}
		}

		const base64Image = Buffer.from(imageBuffer).toString("base64");

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
