/** @jsx jsx */
/** @jsxFrag Fragment */
import {
    getSessionAccessToken,
    getSessionId,
    Hono,
    jsx,
    OAuth2Client,
} from "deps";
import { BaseLayout } from "layouts/mod.ts";
import { Counter } from "components/counter/Counter.tsx";
import { injectOauthClient, Oauth2Variables } from "lib/oauth.ts";
import { iam } from "routes/iam/mod.ts";
import { numbers } from "routes/numbers/mod.tsx";

// assume that this will always exists
const app = new Hono<{ Variables: Oauth2Variables }>();
app.use("*", injectOauthClient);

app.get("/", async (c) => {
    const sessionId = await getSessionId(c.req.raw);
    const isSignedIn = sessionId !== undefined;
    const accessToken = isSignedIn
        ? await getSessionAccessToken(c.get("oauth2").client, sessionId)
        : null;

    return c.html(
        <BaseLayout>
            <div>
                <title>Deno 💛 Hateoas</title>
                {accessToken === null ? (
                    <div>
                        <p>Please log in 🤔</p>
                        <a href="/i/signin">Sign in</a>
                    </div>
                ) : (
                    <div>
                        <p>Thank you for signing up! 😊</p>
                        <a href="/i/signout">Sign out</a>
                    </div>
                )}
                {accessToken && (
                    <div>
                        <Counter value={0} />
                    </div>
                )}
            </div>
        </BaseLayout>
    );
});

app.route("/i", iam);
app.route("/number", numbers);

const port = Number(Deno.env.get("PORT"));
Deno.serve({ port }, app.fetch);
