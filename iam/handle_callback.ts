import { Handler, handleCallback as callback } from "deps";
import { IamEnv } from "./types.ts";

export function handleCallback(): Handler<IamEnv> {
    return async ({ req, get, header, redirect }) => {
        const { client } = get("iam");
        const { response } = await callback(req.raw, client);

        header("set-cookie", response.headers.get("set-cookie")!);
        return redirect(response.headers.get("location")!, response.status);
    };
}
