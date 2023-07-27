import { Router, h } from "deps";
import { Counter } from "../components/Counter.tsx";
import { template } from "../html.tsx";
import { BaseLayout } from "../layouts/BaseLayout.tsx";

export const appRouter = new Router();

appRouter.get(
    "/",
    template((ctx) => {
        return (
            <BaseLayout title="Counter Example">
                <Counter value={0} />
                <Counter value={0} />
            </BaseLayout>
        );
    })
);
