import { h, Fragment, Helmet, Router, Status } from "deps";
import { Counter } from "./components/Counter.tsx";
import { template, component } from "./html.tsx";
import { Header } from "./components/Header.tsx";

export const htmlRouter = new Router();

htmlRouter.get(
    "/",
    template((_) => (
        <>
            <Header title="Counter Example" />
            <Counter value={0} />
            <Counter value={0} />
        </>
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
