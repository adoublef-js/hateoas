import {
    LibSqlClient,
    OAuth2Client,
    createRemoteJWKSet,
    JWTPayload,
} from "deps";

type WithVariables<V extends Record<string, unknown> = {}> = {
    Variables: V;
};

export type AccessTokenEnv = WithVariables<{
    accessToken?: { raw: string; payload: JWTPayload & { scope?: string } };
}>;

export type SessionEnv = WithVariables<{
    sessionId: string | undefined;
}>;

export type IamEnv = WithVariables<{
    iam: {
        client: OAuth2Client;
        logoutUrl: URL;
        jwtAuth: ReturnType<typeof createRemoteJWKSet>;
        aud?: string[];
    };
}>;

export type DatabaseEnv = WithVariables<{
    db: LibSqlClient;
}>;

export type JwtAuthEnv = WithVariables<{
    jwtAuth: ReturnType<typeof createRemoteJWKSet>;
}>;

export type AppEnv = AccessTokenEnv &
    IamEnv &
    SessionEnv &
    DatabaseEnv &
    JwtAuthEnv;
