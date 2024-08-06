import { app } from "./app";
import { env } from "./env";

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
