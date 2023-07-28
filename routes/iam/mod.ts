import { Hono, signIn, handleCallback, signOut } from "deps";
import { Oauth2Variables } from "lib/oauth.ts";

export const iam = new Hono<{ Variables: Oauth2Variables }>();

iam.get("/signin", async (c) => {
    const response = await signIn(c.req.raw, c.get("oauth2").client);

    c.header("set-cookie", response.headers.getSetCookie()[0]);
    return c.redirect(response.headers.get("location")!, response.status);
});

iam.get("/callback", async (c) => {
    const { response } = await handleCallback(
        c.req.raw,
        c.get("oauth2").client
    );

    c.header("set-cookie", response.headers.getSetCookie()[0]);
    return c.redirect(response.headers.get("location")!, response.status);
});

iam.get("/signout", async (c) => {
    const response = await signOut(
        c.req.raw,
        c.get("oauth2").logoutUrl.toString()
    );
    return c.redirect(response.headers.get("location")!, response.status);
});
