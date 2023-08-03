import { createAuth0OAuth2Client, createRemoteJWKSet } from "deps";

const oauthClient = createAuth0OAuth2Client({
    redirectUri: `${Deno.env.get("APP_URL")}/i/callback`,
    defaults: {
        scope: Deno.env.get("AUTH0_SCOPE")!.split(","),
    },
});

const oauthDomain = new URL(oauthClient.config.authorizationEndpointUri).origin;

const jwksUrl = new URL(`${oauthDomain}/.well-known/jwks.json`);
const jwks = createRemoteJWKSet(jwksUrl);

const params = new URLSearchParams();
params.append("returnTo", new URL(oauthClient.config.redirectUri!).origin);
params.append("client_id", oauthClient.config.clientId);

const logoutUrl = new URL(`v2/logout?${params}`, oauthDomain);
const audience = Deno.env.get("AUTH0_AUDIENCE")?.split(",");

export const iamHelpers = {
    oauthClient: oauthClient,
    jwks,
    jwksUrl,
    audience,
    logoutUrl,
} as const;
