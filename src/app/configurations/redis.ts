import { createClient } from "redis";
import environments from "./environments";

export const client = createClient({
  username: environments.redis.user,
  password: environments.redis.password,
  socket: {
    host: environments.redis.host,
    port: environments.redis.port,
  },
});

// eslint-disable-next-line no-console
client.on("error", (error) => console.log("Redis client error: ", error));
