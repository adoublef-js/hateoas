import { Component, Helmet, h } from "deps";

type HomeProps = {
    children: Component | Component[];
};

export const Page = ({ children }: HomeProps) => {
    return (
        <div>
            <Helmet>
                <title>Nano JSX SSR</title>
                <meta
                    name="description"
                    content="Server Side Rendered Nano JSX Application"
                />
            </Helmet>
            <h1>This is a document</h1>
            {children}
        </div>
    );
};
