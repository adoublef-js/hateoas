import { h, Router, Status } from "deps";
import { Counter } from "./components/Counter.tsx";
import { handleHtml } from "./html.tsx";
import { Page } from "./components/Home.tsx";

export const htmlRouter = new Router();

htmlRouter.get(
    "/",
    handleHtml((_) => (
        <Page>
            <Counter value={0} />
        </Page>
    ))
);

htmlRouter.get(
    "/numbers/:value",
    handleHtml((ctx) => <Counter value={parseInt(ctx.params.value)} />)
);

htmlRouter.get("/numbers/:value/successor", (ctx) => {
    const value = Number(ctx.params.value);

    ctx.response.status = Status.SeeOther;
    ctx.response.headers.set("Location", `/numbers/${value + 1}`);
});
