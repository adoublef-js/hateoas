import { h, Helmet } from "deps";

type HeaderProps = {
    title?: string;
};

export const Header = (props: HeaderProps) => (
    <Helmet>
        <title>{props.title}</title>
        {/* <meta
        name="description"
        content="Server Side Rendered Nano JSX Application"
    /> */}
    </Helmet>
);
