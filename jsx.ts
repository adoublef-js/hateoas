import { Hono } from "deps";
import { AppEnv } from "lib/app_env.ts";
import { home } from "routes/home.tsx";
import { setSessionId } from "lib/iam.ts";

export const jsx = new Hono<AppEnv>();

jsx.get("/", setSessionId(), home);
