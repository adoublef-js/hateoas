import { Component, h, Fragment, Helmet } from "deps";

type BaseLayoutProps = {
    title?: string;
    children: Component | Component[];
};

export function BaseLayout(props: BaseLayoutProps) {
    // add css styling
    return (
        <>
            <Helmet>
                <title>{props.title}</title>
            </Helmet>
            {props.children}
        </>
    );
}
