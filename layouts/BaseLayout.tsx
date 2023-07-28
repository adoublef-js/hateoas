/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from "deps";
import { Header, Footer } from "components/page/mod.ts";

export const BaseLayout = (props: { children?: string[] | string | null }) => {
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
