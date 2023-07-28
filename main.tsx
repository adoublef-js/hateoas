import { iam } from "routes/iam/mod.ts";
import { numbers } from "routes/numbers/mod.tsx";
import { Hono, createAuth0OAuth2Client } from "deps";
import { AppEnv } from "lib/app_env.ts";
import { jsx } from "./jsx.ts";
import { setAccessToken, setOAuthClient, setSessionId } from "lib/iam.ts";

const client = createAuth0OAuth2Client({
    redirectUri: `${Deno.env.get("APP_URL")}/i/callback`,
    defaults: {
        scope: "openid profile",
    },
});

const logoutUrl = new URL(`https://${Deno.env.get("AUTH0_DOMAIN")}/v2/logout`);
logoutUrl.searchParams.append("returnTo", Deno.env.get("APP_URL")!);
logoutUrl.searchParams.append("client_id", Deno.env.get("AUTH0_CLIENT_ID")!);

if (import.meta.main) {
    const app = new Hono<AppEnv>();
    app.use(
        "*",
        setOAuthClient(client, logoutUrl),
        setSessionId(),
        setAccessToken()
    );

    // getTokensBySession;
    // getCookieName;

    app.route("/", jsx);
    app.route("/i", iam);
    app.route("/number", numbers);

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
