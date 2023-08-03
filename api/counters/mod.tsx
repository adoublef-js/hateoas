import { Hono } from "deps";
import { Counter } from "components/counter/Counter.tsx";
import { AppEnv } from "lib/app_env.ts";
import { accessToken, authorized } from "api/iam/middleware.ts";
import { getCount } from "api/counters/dao.ts";
// import { accessToken } from "lib/iam.tsx";

export const counters = new Hono<AppEnv>();

counters.get(
    "/:value",
    authorized("write:profile"),
    async ({ req, html, get }) => {
        const param = parseInt(req.param("value"));
        const value = await getCount(get("db"), isNaN(param) ? 0 : param);

        return html(<Counter value={value} />);
    }
);
