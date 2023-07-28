import { Hono, signIn, handleCallback, signOut } from "deps";
import { oauth2Client, logoutUrl } from "lib/oauth.ts";

export const iam = new Hono();

iam.get("/signin", async (c) => {
    const response = await signIn(c.req.raw, oauth2Client);

    c.header("set-cookie", response.headers.getSetCookie()[0]);
    return c.redirect(response.headers.get("location")!, response.status);
});

iam.get("/callback", async (c) => {
    const { response } = await handleCallback(c.req.raw, oauth2Client);

    c.header("set-cookie", response.headers.getSetCookie()[0]);
    return c.redirect(response.headers.get("location")!, response.status);
});

iam.get("/signout", async (c) => {
    const response = await signOut(c.req.raw, logoutUrl.toString());
    return c.redirect(response.headers.get("location")!, response.status);
});
