import { Hono, serveStatic, HTTPException, logger } from "deps";
import { createClient as createClient } from "lib/libsql/create_client.ts";
import { NotFound, Home, Dashboard } from "components/mod.ts";
import { iamHelpers } from "./iam_helpers.ts";
import { accessToken, oauth } from "./iam/middleware.ts";
import { iam } from "./iam/mod.ts";
import { database } from "lib/libsql/middleware.ts";
import { AccessTokenEnv, IamEnv } from "./iam/types.ts";

const db = createClient({ url: "file:hateoas.db" });

try {
    await db.batch([]);
} catch (e) {
    console.error(e.message);

    db.close();
    Deno.exit(1);
}

const { jwksUrl, oauthClient, logoutUrl, audience } = iamHelpers;

if (import.meta.main) {
    const app = new Hono<IamEnv & AccessTokenEnv>();

    app.use("*", logger());
    app.use("*", database(db));
    app.use("*", oauth(oauthClient, logoutUrl, jwksUrl, audience));

    app.get("/", accessToken(), ({ get, html }) => {
        const [accessToken] = [get("accessToken")];
        if (!accessToken) {
            return html(<Home siteData={{ title: "Home" }} />);
        }

        return html(<Dashboard siteData={{ title: "Dashboard" }} />);
    });

    app.route("/i", iam);

    app.use("/icon.svg", serveStatic({ path: "./static/icon.svg" }));
    app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));
    app.use("/*", serveStatic({ root: "./static/" }));

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
