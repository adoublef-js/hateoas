/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono, jsx } from "deps";
import { Counter } from "components/counter/Counter.tsx";

export const numbers = new Hono();

numbers.get("/:value", (c) => {
    return c.html(<Counter value={parseInt(c.req.param("value"))} />);
});
