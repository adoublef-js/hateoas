import { Hono } from "deps";
import { handleSignIn } from "./handle_sign_in.ts";
import { IamEnv } from "./types.ts";
import { handleCallback } from "./handle_callback.ts";
import { handleSignOut } from "./handle_sign_out.ts";

export const app = new Hono<IamEnv>();

app.get("/signin", handleSignIn());
app.get("/callback", handleCallback());
app.get("/signout", handleSignOut());

export { app as iam };
