import { h, Helmet } from "deps";

type HeaderProps = {
    title?: string;
};

export const Footer = (props: HeaderProps) => (
    <Helmet footer>{/* TODO */}</Helmet>
);
