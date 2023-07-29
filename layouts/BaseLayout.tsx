/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from "deps";
import { Header, Footer } from "components/page/mod.ts";

type BaseLayoutProps = {
    children?: string[] | string | null;
};

// NOTE cheaper to render this as a html string?
export const BaseLayout = ({ children }: BaseLayoutProps) => {
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
                <link rel="stylesheet" href="/assets/static/styles/reset.css" />
                <link
                    rel="stylesheet"
                    href="/assets/static/styles/global.css"
                />
                <script src="https://unpkg.com/htmx.org@1.9.3"></script>
                <script src="https://unpkg.com/htmx.org/dist/ext/disable-element.js"></script>
            </head>
            <body class="wrapper flow">
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
};
