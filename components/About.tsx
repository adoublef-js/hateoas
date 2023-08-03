import { Html, SiteData } from "components/layouts/Html.tsx";
import { Header, Footer } from "components/base/mod.ts";

type AboutProps = SiteData;

export function About(props: AboutProps) {
    return (
        <Html {...props.siteData}>
            <Header />
            <main class="wrapper flow">
                <header>
                    <h1>About</h1>
                </header>
                <section>
                    <div>
                        <a href="/i/signout">Sign out</a>
                    </div>
                </section>
            </main>
            <Footer />
        </Html>
    );
}
