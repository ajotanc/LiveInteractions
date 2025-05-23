import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
	PORT: z.coerce.number().default(3333),
	SECRET_KEY_RIOT: z.string(),
	FIREBASE_PRIVATY_KEY: z.string().transform((value) => JSON.parse(value)),
	FINANCING_END_DATE_MAGISTRIKE: z.string(),
	URL_DOC_ESOCIAL: z.string(),
	SUPABASE_URL: z.string(),
	SUPABASE_KEY: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error("Invalid environment variable.", _env.error.format());
	throw new Error("Invalid environment variable.");
}

export const env = _env.data;
