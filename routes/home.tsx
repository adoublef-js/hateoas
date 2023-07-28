/** @jsx jsx */
/** @jsxFrag Fragment */
import { Handler, getSessionAccessToken, getSessionId, jsx } from "deps";
import { BaseLayout } from "layouts/mod.ts";
import { Counter } from "components/counter/Counter.tsx";
import { AccessTokenEnv, AppEnv } from "lib/app_env.ts";

export const home: Handler<AppEnv> = (c) => {
    const accessToken = c.get("accessToken");

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
