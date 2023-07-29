import { Env, Hono } from "deps";

export function createPage<
    E extends Env = Env,
    S = {},
    BasePath extends string = "/"
>(...handlers: Parameters<Hono<E, S, BasePath>["get"]>[1][]) {
    return new Hono<E, S, BasePath>().get("/", ...handlers);
}
