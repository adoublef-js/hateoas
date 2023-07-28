/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono, jsx } from "deps";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";

export const numbers = new Hono<AppEnv>();

numbers.get("/:value", (c) => {
    // TODO get jwt token and validate

    return c.html(<Counter value={parseInt(c.req.param("value"))} />);
});
