/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono, jsx } from "deps";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";
import { setAccessToken, setSessionId } from "lib/iam.ts";

export const numbers = new Hono<AppEnv>();

numbers.get("/:value", setAccessToken(), ({ html, req }) => {
    return html(<Counter value={parseInt(req.param("value"))} />);
});
