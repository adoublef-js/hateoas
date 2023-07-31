import {
    Hono,
    createAuth0OAuth2Client,
    serveStatic,
    HTTPException,
    logger,
} from "deps";
import { iam } from "api/iam/mod.ts";
import { counters } from "api/counters/mod.tsx";
import { AppEnv } from "lib/app_env.ts";
import { oauth, session } from "lib/iam.tsx";
import { createClient as createLibSqlClient } from "lib/libsql/create_client.ts";
import { database } from "lib/libsql/mod.ts";
import { Home } from "components/Home.tsx";
import { Dashboard } from "components/Dashboard.tsx";
import { NotFound } from "components/_404.tsx";

const client = createAuth0OAuth2Client({
    redirectUri: `${Deno.env.get("APP_URL")}/i/callback`,
    defaults: {
        scope: "openid profile",
    },
});

const logoutUrl = new URL(`https://${Deno.env.get("AUTH0_DOMAIN")}/v2/logout`);
logoutUrl.searchParams.append("returnTo", Deno.env.get("APP_URL")!);
logoutUrl.searchParams.append("client_id", Deno.env.get("AUTH0_CLIENT_ID")!);

const db = createLibSqlClient({ url: "file:hateoas.db" });

if (import.meta.main) {
    const app = new Hono<AppEnv>();

    app.onError((err, { html }) => {
        if (err instanceof HTTPException) {
            return err.getResponse();
        }

        console.log(err);
        return html("I don't know how you down here, please contact me!");
    });

    app.notFound(({ html }) => {
        return html(<NotFound siteData={{ title: "Not Found" }} />, 404);
    });

    app.use("*", logger(), database(db), oauth(client, logoutUrl), session());

    app.get("/", ({ html, get }) =>
        get("sessionId")
            ? html(<Dashboard siteData={{ title: "Welcome, Deno!" }} />)
            : html(<Home siteData={{ title: "Deno 💛 Htmx" }} />)
    );

    app.route("/i", iam);
    app.route("/count", counters);

    app.use("/*", serveStatic({ root: "./static/" }));
    app.use("/icon.svg", serveStatic({ path: "./static/icon.svg" }));
    app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

    const ac = new AbortController();
    Deno.addSignalListener("SIGINT", () => {
        console.log("closing server...");
        ac.abort();
    });

    const port = Number(Deno.env.get("PORT"));
    const server = Deno.serve({ port, signal: ac.signal }, app.fetch);

    await server.finished;
    console.log("server finished");
}
