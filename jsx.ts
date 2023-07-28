import { Context, Hono, Next, getSessionAccessToken, getSessionId } from "deps";
import { AccessTokenEnv, AppEnv, OAuth2Env } from "lib/app_env.ts";
import { home } from "routes/home.tsx";

export const jsx = new Hono<AccessTokenEnv & OAuth2Env>();

async function session(c: Context<AppEnv>, next: Next) {
    const { client } = c.get("oauth2");

    const sessionId = await getSessionId(c.req.raw);
    const isSignedIn = sessionId !== undefined;
    const accessToken = isSignedIn
        ? await getSessionAccessToken(client, sessionId)
        : null;

    c.set("accessToken", accessToken);
    await next();
}

jsx.get("/", session, home);
