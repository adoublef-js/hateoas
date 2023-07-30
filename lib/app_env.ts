import { OAuth2Client } from "deps";
import { Client } from "https://esm.sh/@libsql/client@0.3.1";

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
        dbClient: Client;
    };
};

export type AppEnv = AccessTokenEnv & OAuth2Env & SessionEnv & DatabaseEnv;
