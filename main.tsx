/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono } from "https://deno.land/x/hono@v3.3.4/mod.ts";
import { jsx, memo } from "https://deno.land/x/hono@v3.3.4/middleware.ts";
import {
    createAuth0OAuth2Client,
    getSessionAccessToken,
    getSessionId,
    handleCallback,
    signIn,
    signOut,
} from "https://deno.land/x/deno_kv_oauth@v0.2.8/mod.ts";

/* OAUTH2 */

const oauth2Client = createAuth0OAuth2Client({
    redirectUri: `${Deno.env.get("APP_URL")}/callback`,
    defaults: {
        scope: "openid profile",
    },
});

export const logoutUrl = new URL(
    `https://${Deno.env.get("AUTH0_DOMAIN")}/v2/logout`
);
logoutUrl.searchParams.append("returnTo", Deno.env.get("APP_URL")!);
logoutUrl.searchParams.append("client_id", Deno.env.get("AUTH0_CLIENT_ID")!);

/* COMPONENTS */

type CounterProps = {
    value: number;
};

const Counter = ({ value }: CounterProps) => {
    return (
        <div hx-target="this" hx-swap="outerHTML">
            <p>counter value {value}</p>
            <button hx-get={`/number/${value + 1}`}>increment</button>
        </div>
    );
};

const Header = memo(() => <header>Welcome to Hono</header>);
const Footer = memo(() => <footer>Powered by Hono</footer>);

const BaseLayout = (props: { children?: string[] | string | null }) => {
    return (
        <html>
            <head>
                <meta
                    http-equiv="Content-Type"
                    content="text/html;charset=UTF-8"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <script src="https://unpkg.com/htmx.org@1.9.3"></script>
            </head>
            <Header />
            <body>{props.children}</body>
            <Footer />
        </html>
    );
};

/* APP ROUTER */

const app = new Hono();

app.get("/", async (c) => {
    const sessionId = await getSessionId(c.req.raw);
    const isSignedIn = sessionId !== undefined;
    const accessToken = isSignedIn
        ? await getSessionAccessToken(oauth2Client, sessionId)
        : null;

    return c.html(
        <BaseLayout>
            <div>
                <title>Deno 💛 Hateoas</title>
                {accessToken === null ? (
                    <div>
                        <p>Please log in 🤔</p>
                        <a href="/signin">Sign in</a>
                    </div>
                ) : (
                    <div>
                        <p>Thank you for signing up! 😊</p>
                        <a href="/signout">Sign out</a>
                    </div>
                )}
                {accessToken && (
                    <div>
                        <Counter value={0} />
                    </div>
                )}
            </div>
        </BaseLayout>
    );
});

app.get("/number/:value", (c) => {
    return c.html(<Counter value={parseInt(c.req.param("value"))} />);
});

app.post("/clicked", (c) => c.html(<div>I'm from the server!</div>));

app.get("/signin", async (c) => {
    const response = await signIn(c.req.raw, oauth2Client);

    c.header("set-cookie", response.headers.getSetCookie()[0]);
    return c.redirect(response.headers.get("location")!, response.status);
});

app.get("/callback", async (c) => {
    const { response } = await handleCallback(c.req.raw, oauth2Client);

    c.header("set-cookie", response.headers.getSetCookie()[0]);
    return c.redirect(response.headers.get("location")!, response.status);
});

app.get("/signout", async (c) => {
    const response = await signOut(c.req.raw, logoutUrl.toString());
    return c.redirect(response.headers.get("location")!, response.status);
});

const port = Number(Deno.env.get("PORT"));
Deno.serve({ port }, app.fetch);
