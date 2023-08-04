import { Handler, signOut } from "deps";
import { IamEnv } from "./types.ts";

export function handleSignOut(): Handler<IamEnv> {
    return async ({ req, get, header, redirect }) => {
        const { logoutUrl } = get("iam");
        const response = await signOut(req.raw, logoutUrl.toString());

        header("set-cookie", response.headers.get("set-cookie")!);
        return redirect(response.headers.get("location")!, response.status);
    };
}
