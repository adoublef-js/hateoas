import {
    getSessionId,
    getSessionAccessToken,
    OAuth2Client,
    Status,
    MiddlewareHandler,
    createRemoteJWKSet,
    jwtVerify,
} from "deps";
import { AppEnv } from "lib/app_env.ts";

/** */
export function session(): MiddlewareHandler<AppEnv> {
    return async ({ req, set }, next) => {
        set("sessionId", getSessionId(req.raw));
        await next();
    };
}

/**  */
export function oauth(
    client: OAuth2Client,
    logoutUrl: URL,
    jwksUrl: URL,
    aud?: string[]
): MiddlewareHandler<AppEnv> {
    const jwtAuth = createRemoteJWKSet(jwksUrl);

    return async ({ set }, next) => {
        set("iam", { client, logoutUrl, jwtAuth, aud });
        await next();
    };
}

/** */
export function accessToken(): MiddlewareHandler<AppEnv> {
    const parseRequest = async (c: OAuth2Client, req: Request) => {
        const sessionId = getSessionId(req);
        if (!sessionId) return null;

        return await getSessionAccessToken(c, sessionId);
    };

    const exts = ["css", "svg", "img"].map((ext) => "." + ext);
    const isStaticFile = (req: Request) => {
        return exts.some((ext) => req.url.endsWith(ext));
    };

    return async ({ req, get, set }, next) => {
        // this should return a 404 if user tried to pass an illegal url
        if (isStaticFile(req.raw)) return next();

        const { client, aud, jwtAuth } = get("iam");
        const raw = await parseRequest(client, req.raw);
        if (!raw) return next();

        // TODO could this fail?
        const { payload } = await jwtVerify(raw, jwtAuth, {
            audience: aud,
            requiredClaims: ["sub", "scope"],
        });

        set("accessToken", { raw, payload });
        await next();
    };
}

/** */
export function authorized(scope: string): MiddlewareHandler<AppEnv> {
    return async ({ get, redirect }, next) => {
        const [{ jwtAuth }, sessionId] = [get("iam"), get("sessionId")];
        // if

        const [accessToken] = [get("accessToken")];
        if (!accessToken) {
            return redirect("/", Status.Found);
        }

        if (!accessToken.payload.scope?.split(" ").includes(scope)) {
            // TODO throw 401 error
            return redirect("/", Status.Found);
        }

        await next();
    };
}

// https://hono.dev/api/exception#t@@hrow-httpexception
