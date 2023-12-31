import {
    getSessionId,
    getSessionAccessToken,
    OAuth2Client,
    Status,
    MiddlewareHandler,
    jwtVerify,
    createRemoteJWKSet,
} from "deps";
import { AccessTokenEnv, IamEnv } from "./types.ts";

/**  */
export function oauth(
    client: OAuth2Client,
    logoutUrl: URL,
    jwksUrl: URL,
    aud?: string[]
): MiddlewareHandler<IamEnv> {
    const jwtAuth = createRemoteJWKSet(jwksUrl);

    return async ({ set }, next) => {
        set("iam", { client, logoutUrl, jwtAuth, aud });
        await next();
    };
}

/** */
export function accessToken(): MiddlewareHandler<IamEnv & AccessTokenEnv> {
    const parseRequest = async (c: OAuth2Client, req: Request) => {
        const sessionId = getSessionId(req);
        if (!sessionId) return null;

        return await getSessionAccessToken(c, sessionId);
    };

    return async ({ req, get, set }, next) => {
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

const exts = [".css", ".svg", ".img"] as const;
const isStaticFile = (req: Request) => {
    return exts.some((ext) => req.url.endsWith(ext));
};

/** */
// export function authorized(
//     scope: string
// ): MiddlewareHandler<IamEnv & AccessTokenEnv> {
//     return async ({ get, redirect }, next) => {
//         const [{ jwtAuth }, sessionId] = [get("iam"), get("sessionId")];
//         // if

//         const [accessToken] = [get("accessToken")];
//         if (!accessToken) {
//             return redirect("/", Status.Found);
//         }

//         if (!accessToken.payload.scope?.split(" ").includes(scope)) {
//             // TODO throw 401 error
//             return redirect("/", Status.Found);
//         }

//         await next();
//     };
// }

// https://hono.dev/api/exception#t@@hrow-httpexception
