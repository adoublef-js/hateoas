import {
    Context,
    Next,
    getSessionId,
    getSessionAccessToken,
    OAuth2Client,
} from "deps";
import { AppEnv } from "lib/app_env.ts";

export function setSessionId() {
    return async (c: Context<AppEnv>, next: Next) => {
        c.set("sessionId", await getSessionId(c.req.raw));
        await next();
    };
}

export function setOAuthClient(client: OAuth2Client, logoutUrl: URL) {
    return async (c: Context<AppEnv>, next: Next) => {
        c.set("oauth2", { client, logoutUrl });
        await next();
    };
}

export function setAccessToken() {
    return async (c: Context<AppEnv>, next: Next) => {
        const { client } = c.get("oauth2");
        const sessionId = c.get("sessionId");

        const isSignedIn = sessionId !== undefined;
        const accessToken = isSignedIn
            ? await getSessionAccessToken(client, sessionId)
            : null;

        c.set("accessToken", accessToken);
        await next();
    };
}
