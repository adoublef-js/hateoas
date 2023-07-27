import { Application } from "deps";
import { htmlRouter } from "./routes.tsx";

export function add(a: number, b: number): number {
    return a + b;
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
    const app = new Application();

    app.use(htmlRouter.allowedMethods(), htmlRouter.routes());

    // TODO: server islands

    app.addEventListener("listen", ({ port }) => {
        console.log(`Listening on: http://localhost:${port}`);
    });

    await app.listen({ port: 5000 });
}
