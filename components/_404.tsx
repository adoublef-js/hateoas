import { Html, SiteData } from "components/layouts/Html.tsx";
import { Header, Footer } from "components/base/mod.ts";

type NotFoundProps = SiteData;

export function NotFound(props: NotFoundProps) {
    return (
        <Html {...props.siteData}>
            <Header />
            <main>
                <p>There was an error in your request 🥹</p>
            </main>
            <Footer />
        </Html>
    );
}
