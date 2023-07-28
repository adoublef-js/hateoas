import { iam } from "routes/iam/mod.ts";
import { numbers } from "routes/numbers/mod.tsx";
import { home } from "routes/home.tsx";
import { Hono } from "deps";
import { OAuth2Env, injectOauthClient } from "lib/oauth.ts";

if (import.meta.main) {
    const app = new Hono<OAuth2Env>();
    app.use("*", injectOauthClient);

    app.get("/", home);
    app.route("/i", iam);
    app.route("/number", numbers);

    const port = Number(Deno.env.get("PORT"));
    Deno.serve({ port }, app.fetch);
}
