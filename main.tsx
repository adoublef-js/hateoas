import { Hono, logger, serveStatic } from "deps";
import { iamHelpers } from "./iam_helpers.ts";
import { IamEnv, AccessTokenEnv } from "./iam/types.ts";
import { iam } from "./iam/mod.ts";
import { Dashboard } from "components/dashboard.tsx";
import { Home } from "components/home.tsx";
import { accessToken, oauth } from "./iam/middleware.ts";
import { database } from "lib/libsql/middleware.ts";
import { createClient } from "lib/libsql/create_client.ts";

const dbUrl = Deno.env.get("DATABASE_URL")!;
const authToken = Deno.env.get("TURSO_AUTH_TOKEN");
const db = createClient({ url: dbUrl, authToken });

const { jwksUrl, oauthClient, logoutUrl, audience } = iamHelpers;

if (import.meta.main) {
    const app = new Hono<IamEnv & AccessTokenEnv>();

    app.use("*", logger());
    app.use("*", database(db));
    app.use("*", oauth(oauthClient, logoutUrl, jwksUrl, audience));

    app.get("/", async ({ get, html }) => {
        // connect
        return html(<div>Hello, World</div>);
    });

    // app.get("/", accessToken(), ({ get, html }) => {
    //     const [accessToken] = [get("accessToken")];
    //     if (!accessToken) {
    //         return html(<Home siteData={{ title: "Home" }} />);
    //     }

    //     return html(<Dashboard siteData={{ title: "Dashboard" }} />);
    // });

    // app.route("/i", iam);

    // app.use("/*", serveStatic({ root: "./static/" }));
    // app.use("/icon.svg", serveStatic({ path: "./static/icon.svg" }));
    // app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
