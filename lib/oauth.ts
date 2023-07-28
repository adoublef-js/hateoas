import {
    Context,
    MiddlewareHandler,
    Next,
    OAuth2Client,
    createAuth0OAuth2Client,
} from "deps";

const client = createAuth0OAuth2Client({
    // this is subject to change when running tests
    redirectUri: `${Deno.env.get("APP_URL")}/i/callback`,
    defaults: {
        scope: "openid profile",
    },
});

const logoutUrl = new URL(`https://${Deno.env.get("AUTH0_DOMAIN")}/v2/logout`);
logoutUrl.searchParams.append("returnTo", Deno.env.get("APP_URL")!);
logoutUrl.searchParams.append("client_id", Deno.env.get("AUTH0_CLIENT_ID")!);

export async function injectOauthClient(c: Context<OAuth2Env>, next: Next) {
    c.set("oauth2", { client, logoutUrl });
    await next();
}

export type OAuth2Env = {
    Variables: {
        oauth2: { client: OAuth2Client; logoutUrl: URL };
    };
};

export type OAuthHandler = MiddlewareHandler<OAuth2Env>;
