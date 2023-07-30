import { html } from "deps";
import { Component } from "components/component.ts";

export type LayoutProps = {
    title?: string;
    // add more options later
    lang?: "en";
    children?: Component | Component[];
};

export const Layout = (props: LayoutProps) => html`<!DOCTYPE html>
    <html>
        <head lang="${props.lang ?? "en"}">
            <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <title>${props.title}</title>
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
            <link rel="icon" href="/favicon.ico" sizes="32x32" />
            <link rel="icon" href="/icon.svg" type="image/svg+xml" />
            <link rel="stylesheet" href="/reset.css" />
            <link rel="stylesheet" href="/styles.css" />
            <script src="https://unpkg.com/htmx.org@1.9.3"></script>
            <script src="https://unpkg.com/htmx.org/dist/ext/disable-element.js"></script>
        </head>
        <body class="main-layout">
            ${props.children}
        </body>
    </html>`;

export type SiteData<T extends Record<string, unknown> = {}> = {
    siteData: LayoutProps;
} & T;

export const Html = ({
    children,
    ...siteData
}: {
    children?: Component | Component[];
} & LayoutProps) => <Layout {...siteData}>{children}</Layout>;
