import { memo } from "deps";

type HeaderProps = {};

export const Header = memo((props: HeaderProps) => (
    <header>Welcome to Hono</header>
));
