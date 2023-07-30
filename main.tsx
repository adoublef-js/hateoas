import { iam } from "api/iam/mod.ts";
import { counters } from "api/counters/mod.tsx";
import {
    Hono,
    createAuth0OAuth2Client,
    serveStatic,
    HTTPException,
    logger,
    MiddlewareHandler,
} from "deps";
import { AppEnv } from "lib/app_env.ts";
import { oauthClient, session } from "lib/iam.tsx";
import { Home } from "components/Home.tsx";
import { Dashboard } from "components/Dashboard.tsx";
import { Client, createClient } from "https://esm.sh/@libsql/client@0.3.1/web";

/* TODO find home for this */
export function tursoClient(c: Client): MiddlewareHandler<AppEnv> {
    return async ({ set }, next) => {
        set("dbClient", c);
        await next();
    };
}

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
    // const dbUrl = "file:hateoas.db";
    // const authToken = "";
    const dbUrl = Deno.env.get("DATABASE_URL")!;
    const authToken = Deno.env.get("TURSO_AUTH_TOKEN");

    const db = createClient({ url: dbUrl, authToken });

    const app = new Hono<AppEnv>();

    app.onError((err, { html }) => {
        if (err instanceof HTTPException) {
            return err.getResponse();
        }
        console.log(err);
        // TODO if this is called then the client is very smart
        // get them to help make the app better
        return html("I don't know how you down here, please contact me!");
    });

    app.notFound((c) => {
        return c.text("Custom 404 Message", 404);
    });

    app.use(
        "*",
        logger(),
        tursoClient(db),
        oauthClient(client, logoutUrl),
        session()
    );

    app.get("/", ({ html, get }) =>
        // TODO app profile
        get("sessionId")
            ? html(<Dashboard siteData={{ title: "Welcome, Deno!" }} />)
            : html(<Home siteData={{ title: "Deno 💛 Htmx" }} />)
    );

    app.get("/turso", async (ctx) => {
        const rs = await db.execute("SELECT 42;");

        return ctx.json(rs.rows[0]);
    });

    app.route("/i", iam);
    app.route("/count", counters);

    app.use("/*", serveStatic({ root: "./static/" }));
    app.use("/icon.svg", serveStatic({ path: "./static/icon.svg" }));
    app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
