import { OAuth2Client } from "deps";

export type AccessTokenEnv = {
    Variables: {
        accessToken: string | null;
    };
};

export type OAuth2Env = {
    Variables: {
        oauth2: { client: OAuth2Client; logoutUrl: URL };
    };
};

export type AppEnv = AccessTokenEnv & OAuth2Env;