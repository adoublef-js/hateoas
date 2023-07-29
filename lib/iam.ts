import {
    getSessionId,
    getSessionAccessToken,
    OAuth2Client,
    MiddlewareHandler,
    HTTPException,
} from "deps";
import { STATUS_TEXT } from "https://deno.land/std@0.195.0/http/http_status.ts";
import { Status } from "https://deno.land/x/deno_kv_oauth@v0.2.8/deps.ts";
import { AppEnv } from "lib/app_env.ts";

export function setOAuthClient(
    client: OAuth2Client,
    logoutUrl: URL
): MiddlewareHandler<AppEnv> {
    return async ({ set }, next) => {
        set("oauth2", { client, logoutUrl });
        await next();
    };
}

export function setSessionId(): MiddlewareHandler<AppEnv> {
    return async ({ req, set }, next) => {
        set("sessionId", await getSessionId(req.raw));
        await next();
    };
}

export function setAccessToken(): MiddlewareHandler<AppEnv> {
    return async ({ get, set }, next) => {
        const { client } = get("oauth2");
        const sessionId = get("sessionId");

        const isSignedIn = sessionId !== undefined;

        const accessToken = isSignedIn
            ? await getSessionAccessToken(client, sessionId)
            : null;

        if (!accessToken) {
            throw new HTTPException(Status.Unauthorized, {
                message: STATUS_TEXT[Status.Unauthorized],
            });
        }

        set("accessToken", accessToken);
        await next();
    };
}

// https://hono.dev/api/exception#throw-httpexception
