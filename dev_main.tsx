import { Hono, serveStatic, HTTPException, logger } from "deps";
import { createClient as createLibSqlClient } from "lib/libsql/create_client.ts";
import { iam } from "api/iam/mod.ts";
import { accessToken, oauth } from "api/iam/middleware.ts";
import { counters } from "api/counters/mod.tsx";
import { database } from "api/middleware.ts";
import { NotFound, Home, Dashboard, Settings, About } from "components/mod.ts";
import { AppEnv } from "lib/app_env.ts";
import { iamHelpers } from "./iam_helpers.ts";

const db = createLibSqlClient({ url: "file:hateoas.db" });

try {
    // run migration file here
    await db.batch([
        "DROP TABLE IF EXISTS people;",
        `CREATE TABLE people (
        -- primary key
        id TEXT,
        -- the auth provider's natural key
        user TEXT UNIQUE,
        PRIMARY KEY (id)
    );`,
    ]);
} catch (e) {
    console.error(e.message);

    db.close();
}

const { jwksUrl, oauthClient, logoutUrl, audience } = iamHelpers;

if (import.meta.main) {
    const app = new Hono<AppEnv>();

    [
        logger(),
        database(db),
        oauth(oauthClient, logoutUrl, jwksUrl, audience),
        accessToken(),
    ].forEach((middleware) => app.use("*", middleware));

    app.get("/", ({ get, html }) => {
        const [accessToken] = [get("accessToken")];
        if (!accessToken) {
            return html(<Home siteData={{ title: "Deno 💛 Htmx" }} />);
        }

        return html(<Dashboard siteData={{ title: "Welcome, Deno!" }} />);
    });

    app.get("/about", ({ html }) => {
        return html(<About siteData={{ title: "About" }} />);
    });

    app.get("/settings", ({ get, html, redirect }) => {
        if (!get("accessToken")) return redirect("/");

        return html(<Settings siteData={{ title: "My Settings" }} />);
    });

    app.route("/i", iam);
    app.route("/c", counters);

    app.use("/*", serveStatic({ root: "./static/" }));
    app.use("/icon.svg", serveStatic({ path: "./static/icon.svg" }));
    app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

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

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
