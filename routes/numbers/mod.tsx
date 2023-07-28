/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono, jsx } from "deps";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";
import { setAccessToken, setSessionId } from "lib/iam.ts";
import { Status } from "https://deno.land/x/deno_kv_oauth@v0.2.8/deps.ts";

export const numbers = new Hono<AppEnv>();

numbers.get("/:value", setSessionId(), setAccessToken(), (c) => {
    if (!c.get("accessToken")) {
        return c.redirect("/", Status.Found);
    }

    return c.html(<Counter value={parseInt(c.req.param("value"))} />);
});
