/** @jsx jsx */
/** @jsxFrag Fragment */
import {
    getSessionAccessToken,
    getSessionId,
    handleCallback,
    signIn,
    signOut,
    Hono,
    jsx,
} from "deps";
import { BaseLayout } from "layouts/mod.ts";
import { Counter } from "components/counter/Counter.tsx";
import { oauth2Client } from "lib/oauth.ts";
import { iam } from "./iam/mod.ts";
import { numbers } from "./numbers/mod.tsx";

const app = new Hono();

app.get("/", async (c) => {
    const sessionId = await getSessionId(c.req.raw);
    const isSignedIn = sessionId !== undefined;
    const accessToken = isSignedIn
        ? await getSessionAccessToken(oauth2Client, sessionId)
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
