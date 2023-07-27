import { h, Router, Status } from "deps";
import { Counter } from "./components/Counter.tsx";
import { template, component } from "./html.tsx";
import { BaseLayout } from "./layouts/BaseLayout.tsx";

export const htmlRouter = new Router();

htmlRouter.get(
    "/",
    template((_) => (
        <BaseLayout title="Counter Example">
            <Counter value={0} />
            <Counter value={0} />
        </BaseLayout>
    ))
);

htmlRouter.get(
    "/numbers/:value",
    component((ctx) => <Counter value={parseInt(ctx.params.value)} />)
);

htmlRouter.get("/numbers/:value/successor", (ctx) => {
    const value = Number(ctx.params.value);

    ctx.response.status = Status.SeeOther;
    ctx.response.headers.set("Location", `/numbers/${value + 1}`);
});
