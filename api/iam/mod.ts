import { Hono, signIn, handleCallback, signOut } from "deps";
import { OAuth2Env } from "lib/app_env.ts";

export const iam = new Hono<OAuth2Env>();

iam.get("/signin", async ({ req, get, header, redirect }) => {
    const response = await signIn(req.raw, get("oauth2").client);

    header("set-cookie", response.headers.getSetCookie()[0]);
    return redirect(response.headers.get("location")!, response.status);
});

iam.get("/callback", async ({ req, get, header, redirect }) => {
    const { response } = await handleCallback(req.raw, get("oauth2").client);

    header("set-cookie", response.headers.getSetCookie()[0]);
    return redirect(response.headers.get("location")!, response.status);
});

iam.get("/signout", async ({ req, get, header, redirect }) => {
    const { logoutUrl } = get("oauth2");
    const response = await signOut(req.raw, logoutUrl.toString());

    header("set-cookie", response.headers.getSetCookie()[0]);
    return redirect(response.headers.get("location")!, response.status);
});
