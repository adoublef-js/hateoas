import { Handler, signIn } from "deps";
import { IamEnv } from "./types.ts";

export function handleSignIn(): Handler<IamEnv> {
    return async ({ req, get, header, redirect }) => {
        const { aud, client } = get("iam");
        const response = await signIn(req.raw, client, {
            urlParams: { audience: aud?.join(",")! },
        });

        header("set-cookie", response.headers.get("set-cookie")!);
        return redirect(response.headers.get("location")!, response.status);
    };
}
