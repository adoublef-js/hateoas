import { Hono } from "deps";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";
import { authorization } from "lib/iam.tsx";

export const counters = new Hono<AppEnv>();

counters.get("/:value", authorization(), async ({ req, html, get }) => {
    const value = parseInt(req.param("value"));
    const rs = await get("dbClient").execute({
        sql: "SELECT ?",
        args: [value],
    });

    return html(<Counter value={Number(rs.rows[0][0])} />);
});
