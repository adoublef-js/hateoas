import { createAuth0OAuth2Client } from "deps";

export const oauth2Client = createAuth0OAuth2Client({
    redirectUri: `${Deno.env.get("APP_URL")}/i/callback`,
    defaults: {
        scope: "openid profile",
    },
});

export const logoutUrl = new URL(
    `https://${Deno.env.get("AUTH0_DOMAIN")}/v2/logout`
);
logoutUrl.searchParams.append("returnTo", Deno.env.get("APP_URL")!);
logoutUrl.searchParams.append("client_id", Deno.env.get("AUTH0_CLIENT_ID")!);
