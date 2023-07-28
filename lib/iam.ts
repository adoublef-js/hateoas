import {
    Context,
    Next,
    getSessionId,
    getSessionAccessToken,
    OAuth2Client,
    MiddlewareHandler,
} from "deps";
import { AppEnv } from "lib/app_env.ts";

export function setSessionId(): MiddlewareHandler<AppEnv> {
    return async (c, next) => {
        c.set("sessionId", await getSessionId(c.req.raw));
        await next();
    };
}

export function setOAuthClient(
    client: OAuth2Client,
    logoutUrl: URL
): MiddlewareHandler<AppEnv> {
    return async (c, next) => {
        c.set("oauth2", { client, logoutUrl });
        await next();
    };
}

export function setAccessToken(): MiddlewareHandler<AppEnv> {
    return async (c, next) => {
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
