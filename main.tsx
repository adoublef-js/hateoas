/** @jsx jsx */
import { iam } from "routes/iam/mod.ts";
import { numbers } from "routes/numbers/mod.tsx";
import { jsx, Hono, createAuth0OAuth2Client, serveStatic } from "deps";
import { AppEnv } from "lib/app_env.ts";
import { setOAuthClient, setSessionId } from "lib/iam.ts";
import { Home } from "components/Home.tsx";
import { Dashboard } from "components/Dashboard.tsx";
import { Status } from "https://deno.land/x/deno_kv_oauth@v0.2.8/deps.ts";

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

    app.onError((err, c) => {
        // if (err instanceof HTTPException) {
        //     // Get the custom response
        //     return c.html(<div>known error</div>);
        // }
        // If no sessionId then redirect to home
        return c.html(
            <div>
                <div>error do something</div>
                <a href="/">Home</a>
            </div>,
            Status.InternalServerError
        );
    });

    app.use("*", setOAuthClient(client, logoutUrl), setSessionId());

    app.get("/", ({ html, get }) =>
        get("sessionId") ? html(<Dashboard />) : html(<Home />)
    );

    app.route("/i", iam);
    app.route("/number", numbers);

    app.use("/assets/*", serveStatic({ root: "./" }));
    app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
