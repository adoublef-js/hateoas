import {
    getSessionId,
    getSessionAccessToken,
    OAuth2Client,
    MiddlewareHandler,
    Status,
} from "deps";
import { AppEnv } from "lib/app_env.ts";

export function oauthClient(
    client: OAuth2Client,
    logoutUrl: URL
): MiddlewareHandler<AppEnv> {
    return async ({ set }, next) => {
        set("oauth2", { client, logoutUrl });
        await next();
    };
}

export function session(): MiddlewareHandler<AppEnv> {
    return async ({ req, set }, next) => {
        set("sessionId", await getSessionId(req.raw));
        await next();
    };
}

export function authorization(): MiddlewareHandler<AppEnv> {
    return async ({ get, set, redirect }, next) => {
        const sessionId = get("sessionId");
        if (!sessionId) {
            return redirect("/", Status.Found);
        }

        const { client } = get("oauth2");
        const accessToken = await getSessionAccessToken(client, sessionId);
        // check token has right scopes/roles/permission

        set("accessToken", accessToken);
        await next();
    };
}

// https://hono.dev/api/exception#t@@hrow-httpexception
