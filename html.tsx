import {
    Component,
    h,
    Helmet,
    renderSSR,
    RouteParams,
    RouterContext,
    RouterMiddleware,
    State,
} from "deps";

export function component<R extends string, S extends State>(
    callback: (ctx: RouterContext<R>) => Promise<Component>
): RouterMiddleware<R, RouteParams<R>, S> {
    return async (ctx) => serveJsx(ctx, await callback(ctx));
}

function serveJsx<R extends string>(
    ctx: RouterContext<R>,
    component: Component
) {
    return (ctx.response.body = renderSSR(component));
}

export function template<R extends string, S extends State>(
    callback: (ctx: RouterContext<R>) => Promise<Component>
): RouterMiddleware<R, RouteParams<R>, S> {
    return async (ctx) => serveHtml(ctx, await callback(ctx));
}

function serveHtml<R extends string>(
    ctx: RouterContext<R>,
    component: Component
): string {
    const { body, head, footer } = Helmet.SSR(renderSSR(component));

    const html = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${head.join("\n")}
                <script src="https://unpkg.com/htmx.org@1.9.4"></script>
            </head>
            <body>
                ${body}
                ${footer.join("\n")}
            </body>
        </html>
    `;

    return (ctx.response.body = html);
}
