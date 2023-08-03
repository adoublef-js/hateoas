import { LibSqlClient, MiddlewareHandler } from "deps";
import { AppEnv } from "lib/app_env.ts";

export function database(c: LibSqlClient): MiddlewareHandler<AppEnv> {
    return async ({ set }, next) => {
        set("db", c);
        await next();
    };
}
