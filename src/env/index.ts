import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  SECRET_KEY_RIOT: z
    .string()
    .default("RGAPI-603cb1b7-671a-4521-a5af-602a7a5e55eb"),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variable.", _env.error.format());
  throw new Error("Invalid environment variable.");
}

export const env = _env.data;
