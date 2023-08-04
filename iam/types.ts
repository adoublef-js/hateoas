import { JWTPayload, OAuth2Client, createRemoteJWKSet } from "deps";

export type IamEnv = {
    Variables: {
        iam: {
            client: OAuth2Client;
            logoutUrl: URL;
            jwtAuth: ReturnType<typeof createRemoteJWKSet>;
            aud?: string[];
        };
    };
};

export type AccessTokenEnv = {
    Variables: {
        accessToken?:
            | {
                  raw: string;
                  payload: JWTPayload & {
                      scope?: string;
                  };
              }
            | undefined;
    };
};
