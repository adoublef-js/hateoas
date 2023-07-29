import { iam } from "api/iam/mod.ts";
import { counters } from "api/counters/mod.tsx";
import {
    Hono,
    createAuth0OAuth2Client,
    serveStatic,
    HTTPException,
    logger,
} from "deps";
import { AppEnv } from "lib/app_env.ts";
import { oauthClient, session } from "lib/iam.tsx";
import { Home } from "components/Home.tsx";
import { Dashboard } from "components/Dashboard.tsx";

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

    app.onError((err, { html }) => {
        if (err instanceof HTTPException) {
            return err.getResponse();
        }
        // TODO if this is called then the client is very smart
        // get them to help make the app better
        return html("I don't know how you down here, please contact me!");
    });

    app.notFound((c) => {
        return c.text("Custom 404 Message", 404);
    });

    app.use("*", logger(), oauthClient(client, logoutUrl), session());

    app.get("/", ({ html, get }) =>
        // TODO app profile
        get("sessionId")
            ? html(<Dashboard siteData={{ title: "Welcome, Deno!" }} />)
            : html(<Home siteData={{ title: "Deno 💛 Htmx" }} />)
    );

    app.route("/i", iam);
    app.route("/count", counters);

    app.use("/*", serveStatic({ root: "./static/" }));
    app.use("/icon.svg", serveStatic({ path: "./static/icon.svg" }));
    app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
