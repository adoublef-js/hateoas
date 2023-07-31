import { HtmlEscapedString, memo } from "deps";
import { Deno, GitHub } from "components/svg/Svg.tsx";

const SVG = ({
    viewBox,
    children,
    ...props
}: {
    viewBox: [number, number, number, number];
    children: HtmlEscapedString | HtmlEscapedString[];
    class?: string;
    styles?: string;
    width?: number;
    height?: number;
}) => (
    <svg
        viewBox={viewBox.join(" ")}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {children}
    </svg>
);

type FooterProps = {};

export const Footer = memo((props: FooterProps) => (
    <footer>
        <small>Powered by Hono</small>
        <ul class="list-hidden">
            <li>
                <a href="https://github.com/adoublef-js/hateoas">
                    <GitHub class="logo github" />
                </a>
            </li>
            <li>
                <a href="https://deno.land/">
                    <Deno class="logo deno" />
                </a>
            </li>
        </ul>
    </footer>
));
