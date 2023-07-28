/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, memo } from "deps";

export const Footer = memo(() => (
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
