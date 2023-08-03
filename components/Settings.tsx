import { Html, SiteData } from "components/layouts/Html.tsx";
import { Header, Footer } from "components/base/mod.ts";

type SettingsProps = SiteData;

export function Settings(props: SettingsProps) {
    return (
        <Html {...props.siteData}>
            <Header />
            <main class="wrapper flow">
                <header>
                    <h1>Settings 👋🏿</h1>
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
