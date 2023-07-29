import { Header, Footer } from "components/base/mod.ts";

type BaseLayoutProps = {
    title?: string;
    children?: string[] | string | null;
};

// NOTE cheaper to render this as a html string?
export const BaseLayout = ({ children, title }: BaseLayoutProps) => {
    return (
        <html lang="en">
            <head>
                <meta
                    http-equiv="Content-Type"
                    content="text/html;charset=UTF-8"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>{title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100&family=Open+Sans:wght@300&display=swap"
                />
                <link rel="stylesheet" href="/reset.css" />
                <link rel="stylesheet" href="/styles.css" />
                <script src="https://unpkg.com/htmx.org@1.9.3"></script>
                <script src="https://unpkg.com/htmx.org/dist/ext/disable-element.js"></script>
            </head>
            <Header />
            <body class="wrapper flow">{children}</body>
            <Footer />
        </html>
    );
};
