import { Component, Helmet, h } from "deps";

type HomeProps = {
    children: Component;
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
            {children}
        </div>
    );
};
