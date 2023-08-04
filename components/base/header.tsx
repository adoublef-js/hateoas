import { memo } from "deps";

type HeaderProps = {};

export const Header = memo((props: HeaderProps) => (
    <header>
        <li>
            <a href="https://hateoas.adoublef.dev">
                <small>brand logo</small>
            </a>
        </li>
    </header>
));
