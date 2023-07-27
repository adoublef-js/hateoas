import { h, Helmet } from "deps";

type HeaderProps = {
    title?: string;
};

export const Head = (props: HeaderProps) => (
    <Helmet>
        <title>{props.title}</title>
    </Helmet>
);
