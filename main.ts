import { Application } from "deps";
import { appRouter } from "./routes/mod.tsx";
import { numbersRouter } from "./routes/numbers/mod.tsx";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
    const server = new Application();

    server.use(appRouter.routes());
    server.use(numbersRouter.routes());

    // TODO: server islands

    server.addEventListener("listen", ({ port }) => {
        console.log(`Listening on: http://localhost:${port}`);
    });

    await server.listen({ port: 5000 });
}
