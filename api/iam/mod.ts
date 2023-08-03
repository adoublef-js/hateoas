import { Hono, signIn, handleCallback, signOut } from "deps";
import { IamEnv } from "lib/app_env.ts";

export const iam = new Hono<IamEnv>();

iam.get("/signin", async ({ req, get, header, redirect }) => {
    const { aud, client } = get("iam");
    const response = await signIn(req.raw, client, {
        urlParams: { audience: aud?.join(",")! },
    });

    header("set-cookie", response.headers.get("set-cookie")!);
    return redirect(response.headers.get("location")!, response.status);
});

iam.get("/callback", async ({ req, get, header, redirect }) => {
    const { client } = get("iam");
    const { response } = await handleCallback(req.raw, client);

    header("set-cookie", response.headers.get("set-cookie")!);
    return redirect(response.headers.get("location")!, response.status);
});

iam.get("/signout", async ({ req, get, header, redirect }) => {
    const { logoutUrl } = get("iam");
    const response = await signOut(req.raw, logoutUrl.toString());

    header("set-cookie", response.headers.get("set-cookie")!);
    return redirect(response.headers.get("location")!, response.status);
});
