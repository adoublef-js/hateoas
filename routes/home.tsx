/** @jsx jsx */
/** @jsxFrag Fragment */
import { Handler, getSessionAccessToken, getSessionId, jsx } from "deps";
import { BaseLayout } from "layouts/mod.ts";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";

export const home: Handler<AppEnv> = (c) => {
    const isSignedIn = c.get("sessionId") !== undefined;

    return c.html(
        <BaseLayout>
            <div>
                <title>Deno 💛 Hateoas</title>
                <img
                    src="/assets/static/images/dinotocat.png"
                    alt="Dinotocat"
                    height="200"
                    style="mix-blend-mode: multiply;"
                />
                {!isSignedIn ? (
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
                {isSignedIn && (
                    <div>
                        <Counter value={0} />
                    </div>
                )}
            </div>
        </BaseLayout>
    );
};

/*
 normal       |
  multiply     |
  screen       |
  overlay      |
  darken       |
  lighten      |
  color-dodge  |
  color-burn   |
  hard-light   |
  soft-light   |
  difference   |
  exclusion    |
  hue          |
  saturation   |
  color        |
  luminosity  
*/