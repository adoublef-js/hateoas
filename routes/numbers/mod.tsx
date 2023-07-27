import { Router, Status, h } from "deps";
import { Counter } from "../../components/Counter.tsx";
import { component } from "../../html.tsx";

export const numbersRouter = new Router({ prefix: "/numbers" });

numbersRouter.get(
    "/:value",
    component((ctx) => <Counter value={parseInt(ctx.params.value)} />)
);

numbersRouter.get("/:value/successor", (ctx) => {
    const value = Number(ctx.params.value);

    ctx.response.status = Status.SeeOther;
    ctx.response.headers.set("Location", `/numbers/${value + 1}`);
});
