/** @jsx jsx */
/** @jsxFrag Fragment */
import { Handler, getSessionAccessToken, getSessionId, jsx } from "deps";
import { BaseLayout } from "layouts/mod.ts";
import { Counter } from "components/counter/Counter.tsx";
import { OAuth2Env } from "lib/oauth.ts";

export const home: Handler<OAuth2Env> = async (c) => {
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
};
