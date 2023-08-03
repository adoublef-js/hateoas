import { Hono, Status } from "deps";
import { authorized } from "api/iam/middleware.ts";
import { setProfile } from "api/profiles/dao.ts";
import { AppEnv } from "lib/app_env.ts";

export const profiles = new Hono<AppEnv>();

profiles.post("/", authorized("write:profile"), async ({ get, redirect }) => {
    // check if token exists
    const [{ payload }, db] = [get("accessToken")!, get("db")];
    await setProfile(db, { user: payload.sub! });

    // https://htmx.org/reference/#response_headers
    return redirect("/", Status.Found);
});
