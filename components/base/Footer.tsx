/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, memo } from "deps";

type FooterProps = {};

export const Footer = memo((props: FooterProps) => (
    <footer>
        <small>Powered by Hono</small>
        <ul>
            <li>
                <a href="https://github.com/adoublef-js/hateoas">Github</a>
            </li>
            <li>
                <a href="https://hateoas.adoublef.dev">Home</a>
            </li>
        </ul>
    </footer>
));
