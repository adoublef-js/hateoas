/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono, jsx } from "deps";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";
import { authorization } from "lib/iam.tsx";

export const counters = new Hono<AppEnv>();

counters.get("/:value", authorization(), ({ req, html }) => {
    return html(<Counter value={parseInt(req.param("value"))} />);
});
