/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, memo } from "deps";

type HeaderProps = {};

export const Header = memo((props: HeaderProps) => (
    <header>Welcome to Hono</header>
));
