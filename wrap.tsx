import { Context } from "deps";

/**
 * This is required for Oak to convert between web-standard
 * and Oak `Request` and `Response` interfaces.
 *
 * @see {@link https://github.com/oakserver/oak/issues/533}
 */
export async function wrap(
    ctx: Context,
    fn: (request: Request) => Promise<Response>
) {
    const req = new Request(ctx.request.url.toString(), {
        body: ctx.request.originalRequest.getBody().body,
        headers: ctx.request.headers,
        method: ctx.request.method,
    });

    const response = await fn(req);

    ctx.response.status = response.status;
    ctx.response.headers = response.headers;
    ctx.response.body = response.body;
}
