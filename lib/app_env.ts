import { OAuth2Client, LibSqlClient } from "deps";

export type AccessTokenEnv = {
    Variables: {
        accessToken: string | null;
    };
};

export type SessionEnv = {
    Variables: {
        sessionId: string | undefined;
    };
};

export type OAuth2Env = {
    Variables: {
        oauth2: { client: OAuth2Client; logoutUrl: URL };
    };
};

export type DatabaseEnv = {
    Variables: {
        dbClient: LibSqlClient;
    };
};

export type AppEnv = AccessTokenEnv & OAuth2Env & SessionEnv & DatabaseEnv;
